<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <!-- Outer wrapper: wider on choose step, narrower on other steps -->
    <div :class="currentStep === 'choose' ? 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-3xl px-4 sm:px-6'">

      <!-- ── Stepper ── -->
      <div class="mb-8 flex items-center justify-center gap-1.5 flex-wrap">
        <div v-for="(step, index) in steps" :key="step.key" class="flex items-center gap-1.5">
          <div
            :class="[
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
              currentStepIndex > index
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : currentStepIndex === index
                  ? 'bg-slate-900 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50'
                  : 'bg-slate-200 text-slate-400'
            ]"
          >
            <svg v-if="currentStepIndex > index" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            v-if="index < steps.length - 1"
            class="hidden h-0.5 w-5 transition-colors duration-300 sm:block"
            :class="currentStepIndex > index ? 'bg-brand-500' : 'bg-slate-200'"
          />
        </div>
      </div>

      <div class="mb-6 text-center">
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{{ steps[currentStepIndex]?.label }}</p>
      </div>

      <!-- ── Step 1: Choose locker ── -->
      <section v-if="currentStep === 'choose'" class="step-content">
        <div class="mb-6 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Mapa de lockers</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Escolha um ponto no mapa</h1>
          <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Encontre um locker livre perto de você. Você também pode escanear o QR Code fixado diretamente no locker.
          </p>
          <!-- QR Code hint -->
          <div class="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <svg class="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Ou escaneie o QR Code no locker físico
          </div>
        </div>

        <div v-if="isLoading" class="flex min-h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col items-center gap-4">
            <BaseSpinner size="xl" color="brand" />
            <p class="text-sm text-slate-500">Carregando localizações...</p>
          </div>
        </div>

        <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
          {{ error }}
        </div>

        <div v-else-if="!locations.length" class="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0zM15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
          </div>
          <h2 class="mt-5 text-xl font-black tracking-tight text-slate-900">Nenhum ponto disponível agora.</h2>
        </div>

        <div v-else class="grid gap-5 lg:grid-cols-[1fr_340px]">
          <!-- Map (full width on mobile, left col on desktop) -->
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <span class="h-2.5 w-2.5 rounded-full bg-brand-600" />Lockers livres
                  </span>
                  <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <span class="h-2.5 w-2.5 rounded-full bg-slate-400" />Ocupados
                  </span>
                </div>
                <!-- Geo status badge -->
                <span
                  v-if="geoStatus !== 'pending'"
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    geoStatus === 'granted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  ]"
                >
                  <span :class="['h-1.5 w-1.5 rounded-full', geoStatus === 'granted' ? 'bg-emerald-500' : 'bg-slate-400']" />
                  {{ geoStatusMsg }}
                </span>
              </div>
              <LockerMap
                data-tour="map"
                :locations="locations"
                :selected-location-id="selectedLocationId"
                :center="mapCenter"
                :fit-to-locations="false"
                height="560px"
                @select-location="selectLocation"
              />
            </div>
          </div>

          <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <template v-if="selectedLocation">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Local selecionado</p>
              <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">{{ selectedLocation.name }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ selectedLocation.address }}</p>

              <!-- Pricing -->
              <div class="mt-4 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 mb-2">Tabela de preços</p>
                <div class="space-y-1 text-xs text-brand-800">
                  <div class="flex justify-between"><span>Taxa de ativação</span><span class="font-bold">{{ formatCents(selectedLocation.initial_fee_cents ?? 500) }}</span></div>
                  <div class="flex justify-between"><span>Locker P · por hora</span><span class="font-bold">{{ formatCents(selectedLocation.hourly_rate_small ?? 500) }}</span></div>
                  <div class="flex justify-between"><span>Locker M · por hora</span><span class="font-bold">{{ formatCents(selectedLocation.hourly_rate_medium ?? 1000) }}</span></div>
                  <div class="flex justify-between"><span>Locker G · por hora</span><span class="font-bold">{{ formatCents(selectedLocation.hourly_rate_large ?? 1500) }}</span></div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Livres</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.free_lockers }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.total_lockers }}</p>
                </div>
              </div>

              <div class="mt-5">
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-sm font-semibold text-slate-900">Lockers disponíveis</p>
                  <span class="text-xs font-medium text-slate-400">{{ availableLockers.length }} opção{{ availableLockers.length === 1 ? '' : 'es' }}</span>
                </div>
                <div v-if="availableLockers.length" class="space-y-2">
                  <button
                    v-for="locker in pagedLockers"
                    :key="locker.id"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md active:scale-[0.98]"
                    @click="selectLocker(locker)"
                  >
                    <div>
                      <p class="font-mono text-sm font-black text-slate-900">{{ locker.code }}</p>
                      <p class="mt-0.5 text-xs font-medium text-slate-400">Tamanho {{ sizeLabel(locker.size) }}</p>
                    </div>
                    <span class="text-sm font-semibold text-brand-600">Alugar →</span>
                  </button>

                  <!-- Load more -->
                  <button
                    v-if="hasMoreLockers"
                    type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                    @click="loadMoreLockers"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                    Ver mais {{ availableLockers.length - pagedLockers.length }} lockers
                  </button>
                </div>
                <div v-else class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Sem lockers livres neste ponto.
                </div>
              </div>
            </template>
            <div v-else class="flex h-full min-h-[200px] items-center justify-center text-center text-sm text-slate-400">
              Selecione um ponto no mapa.
            </div>
          </aside>
        </div>
      </section>

      <!-- ── Step 2: Pay initial fee ── -->
      <section v-if="currentStep === 'pay'" class="step-content">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              </div>
              <div>
                <h2 class="text-xl font-black tracking-tight text-slate-900">Pague a taxa de ativação</h2>
                <p class="mt-1 text-sm text-slate-500">
                  Locker <span class="font-mono font-black text-slate-900">{{ selectedLocker?.code }}</span>
                  · Tamanho {{ sizeLabel(selectedLocker?.size) }}
                </p>
              </div>
            </div>
          </div>

          <div class="px-6 py-6 sm:px-8">
            <!-- Summary -->
            <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 mb-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Local</span>
                <span class="font-semibold text-slate-900">{{ selectedLocation?.name }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa/hora</span>
                <span class="font-semibold text-slate-900">{{ formatCents(lockerHourlyRate) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-700">Taxa de ativação</span>
                  <span class="text-2xl font-black tracking-tight text-slate-900">{{ formatCents(lockerInitialFee) }}</span>
                </div>
              </div>
            </div>

            <!-- QR Code PIX simulado -->
            <div class="flex flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6">
              <p class="mb-3 text-sm font-semibold text-brand-700">Escaneie o QR Code PIX</p>
              <div class="relative">
                <svg viewBox="0 0 120 120" class="w-36 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- QR code pattern simulado -->
                  <rect width="120" height="120" fill="white" rx="6"/>
                  <!-- Corner squares -->
                  <rect x="8" y="8" width="30" height="30" rx="3" fill="#111827"/>
                  <rect x="12" y="12" width="22" height="22" rx="2" fill="white"/>
                  <rect x="16" y="16" width="14" height="14" rx="1" fill="#111827"/>
                  <rect x="82" y="8" width="30" height="30" rx="3" fill="#111827"/>
                  <rect x="86" y="12" width="22" height="22" rx="2" fill="white"/>
                  <rect x="90" y="16" width="14" height="14" rx="1" fill="#111827"/>
                  <rect x="8" y="82" width="30" height="30" rx="3" fill="#111827"/>
                  <rect x="12" y="86" width="22" height="22" rx="2" fill="white"/>
                  <rect x="16" y="90" width="14" height="14" rx="1" fill="#111827"/>
                  <!-- Data modules (padrão simulado) -->
                  <rect x="46" y="8" width="6" height="6" fill="#111827"/>
                  <rect x="56" y="8" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="8" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="16" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="16" width="6" height="6" fill="#111827"/>
                  <rect x="56" y="24" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="56" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="76" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="56" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="56" width="6" height="6" fill="#111827"/>
                  <rect x="76" y="56" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="66" width="6" height="6" fill="#111827"/>
                  <rect x="56" y="66" width="6" height="6" fill="#111827"/>
                  <rect x="76" y="66" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="76" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="76" width="6" height="6" fill="#111827"/>
                  <rect x="46" y="86" width="6" height="6" fill="#111827"/>
                  <rect x="56" y="86" width="6" height="6" fill="#111827"/>
                  <rect x="66" y="86" width="6" height="6" fill="#111827"/>
                  <rect x="76" y="86" width="6" height="6" fill="#111827"/>
                  <rect x="86" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="96" y="56" width="6" height="6" fill="#111827"/>
                  <rect x="86" y="66" width="6" height="6" fill="#111827"/>
                  <rect x="96" y="76" width="6" height="6" fill="#111827"/>
                  <rect x="86" y="86" width="6" height="6" fill="#111827"/>
                  <rect x="96" y="96" width="6" height="6" fill="#111827"/>
                  <rect x="8" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="18" y="46" width="6" height="6" fill="#111827"/>
                  <rect x="28" y="56" width="6" height="6" fill="#111827"/>
                  <rect x="8" y="66" width="6" height="6" fill="#111827"/>
                  <rect x="18" y="76" width="6" height="6" fill="#111827"/>
                  <rect x="28" y="86" width="6" height="6" fill="#111827"/>
                </svg>
              </div>
              <p class="mt-3 text-xs text-slate-500">Chave PIX FastLock · {{ formatCents(lockerInitialFee) }}</p>
            </div>

            <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              🔬 Ambiente de demonstração — nenhuma cobrança real será realizada.
            </div>

            <div v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]" @click="resetFlow">Voltar</button>
              <button id="btn-pagar" type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-900 transition-all duration-200 active:scale-[0.98] disabled:opacity-50" :disabled="isLoading" @click="simulatePayment">
                <BaseSpinner v-if="isLoading" size="sm" color="white" />
                <span>{{ isLoading ? 'Processando...' : 'Confirmar Pagamento PIX' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Step 3: Biometric Registration ── -->
      <section v-if="currentStep === 'biometric'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 mb-6">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagamento confirmado
          </div>

          <h2 class="text-3xl font-black tracking-tight text-white mb-3">Cadastre sua biometria</h2>
          <p class="text-sm text-slate-300 max-w-sm mx-auto mb-8">
            Sua digital ficará vinculada ao locker <span class="font-mono font-black text-white">{{ selectedLocker?.code }}</span>. Só você poderá abrir para retirar seus itens.
          </p>

          <!-- Fingerprint animation -->
          <div class="mx-auto mb-8 relative w-40 h-40 flex items-center justify-center">
            <div :class="['absolute inset-0 rounded-full border-4 transition-all duration-700', biometricState === 'scanning' ? 'border-brand-400 animate-ping opacity-30' : 'border-transparent']" />
            <div :class="['absolute inset-2 rounded-full border-2 transition-all duration-500', biometricState === 'scanning' ? 'border-brand-400/60' : biometricState === 'success' ? 'border-brand-500' : 'border-slate-600']" />
            <div :class="['w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500', biometricState === 'idle' ? 'bg-slate-700' : biometricState === 'scanning' ? 'bg-brand-900/50' : 'bg-brand-600']">
              <svg class="w-14 h-14" :class="biometricState === 'success' ? 'text-white' : 'text-slate-300'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M12 1C8.13 1 5 4.13 5 8v1H4C2.9 9 2 9.9 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.87-3.13-7-7-7z"/>
                <path d="M12 3C9.24 3 7 5.24 7 8v1h1V8c0-2.21 1.79-4 4-4s4 1.79 4 4v1h1V8c0-2.76-2.24-5-5-5z" stroke-width="0.8"/>
                <path d="M12 5C10.34 5 9 6.34 9 8v1h1V8c0-1.1.9-2 2-2s2 .9 2 2v1h1V8c0-1.66-1.34-3-3-3z" stroke-width="0.8" opacity="0.7"/>
                <path d="M11 8v3M13 8v3M10 9h4" stroke-width="0.6" opacity="0.5"/>
              </svg>
            </div>
            <!-- Scan line animation -->
            <div v-if="biometricState === 'scanning'" class="absolute inset-4 overflow-hidden rounded-full">
              <div class="w-full h-0.5 bg-brand-400/80 absolute animate-scan-line" />
            </div>
            <!-- Check overlay on success -->
            <div v-if="biometricState === 'success'" class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center absolute bottom-3 right-3 shadow-lg">
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <p class="text-sm font-semibold text-white mb-6">
            {{ biometricState === 'idle' ? 'Pressione o botão para cadastrar sua digital' : biometricState === 'scanning' ? 'Escaneando biometria...' : '✓ Biometria cadastrada com sucesso!' }}
          </p>

          <div v-if="error" class="mb-4 rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">{{ error }}</div>

          <button
            v-if="biometricState !== 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            :class="biometricState === 'scanning' ? 'bg-white/10 text-white cursor-wait' : 'bg-brand-600 text-white hover:bg-brand-500 hover:-translate-y-0.5'"
            :disabled="biometricState === 'scanning' || isLoading"
            @click="startBiometricScan"
          >
            <BaseSpinner v-if="biometricState === 'scanning'" size="sm" color="white" />
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            <span>{{ biometricState === 'scanning' ? 'Escaneando...' : 'Escanear Digital' }}</span>
          </button>

          <button
            v-if="biometricState === 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-400 transition-all duration-200 active:scale-[0.98]"
            :disabled="isLoading"
            @click="confirmBiometric"
          >
            <BaseSpinner v-if="isLoading" size="sm" color="white" />
            <span>{{ isLoading ? 'Abrindo locker...' : 'Continuar → Abrir locker' }}</span>
          </button>
        </div>
      </section>

      <!-- ── Step 4: Locker Open ── -->
      <section v-if="currentStep === 'open'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-white mb-6 shadow-inner">
            <svg class="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 1 1 8 0m-4 8v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
            </svg>
          </div>

          <h2 class="text-4xl font-black tracking-tight text-white">Locker aberto!</h2>
          <p class="mt-3 text-lg text-brand-100">A porta está desbloqueada.</p>
          <p class="mt-2 text-sm text-brand-200 max-w-sm mx-auto">Guarde seus pertences, feche a porta. O timer começa agora — você será cobrado por hora ao retirar.</p>

          <div class="mt-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
            <span class="w-2 h-2 rounded-full bg-brand-300 animate-pulse" />
            Taxa: {{ formatCents(lockerHourlyRate) }}/hora
          </div>

          <div class="mt-8">
            <button
              id="btn-guardei-itens"
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-700 hover:-translate-y-0.5 hover:bg-brand-50 transition-all duration-200 active:scale-[0.98]"
              @click="startStoring"
            >
              Guardei meus itens → Fechar locker
            </button>
          </div>
        </div>
      </section>

      <!-- ── Step 5: Storing (timer) ── -->
      <section v-if="currentStep === 'storing'" class="step-content">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="bg-slate-900 px-6 py-5 text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">Locker <span class="text-white font-mono">{{ selectedLocker?.code }}</span> em uso</p>
            <div class="font-mono text-5xl font-black text-white tracking-widest">{{ timerDisplay }}</div>
            <p class="mt-2 text-sm text-slate-400">tempo decorrido</p>
          </div>

          <div class="px-6 py-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">Taxa inicial paga</p>
                <p class="text-2xl font-black text-slate-900">{{ formatCents(lockerInitialFee) }}</p>
              </div>
              <div class="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 mb-1">Custo acumulado</p>
                <p class="text-2xl font-black text-brand-700">{{ formatCents(accumulatedCost) }}</p>
              </div>
            </div>

            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-6">
              <strong>Taxa de {{ formatCents(lockerHourlyRate) }}/hora</strong> — cobrança por hora cheia começada. Retire seus itens quando quiser.
            </div>

            <button
              id="btn-retirar-itens"
              type="button"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-900 transition-all duration-200 active:scale-[0.98]"
              @click="proceedToRetrieve"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              Quero retirar meus itens agora
            </button>

            <!-- ── Retrieve Later Card ── -->
            <div v-if="currentRental" class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <!-- Header -->
              <div class="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5 bg-slate-50">
                <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <p class="text-sm font-bold text-slate-800">Retirar depois</p>
                <span class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Salve este QR</span>
              </div>

              <!-- Body: 2 cols on sm+ -->
              <div class="flex flex-col sm:flex-row gap-0">

                <!-- Left: info + link + buttons -->
                <div class="flex-1 px-5 py-5">
                  <p class="text-sm text-slate-600 leading-relaxed mb-4">
                    Você pode fechar esta página e voltar quando quiser. Basta escanear o QR Code ou acessar o link abaixo com qualquer dispositivo para retomar a retirada.
                  </p>

                  <!-- URL input + copy -->
                  <div class="mb-3">
                    <label class="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Link de retirada</label>
                    <div class="flex items-center gap-2">
                      <input
                        id="retrieve-link-input"
                        type="text"
                        readonly
                        :value="`${baseUrl}/retrieve/${currentRental.id}`"
                        class="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none select-all cursor-text"
                        @click="($event.target).select()"
                      />
                      <button
                        type="button"
                        class="shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all"
                        :class="linkCopied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                        @click="copyRetrieveLink"
                      >
                        <span v-if="linkCopied" class="flex items-center gap-1">
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                          Copiado
                        </span>
                        <span v-else>Copiar</span>
                      </button>
                    </div>
                  </div>

                  <!-- Open in new tab -->
                  <a
                    :href="`/retrieve/${currentRental.id}`"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Abrir página de retirada
                  </a>
                </div>

                <!-- Right: QR Code -->
                <div class="flex flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 px-5 py-5 bg-slate-50/60 shrink-0">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1">Escanear com celular</p>
                  <div class="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    <img
                      :src="`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&format=svg&data=${encodeURIComponent(baseUrl + '/retrieve/' + currentRental.id)}`"
                      alt="QR Code de retirada"
                      width="140"
                      height="140"
                      class="rounded-lg"
                    />
                  </div>
                  <p class="text-[10px] text-slate-400 text-center max-w-[120px] leading-relaxed">
                    Locker <span class="font-mono font-black text-slate-700">{{ selectedLocker?.code }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- ── Step 6: Retrieve (biometric check) ── -->
      <section v-if="currentStep === 'retrieve'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
          <h2 class="text-3xl font-black tracking-tight text-white mb-2">Verificação biométrica</h2>
          <p class="text-sm text-slate-300 max-w-sm mx-auto mb-8">Confirme sua identidade para abrir o locker e retirar seus itens.</p>

          <!-- Same fingerprint component, verify mode -->
          <div class="mx-auto mb-8 relative w-40 h-40 flex items-center justify-center">
            <div :class="['absolute inset-0 rounded-full border-4 transition-all duration-700', retrieveBioState === 'scanning' ? 'border-brand-400 animate-ping opacity-30' : 'border-transparent']" />
            <div :class="['absolute inset-2 rounded-full border-2 transition-all duration-500', retrieveBioState === 'scanning' ? 'border-brand-400/60' : retrieveBioState === 'success' ? 'border-brand-500' : 'border-slate-600']" />
            <div :class="['w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500', retrieveBioState === 'idle' ? 'bg-slate-700' : retrieveBioState === 'scanning' ? 'bg-brand-900/50' : 'bg-brand-600']">
              <svg class="w-14 h-14" :class="retrieveBioState === 'success' ? 'text-white' : 'text-slate-300'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M12 1C8.13 1 5 4.13 5 8v1H4C2.9 9 2 9.9 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
            <div v-if="retrieveBioState === 'scanning'" class="absolute inset-4 overflow-hidden rounded-full">
              <div class="w-full h-0.5 bg-brand-400/80 absolute animate-scan-line" />
            </div>
            <div v-if="retrieveBioState === 'success'" class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <p class="text-sm font-semibold text-white mb-6">
            {{ retrieveBioState === 'idle' ? 'Pressione para verificar sua digital' : retrieveBioState === 'scanning' ? 'Verificando...' : '✓ Identidade confirmada!' }}
          </p>

          <div v-if="error" class="mb-4 rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">{{ error }}</div>

          <button
            v-if="retrieveBioState !== 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200"
            :class="retrieveBioState === 'scanning' ? 'bg-white/10 text-white cursor-wait' : 'bg-brand-600 text-white hover:bg-brand-500 hover:-translate-y-0.5'"
            :disabled="retrieveBioState === 'scanning'"
            @click="startRetrieveScan"
          >
            <BaseSpinner v-if="retrieveBioState === 'scanning'" size="sm" color="white" />
            <span>{{ retrieveBioState === 'scanning' ? 'Verificando...' : 'Verificar Digital' }}</span>
          </button>

          <button
            v-if="retrieveBioState === 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-400 transition-all duration-200"
            :disabled="isLoading"
            @click="confirmRetrieval"
          >
            <BaseSpinner v-if="isLoading" size="sm" color="white" />
            <span>{{ isLoading ? 'Calculando cobrança...' : 'Ver cobrança e retirar' }}</span>
          </button>
        </div>
      </section>

      <!-- ── Step 7: Extra payment ── -->
      <section v-if="currentStep === 'extra-payment'" class="step-content">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <h2 class="text-2xl font-black tracking-tight text-slate-900">Resumo da locação</h2>
            <p class="mt-1 text-sm text-slate-500">Confirme o pagamento para retirar seus itens e liberar o locker.</p>
          </div>

          <div class="px-6 py-6 sm:px-8">
            <!-- Billing breakdown -->
            <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 mb-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa de ativação (paga)</span>
                <span class="font-semibold text-emerald-600">{{ formatCents(retrievalResult?.total_cents ? retrievalResult.total_cents - retrievalResult.extra_charge_cents : lockerInitialFee) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Tempo de uso</span>
                <span class="font-semibold text-slate-900">{{ retrievalResult ? formatMinutes(retrievalResult.minutes_used) : '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa por hora ({{ formatCents(lockerHourlyRate) }}/h)</span>
                <span class="font-semibold text-slate-900">{{ formatCents(retrievalResult?.extra_charge_cents ?? 0) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800">Total a pagar agora</span>
                  <span class="text-3xl font-black tracking-tight text-slate-900">{{ formatCents(retrievalResult?.extra_charge_cents ?? 0) }}</span>
                </div>
              </div>
            </div>

            <!-- PIX QR for extra charge -->
            <div v-if="(retrievalResult?.extra_charge_cents ?? 0) > 0" class="flex flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5 mb-4">
              <p class="mb-3 text-sm font-semibold text-brand-700">Escaneie o QR Code PIX para o adicional</p>
              <svg viewBox="0 0 120 120" class="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="120" fill="white" rx="6"/>
                <rect x="8" y="8" width="30" height="30" rx="3" fill="#111827"/>
                <rect x="12" y="12" width="22" height="22" rx="2" fill="white"/>
                <rect x="16" y="16" width="14" height="14" rx="1" fill="#111827"/>
                <rect x="82" y="8" width="30" height="30" rx="3" fill="#111827"/>
                <rect x="86" y="12" width="22" height="22" rx="2" fill="white"/>
                <rect x="90" y="16" width="14" height="14" rx="1" fill="#111827"/>
                <rect x="8" y="82" width="30" height="30" rx="3" fill="#111827"/>
                <rect x="12" y="86" width="22" height="22" rx="2" fill="white"/>
                <rect x="16" y="90" width="14" height="14" rx="1" fill="#111827"/>
                <rect x="46" y="46" width="28" height="28" rx="4" fill="#16a34a"/>
                <rect x="52" y="52" width="16" height="16" rx="2" fill="white"/>
              </svg>
              <p class="mt-2 text-xs text-slate-500">FastLock · {{ formatCents(retrievalResult?.extra_charge_cents ?? 0) }}</p>
            </div>
            <div v-else class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-4">
              🎉 Nenhuma taxa extra! Seu locker foi usado por menos de 1 hora.
            </div>

            <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 mb-6">
              🔬 Demonstração — nenhuma cobrança real.
            </div>

            <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

            <button
              id="btn-confirmar-retirada"
              type="button"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              :disabled="isLoading"
              @click="confirmRetrievalPayment"
            >
              <BaseSpinner v-if="isLoading" size="sm" color="white" />
              <span>{{ isLoading ? 'Finalizando...' : 'Confirmar pagamento e retirar' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ── Step 8: Done ── -->
      <section v-if="currentStep === 'done'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white mb-6">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-4xl font-black tracking-tight text-white">Tudo certo!</h2>
          <p class="mt-3 text-lg text-brand-100">Seus itens foram retirados e o locker está livre.</p>

          <!-- Final receipt -->
          <div class="mx-auto mt-8 max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 mb-3">Recibo</p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-white/80"><span>Taxa inicial</span><span class="font-semibold text-white">{{ formatCents(lockerInitialFee) }}</span></div>
              <div class="flex justify-between text-white/80"><span>Tempo de uso</span><span class="font-semibold text-white">{{ retrievalResult ? formatMinutes(retrievalResult.minutes_used) : '—' }}</span></div>
              <div class="flex justify-between text-white/80"><span>Taxa extra</span><span class="font-semibold text-white">{{ formatCents(retrievalResult?.extra_charge_cents ?? 0) }}</span></div>
              <div class="border-t border-white/20 pt-2 flex justify-between"><span class="font-bold text-white">Total</span><span class="text-xl font-black text-white">{{ formatCents(retrievalResult?.total_cents ?? lockerInitialFee) }}</span></div>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 hover:-translate-y-0.5 hover:bg-brand-50 transition-all duration-200" @click="resetFlow">
              Novo aluguel
            </button>
            <a href="/" class="inline-flex h-11 items-center justify-center rounded-xl bg-brand-700/60 px-6 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-700 transition-all duration-200">
              Voltar ao início
            </a>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import LockerMap from '@/components/map/LockerMap.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'

// ── State ──────────────────────────────────────────────────

/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const selectedLocationId = ref('')
const isLoading = ref(true)
const error = ref('')

const currentStep = ref('choose')

// ── Retrieve-later helpers ─────────────────────────────────

const baseUrl = window.location.origin
const linkCopied = ref(false)

function copyRetrieveLink() {
  if (!currentRental.value) return
  navigator.clipboard.writeText(`${baseUrl}/retrieve/${currentRental.value.id}`)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2500)
}

// ── Geolocation ────────────────────────────────────────────

/** @type {import('vue').Ref<{lat:number,lng:number,zoom:number}>} */
const mapCenter = ref({ lat: -23.55052, lng: -46.633308, zoom: 12 })
const geoStatus = ref('pending') // 'pending' | 'granted' | 'denied' | 'ip'
const geoStatusMsg = ref('')

async function resolveUserLocation() {
  // 1. Try GPS
  if ('geolocation' in navigator) {
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000, maximumAge: 60000, enableHighAccuracy: false
        })
      )
      mapCenter.value = { lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 14 }
      geoStatus.value = 'granted'
      geoStatusMsg.value = 'Localização via GPS'
      return
    } catch {
      geoStatus.value = 'denied'
    }
  }

  // 2. Fallback: IP geolocation (ipapi.co — free, no key)
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    if (data.latitude && data.longitude) {
      mapCenter.value = { lat: data.latitude, lng: data.longitude, zoom: 12 }
      geoStatus.value = 'ip'
      geoStatusMsg.value = `Localização aproximada: ${data.city || data.region || 'sua cidade'}`
    }
  } catch {
    // Keep São Paulo default
    geoStatus.value = 'ip'
    geoStatusMsg.value = 'Localização padrão'
  }
}

// ── Pagination (locker list) ───────────────────────────────

const PAGE_SIZE = 8
const lockerPage = ref(1)

const pagedLockers = computed(() => {
  const all = availableLockers.value
  return all.slice(0, lockerPage.value * PAGE_SIZE)
})

const hasMoreLockers = computed(() =>
  availableLockers.value.length > lockerPage.value * PAGE_SIZE
)

function loadMoreLockers() {
  lockerPage.value++
}

// Reset pagination when location changes
watch(selectedLocationId, () => {
  lockerPage.value = 1
})

/** @type {import('vue').Ref<any>} */
const selectedLocker = ref(null)

/** @type {import('vue').Ref<any>} */
const currentRental = ref(null)

// Biometric states: 'idle' | 'scanning' | 'success'
const biometricState = ref('idle')
const retrieveBioState = ref('idle')
const biometricToken = ref('')

// Timer
let timerInterval = null
const storingStartedAt = ref(null)
const elapsedSeconds = ref(0)

/** @type {import('vue').Ref<any>} */
const retrievalResult = ref(null)

// ── Steps ──────────────────────────────────────────────────

const steps = [
  { key: 'choose', label: 'Localizar' },
  { key: 'pay', label: 'Pagamento inicial' },
  { key: 'biometric', label: 'Biometria' },
  { key: 'open', label: 'Locker aberto' },
  { key: 'storing', label: 'Armazenando' },
  { key: 'retrieve', label: 'Verificação' },
  { key: 'extra-payment', label: 'Cobrança extra' },
  { key: 'done', label: 'Concluído' }
]

const currentStepIndex = computed(() => {
  const index = steps.findIndex((s) => s.key === currentStep.value)
  return index === -1 ? 0 : index
})

// ── Computed ───────────────────────────────────────────────

const selectedLocation = computed(() =>
  locations.value.find((l) => l.id === selectedLocationId.value) || null
)

const availableLockers = computed(() => selectedLocation.value?.available_lockers || [])

const lockerInitialFee = computed(() => {
  return selectedLocation.value?.initial_fee_cents ?? 500
})

const lockerHourlyRate = computed(() => {
  if (!selectedLocation.value || !selectedLocker.value) return 500
  const size = selectedLocker.value.size
  const loc = selectedLocation.value
  return size === 'P' ? (loc.hourly_rate_small ?? 500)
    : size === 'M' ? (loc.hourly_rate_medium ?? 1000)
    : (loc.hourly_rate_large ?? 1500)
})

const timerDisplay = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const accumulatedCost = computed(() => {
  const hours = Math.ceil(elapsedSeconds.value / 3600) || 1
  return hours * lockerHourlyRate.value
})

// ── Lifecycle ──────────────────────────────────────────────

onMounted(() => {
  resolveUserLocation()
  fetchLocations()
  runOnboardingTutorial()
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

// ── Onboarding tutorial (driver.js — Animated Tour) ───────

async function runOnboardingTutorial() {
  const seen = localStorage.getItem('fastlock_tutorial_seen')
  if (seen) return

  const { driver } = await import('driver.js')
  await import('driver.js/dist/driver.css')

  setTimeout(() => {
    const d = driver({
      animate: true,          // ← Animated Tour
      showProgress: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'fastlock-tour-popover',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Começar! 🚀',
      steps: [
        {
          popover: {
            title: '👋 Bem-vindo ao FastLock!',
            description: 'Vou te mostrar como alugar um locker em menos de 1 minuto. São apenas 4 passos simples.',
            side: 'over',
            align: 'center'
          }
        },
        {
          element: '[data-tour="map"]',
          popover: {
            title: '📍 Encontre um locker',
            description: 'Clique em um marcador no mapa para ver os lockers disponíveis naquele ponto. O mapa já está centrado na sua localização.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="qr-hint"]',
          popover: {
            title: '📷 Já está no local?',
            description: 'Cada locker físico tem um QR Code colado nele. Escaneie com a câmera para abrir direto a página de aluguel daquele locker.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          popover: {
            title: '💳 Pague via PIX',
            description: 'Após selecionar o locker, um QR Code PIX será gerado. É a taxa de ativação — rápido, sem cadastro, sem cartão.',
            side: 'over',
            align: 'center'
          }
        },
        {
          popover: {
            title: '🔐 Biometria na hora',
            description: 'Cadastre sua digital uma única vez. Só você poderá abrir o locker depois, protegendo seus itens.',
            side: 'over',
            align: 'center'
          }
        },
        {
          popover: {
            title: '⏱️ Pague só o que usar',
            description: 'Precisa sair e voltar depois? Gere um QR Code de retirada e retome quando quiser. Você só paga as horas utilizadas.',
            side: 'over',
            align: 'center'
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem('fastlock_tutorial_seen', '1')
      }
    })
    d.drive()
  }, 900)
}


// ── API calls ──────────────────────────────────────────────

async function fetchLocations() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await api.get('/locations?limit=200')
    const nextLocations = response.data || []
    locations.value = nextLocations

    if (!nextLocations.length) {
      selectedLocationId.value = ''
      return
    }

    const hasCurrentSelection = nextLocations.some((l) => l.id === selectedLocationId.value)
    if (hasCurrentSelection) return

    const preferred = nextLocations.find((l) => Number(l.free_lockers) > 0) || nextLocations[0]
    selectedLocationId.value = preferred.id
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao carregar o mapa de lockers.'
  } finally {
    isLoading.value = false
  }
}

// ── Flow handlers ──────────────────────────────────────────

/** @param {any} location */
function selectLocation(location) {
  selectedLocationId.value = location.id
}

/** @param {any} locker */
function selectLocker(locker) {
  selectedLocker.value = locker
  currentStep.value = 'pay'
  animateStep()
}

async function simulatePayment() {
  isLoading.value = true
  error.value = ''

  await new Promise((r) => setTimeout(r, 900))

  try {
    const rental = await api.post('/rentals', { locker_id: selectedLocker.value.id })
    currentRental.value = rental
    currentStep.value = 'biometric'
    biometricState.value = 'idle'
    animateStep()
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Não foi possível criar o aluguel.'
  } finally {
    isLoading.value = false
  }
}

async function startBiometricScan() {
  biometricState.value = 'scanning'
  error.value = ''

  await new Promise((r) => setTimeout(r, 2200))
  biometricToken.value = `bio_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  biometricState.value = 'success'
}

async function confirmBiometric() {
  if (!currentRental.value) return
  isLoading.value = true
  error.value = ''

  try {
    await api.post(`/rentals/${currentRental.value.id}/biometric`, {
      biometric_token: biometricToken.value
    })
    currentStep.value = 'open'
    animateStep()
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Falha ao registrar biometria.'
  } finally {
    isLoading.value = false
  }
}

function startStoring() {
  storingStartedAt.value = Date.now()
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - storingStartedAt.value) / 1000)
  }, 1000)
  currentStep.value = 'storing'
  animateStep()
}

function proceedToRetrieve() {
  currentStep.value = 'retrieve'
  retrieveBioState.value = 'idle'
  animateStep()
}

async function startRetrieveScan() {
  retrieveBioState.value = 'scanning'
  error.value = ''
  await new Promise((r) => setTimeout(r, 2000))
  retrieveBioState.value = 'success'
}

async function confirmRetrieval() {
  if (!currentRental.value) return
  isLoading.value = true
  error.value = ''
  clearInterval(timerInterval)

  try {
    const result = await api.post(`/rentals/${currentRental.value.id}/retrieve`, {
      biometric_token: biometricToken.value
    })
    retrievalResult.value = result
    currentStep.value = 'extra-payment'
    animateStep()
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Falha na verificação biométrica.'
  } finally {
    isLoading.value = false
  }
}

async function confirmRetrievalPayment() {
  if (!currentRental.value) return
  isLoading.value = true
  error.value = ''

  await new Promise((r) => setTimeout(r, 800))

  try {
    await api.post(`/rentals/${currentRental.value.id}/confirm-retrieval`)
    currentStep.value = 'done'
    animateStep()
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Falha ao finalizar o aluguel.'
  } finally {
    isLoading.value = false
  }
}

async function resetFlow() {
  clearInterval(timerInterval)
  currentStep.value = 'choose'
  selectedLocker.value = null
  currentRental.value = null
  biometricState.value = 'idle'
  retrieveBioState.value = 'idle'
  biometricToken.value = ''
  elapsedSeconds.value = 0
  retrievalResult.value = null
  error.value = ''
  await fetchLocations()
  animateStep()
}

// ── Helpers ────────────────────────────────────────────────

function animateStep() {
  window.setTimeout(() => {
    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  }, 30)
}

/** @param {string} size */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Médio', G: 'Grande' }[size] || size
}

/** @param {number} cents */
function formatCents(cents) {
  if (!cents && cents !== 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/** @param {number} minutes */
function formatMinutes(minutes) {
  if (!minutes) return '< 1 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
</script>

<style scoped>
@keyframes scan-line {
  0%   { top: 0%; }
  100% { top: 100%; }
}
.animate-scan-line {
  animation: scan-line 1.2s ease-in-out infinite alternate;
}
</style>
