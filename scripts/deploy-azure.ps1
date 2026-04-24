param(
  [string]$ResourceGroup = "br-south-rm99781",
  [string]$ContainerApp = "fast-lock-monolito",
  [string]$ImageRepository = "pbrnx/fast-lock",
  [string]$RegistryName = "",
  [string]$RegistryLoginServer = "docker.io",
  [string]$Version = "",
  [string]$LatestVersion = "",
  [string]$Platform = "linux/amd64",
  [switch]$SkipQualityGate,
  [switch]$SkipPush,
  [switch]$WhatIfDeploy
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Bun = Join-Path $env:USERPROFILE ".bun\bin\bun.exe"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Info {
  param([string]$Message)
  Write-Host "    $Message" -ForegroundColor DarkGray
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$WorkingDirectory = $RepoRoot
  )

  Write-Info "$FilePath $($Arguments -join ' ')"
  $process = Start-Process `
    -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -NoNewWindow `
    -Wait `
    -PassThru

  if ($process.ExitCode -ne 0) {
    throw "Command failed with exit code $($process.ExitCode): $FilePath $($Arguments -join ' ')"
  }
}

function Invoke-Json {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$WorkingDirectory = $RepoRoot
  )

  Write-Info "$FilePath $($Arguments -join ' ')"
  $output = & $FilePath @Arguments 2>&1

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $output"
  }

  $text = ($output | Out-String).Trim()

  if (-not $text) {
    return $null
  }

  return $text | ConvertFrom-Json
}

function Get-CommandPath {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue

  if (-not $command) {
    throw "'$Name' was not found in PATH."
  }

  return $command.Source
}

function Test-PackageScript {
  param(
    [Parameter(Mandatory = $true)][string]$PackageDirectory,
    [Parameter(Mandatory = $true)][string]$ScriptName
  )

  $packagePath = Join-Path $PackageDirectory "package.json"

  if (-not (Test-Path $packagePath)) {
    return $false
  }

  $packageJson = Get-Content $packagePath -Raw | ConvertFrom-Json
  return [bool]($packageJson.scripts.PSObject.Properties.Name -contains $ScriptName)
}

function Normalize-Version {
  param([string]$Value)

  $normalized = $Value.Trim()

  if (-not $normalized) {
    return ""
  }

  if ($normalized.StartsWith("v")) {
    $normalized = $normalized.Substring(1)
  }

  if ($normalized -notmatch "^\d+\.\d+(\.\d+)?$") {
    throw "Version must look like 1.12, 1.12.3, v1.12, or v1.12.3."
  }

  return "v$normalized"
}

function Resolve-ContainerAppImage {
  param([string]$AzPath)

  $app = Invoke-Json $AzPath @(
    "containerapp", "show",
    "--name", $ContainerApp,
    "--resource-group", $ResourceGroup,
    "--output", "json"
  )

  $image = $app.properties.template.containers[0].image

  if (-not $image) {
    throw "Could not resolve current container image from Azure Container App."
  }

  return $image
}

function Resolve-RegistryFromImage {
  param([string]$Image)

  $firstSlash = $Image.IndexOf("/")

  if ($firstSlash -lt 1) {
    return $null
  }

  $candidate = $Image.Substring(0, $firstSlash)

  if ($candidate -notmatch "\.") {
    return $null
  }

  return $candidate
}

function Resolve-RepositoryFromImage {
  param([string]$Image)

  $firstSlash = $Image.IndexOf("/")

  if ($firstSlash -lt 1) {
    return $Image.Split(":")[0]
  }

  $withoutRegistry = $Image.Substring($firstSlash + 1)
  return $withoutRegistry.Split(":")[0]
}

function Get-NextVersion {
  param(
    [string]$AzPath,
    [string]$AcrName,
    [string]$Repository
  )

  if ($Version) {
    return Normalize-Version $Version
  }

  if ($LatestVersion) {
    $latestVersionTag = Normalize-Version $LatestVersion
    $latestParts = $latestVersionTag.Substring(1).Split(".")
    return "v$($latestParts[0]).$([int]$latestParts[1] + 1)"
  }

  $fallback = "v1.12"
  $tags = @()

  if ($RegistryLoginServer -eq "docker.io") {
    try {
      $dockerHubUrl = "https://hub.docker.com/v2/repositories/$Repository/tags?page_size=100"
      $dockerHubResponse = Invoke-RestMethod -Method Get -Uri $dockerHubUrl
      $tags = @($dockerHubResponse.results.name | Where-Object { $_ -match "^v?\d+\.\d+(\.\d+)?$" })
    } catch {
      $tags = @()
    }
  } elseif ($AcrName) {
    try {
      $rawTags = & $AzPath acr repository show-tags --name $AcrName --repository $Repository --output tsv 2>$null

      if ($LASTEXITCODE -eq 0 -and $rawTags) {
        $tags = @($rawTags | Where-Object { $_ -match "^v?\d+\.\d+(\.\d+)?$" })
      }
    } catch {
      $tags = @()
    }
  }

  if (-not $tags.Count) {
    return $fallback
  }

  $latest = $tags |
    ForEach-Object {
      $tag = Normalize-Version $_
      $parts = $tag.Substring(1).Split(".")
      [pscustomobject]@{
        Tag = $tag
        Major = [int]$parts[0]
        Minor = [int]$parts[1]
        Patch = if ($parts.Count -gt 2) { [int]$parts[2] } else { -1 }
      }
    } |
    Sort-Object Major, Minor, Patch -Descending |
    Select-Object -First 1

  return "v$($latest.Major).$($latest.Minor + 1)"
}

function New-ImageReference {
  param(
    [Parameter(Mandatory = $true)][string]$Registry,
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$Tag
  )

  if ($Registry -eq "docker.io") {
    return "${Repository}:${Tag}"
  }

  return "${Registry}/${Repository}:${Tag}"
}

function Show-AzureResult {
  param([string]$AzPath)

  $app = Invoke-Json $AzPath @(
    "containerapp", "show",
    "--name", $ContainerApp,
    "--resource-group", $ResourceGroup,
    "--query", "{name:name, image:properties.template.containers[0].image, fqdn:properties.configuration.ingress.fqdn, latestRevisionName:properties.latestRevisionName, latestRevisionState:properties.latestRevisionState, provisioningState:properties.provisioningState}",
    "--output", "json"
  )

  Write-Host ""
  Write-Host "Azure Container App updated:" -ForegroundColor Green
  $app | ConvertTo-Json -Depth 10

  Write-Host ""
  Write-Host "Recent revisions:" -ForegroundColor Green
  & $AzPath containerapp revision list `
    --name $ContainerApp `
    --resource-group $ResourceGroup `
    --query "[0:5].{name:name, active:properties.active, trafficWeight:properties.trafficWeight, createdTime:properties.createdTime, runningState:properties.runningState, provisioningState:properties.provisioningState}" `
    --output table
}

Write-Step "Checking local tools"
$Az = Get-CommandPath "az"
$Docker = Get-CommandPath "docker"

if (-not (Test-Path $Bun)) {
  $Bun = Get-CommandPath "bun"
}

Write-Info "Azure CLI: $Az"
Write-Info "Docker: $Docker"
Write-Info "Bun: $Bun"

if (-not $SkipQualityGate) {
  $BackendDir = Join-Path $RepoRoot "backend"
  $FrontendDir = Join-Path $RepoRoot "frontend"

  Write-Step "Running backend typecheck"
  Invoke-Checked $Bun @("run", "typecheck") $BackendDir

  if (Test-PackageScript $BackendDir "build") {
    Write-Step "Running backend build"
    Invoke-Checked $Bun @("run", "build") $BackendDir
  } else {
    Write-Info "Backend has no package.json build script; Docker build will validate packaging."
  }

  Write-Step "Running frontend build"
  Invoke-Checked $Bun @("run", "build") $FrontendDir
}

Write-Step "Resolving Azure image target"
$currentImage = Resolve-ContainerAppImage $Az
Write-Info "Current Azure image: $currentImage"

if (-not $RegistryLoginServer) {
  $RegistryLoginServer = Resolve-RegistryFromImage $currentImage
}

if (-not $RegistryLoginServer) {
  throw "Could not infer registry login server. Pass -RegistryLoginServer, for example myregistry.azurecr.io."
}

if (-not $RegistryName -and $RegistryLoginServer.EndsWith(".azurecr.io")) {
  $RegistryName = $RegistryLoginServer.Replace(".azurecr.io", "")
}

if (-not $ImageRepository) {
  $ImageRepository = Resolve-RepositoryFromImage $currentImage
}

$versionTag = Get-NextVersion $Az $RegistryName $ImageRepository
$versionedImage = New-ImageReference $RegistryLoginServer $ImageRepository $versionTag
$latestImage = New-ImageReference $RegistryLoginServer $ImageRepository "latest"

Write-Info "Registry: $RegistryLoginServer"
Write-Info "Repository: $ImageRepository"
Write-Info "Version: $versionTag"
Write-Info "Platform: $Platform"

Write-Step "Building Docker image"
Invoke-Checked $Docker @(
  "build",
  "--platform", $Platform,
  "-t", $latestImage,
  "-t", $versionedImage,
  "."
) $RepoRoot

if (-not $SkipPush) {
  if ($RegistryLoginServer -eq "docker.io") {
    Write-Info "Using Docker Hub repository. Make sure 'docker login' is authenticated for pbrnx."
  } elseif ($RegistryName) {
    Write-Step "Logging in to Azure Container Registry"
    Invoke-Checked $Az @("acr", "login", "--name", $RegistryName) $RepoRoot
  } else {
    Write-Info "Registry is not an Azure Container Registry login server; skipping az acr login."
  }

  Write-Step "Pushing Docker tags"
  Invoke-Checked $Docker @("push", $versionedImage) $RepoRoot
  Invoke-Checked $Docker @("push", $latestImage) $RepoRoot
}

Write-Step "Updating Azure Container App"
if ($WhatIfDeploy) {
  Write-Host "WhatIf: az containerapp update --name $ContainerApp --resource-group $ResourceGroup --image $versionedImage" -ForegroundColor Yellow
} else {
  Invoke-Checked $Az @(
    "containerapp", "update",
    "--name", $ContainerApp,
    "--resource-group", $ResourceGroup,
    "--image", $versionedImage
  ) $RepoRoot

  Show-AzureResult $Az
}
