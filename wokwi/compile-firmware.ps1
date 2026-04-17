$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path $PSScriptRoot -Parent
$wokwiDir = $PSScriptRoot
$tempSketchDir = Join-Path $wokwiDir 'compile_tmp'
$buildDir = Join-Path $wokwiDir 'build'
$sourceSketch = Join-Path $wokwiDir 'sketch.ino'
$tempSketch = Join-Path $tempSketchDir 'compile_tmp.ino'

$arduinoCli = (Get-Command arduino-cli -ErrorAction SilentlyContinue).Source
if (-not $arduinoCli) {
  $fallbackCli = 'C:\Program Files\Arduino CLI\arduino-cli.exe'
  if (Test-Path $fallbackCli) {
    $arduinoCli = $fallbackCli
  } else {
    throw 'arduino-cli nao encontrado. Instale com: winget install --id ArduinoSA.CLI --accept-package-agreements --accept-source-agreements'
  }
}

Write-Host "Usando arduino-cli em: $arduinoCli"

# Garante fonte do core ESP32 no Arduino CLI (idempotente)
$esp32Index = 'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json'
$currentUrls = & $arduinoCli config get board_manager.additional_urls 2>$null
if ($currentUrls -notmatch [regex]::Escape($esp32Index)) {
  & $arduinoCli config add board_manager.additional_urls $esp32Index
}

# Garante core e bibliotecas necessarias
& $arduinoCli core update-index
& $arduinoCli core install esp32:esp32
& $arduinoCli lib install ArduinoJson
& $arduinoCli lib install ESP32Servo
& $arduinoCli lib install 'LiquidCrystal I2C'

New-Item -ItemType Directory -Path $tempSketchDir -Force | Out-Null
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
Copy-Item $sourceSketch $tempSketch -Force

& $arduinoCli compile --fqbn esp32:esp32:esp32 --output-dir $buildDir $tempSketchDir

Copy-Item (Join-Path $buildDir 'compile_tmp.ino.bin') (Join-Path $wokwiDir 'firmware.bin') -Force
Copy-Item (Join-Path $buildDir 'compile_tmp.ino.elf') (Join-Path $wokwiDir 'firmware.elf') -Force

Write-Host ''
Write-Host 'Build concluido.'
Write-Host "Atualizado: $(Join-Path $wokwiDir 'firmware.bin')"
Write-Host "Atualizado: $(Join-Path $wokwiDir 'firmware.elf')"
