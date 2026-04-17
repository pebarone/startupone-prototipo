<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div :class="currentStep === 'choose' ? 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-3xl px-4 sm:px-6'">
      <div class="mb-8 flex flex-wrap items-center justify-center gap-1.5">
        <div v-for="(step, index) in steps" :key="step.key" class="flex items-center gap-1.5">
          <div :class="['flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300', currentStepIndex > index ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : currentStepIndex === index ? 'bg-slate-900 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50' : 'bg-slate-200 text-slate-400']">
            <svg v-if="currentStepIndex > index" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span v-if="index < steps.length - 1" class="hidden h-0.5 w-5 transition-colors duration-300 sm:block" :class="currentStepIndex > index ? 'bg-brand-500' : 'bg-slate-200'" />
        </div>
      </div>

      <div class="mb-6 text-center">
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{{ steps[currentStepIndex]?.label }}</p>
      </div>

      <section v-if="currentStep === 'choose'" class="step-content">
        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Escolha um locker</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Mapa publico de lockers</h1>
          <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">Escolha um locker livre para iniciar a ativacao. O QR fixo do locker pode abrir direto esta mesma jornada.</p>
        </div>

        <div v-if="isLoading" class="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col items-center gap-4">
            <BaseSpinner size="xl" color="brand" />
            <p class="text-sm text-slate-500">Carregando localizacoes...</p>
          </div>
        </div>

        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          {{ error }}
        </div>

        <div v-else class="space-y-5">
          <div class="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div class="mb-3 flex flex-wrap items-center gap-2 px-1">
              <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"><span class="h-2.5 w-2.5 rounded-full bg-brand-600" />Mapa de locais</span>
              <span v-if="geoLabel" :class="['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', geoStatus === 'granted' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500']"><span :class="['h-1.5 w-1.5 rounded-full', geoStatus === 'granted' ? 'bg-emerald-500' : 'bg-slate-400']" />{{ geoLabel }}</span>
              <button type="button" class="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700" @click="resolveUserLocation">Atualizar GPS</button>
            </div>
            <div class="relative overflow-hidden rounded-2xl">
              <div class="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex justify-center">
                <Transition name="map-hint">
                  <button v-if="showNearestHint" type="button" class="pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-full border border-white/80 bg-white/88 px-3.5 py-2.5 text-left shadow-[0_14px_32px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.16)]" @click="jumpToNearest">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                      <svg class="h-4.5 w-4.5 text-red-500 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" :style="{ transform: `rotate(${nearestLocation.bearing}deg)` }">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l5 12-5-2-5 2 5-12Z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Mais perto de voce</p>
                      <p class="truncate text-sm font-semibold text-slate-900">{{ nearestLocation.name }}</p>
                      <p class="text-xs text-slate-500">{{ nearestDistanceLabel }}</p>
                    </div>
                    <span class="hidden text-xs font-semibold text-brand-700 sm:block">Ir agora</span>
                  </button>
                </Transition>
              </div>
              <LockerMap :locations="locations" :selected-location-id="selectedLocationId" :center="mapCenter" :user-location="userLocation" :fit-to-locations="false" :height="mapHeight" @select-location="selectLocation" />
            </div>
          </div>

          <div v-if="selectedLocation" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Local selecionado</p>
                <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">{{ selectedLocation.name }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-500">{{ selectedLocation.address }}</p>
              </div>

              <div class="space-y-2">
                <span v-if="selectedLocationDistanceLabel" class="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">A {{ selectedLocationDistanceLabel }} de você</span>
                <div class="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">Preço base</p>
                  <div class="mt-1.5 flex items-center justify-between gap-4"><span>Ativação</span><strong>{{ formatCents(selectedLocation.initial_fee_cents ?? 500) }}</strong></div>
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-2 text-xs font-semibold sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">Total: {{ lockers.length }}</div>
              <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">Disponíveis: {{ availableLockers.length }}</div>
              <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">Ocupados: {{ occupiedLockers.length }}</div>
              <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">Manutenção: {{ maintenanceLockers.length }}</div>
            </div>

            <div class="mt-6">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Armários deste local</p>
                  <p class="mt-0.5 text-[10px] text-slate-500">Toque em um armário verde para iniciar o aluguel</p>
                </div>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{{ availableLockers.length }} livres</span>
              </div>

              <LockerGrid 
                :lockers="lockers"
                :selected-locker-id="selectedLocker?.id"
                :loading="isLockersLoading"
                :polling="isPolling"
                :require-available="true"
                :global-animation-state="globalAnimationState"
                @select="selectLocker"
              />
            </div>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Nenhum ponto disponivel agora.</div>
        </div>
      </section>

      <section v-else-if="currentStep === 'pay'" class="step-content">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <h2 class="text-xl font-black tracking-tight text-slate-900">Confirme o PIX para liberar o locker</h2>
            <p class="mt-1 text-sm text-slate-500">Locker <span class="font-mono font-black text-slate-900">{{ selectedLocker?.code }}</span> · Tamanho {{ sizeLabel(selectedLocker?.size) }}</p>
          </div>
          <div class="px-6 py-6 sm:px-8">
            <div class="mb-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex items-center justify-between text-sm"><span class="text-slate-500">Local</span><span class="font-semibold text-slate-900">{{ selectedLocation?.name }}</span></div>
              <div class="flex items-center justify-between text-sm"><span class="text-slate-500">Biometria</span><span class="font-semibold text-emerald-600">{{ biometricState === 'success' ? 'Cadastrada' : 'Pendente' }}</span></div>
              <div class="flex items-center justify-between text-sm"><span class="text-slate-500">Taxa por hora</span><span class="font-semibold text-slate-900">{{ formatCents(lockerHourlyRate) }}</span></div>
              <div class="border-t border-slate-200 pt-3"><div class="flex items-center justify-between"><span class="font-semibold text-slate-700">Taxa de ativacao</span><span class="text-2xl font-black tracking-tight text-slate-900">{{ formatCents(lockerInitialFee) }}</span></div></div>
            </div>
            <div class="flex flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6">
              <p class="mb-3 text-sm font-semibold text-brand-700">Escaneie o QR Code PIX</p>
              <svg viewBox="0 0 120 120" class="h-36 w-36 rounded-lg bg-white p-2 shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="white" rx="6" /><rect x="8" y="8" width="30" height="30" rx="3" fill="#111827" /><rect x="12" y="12" width="22" height="22" rx="2" fill="white" /><rect x="16" y="16" width="14" height="14" rx="1" fill="#111827" /><rect x="82" y="8" width="30" height="30" rx="3" fill="#111827" /><rect x="86" y="12" width="22" height="22" rx="2" fill="white" /><rect x="90" y="16" width="14" height="14" rx="1" fill="#111827" /><rect x="8" y="82" width="30" height="30" rx="3" fill="#111827" /><rect x="12" y="86" width="22" height="22" rx="2" fill="white" /><rect x="16" y="90" width="14" height="14" rx="1" fill="#111827" /><rect x="46" y="46" width="28" height="28" rx="4" fill="#16a34a" /><rect x="52" y="52" width="16" height="16" rx="2" fill="white" /></svg>
              <p class="mt-3 text-xs text-slate-500">Chave PIX FastLock · {{ formatCents(lockerInitialFee) }}</p>
            </div>
            <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">Depois da confirmacao, o locker fica reservado, muda para vermelho e abre para o usuario.</div>
            <div v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5" @click="goToBiometricStep">Voltar para biometria</button>
              <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:opacity-50" :disabled="actionLoading || biometricState !== 'success' || !currentRental?.id" @click="confirmInitialPayment"><BaseSpinner v-if="actionLoading" size="sm" color="white" /><span>{{ actionLoading ? 'Processando...' : 'Confirmar pagamento PIX e abrir locker' }}</span></button>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="currentStep === 'biometric'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
          <p class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Biometria primeiro</p>
          <h2 class="mb-3 text-3xl font-black tracking-tight text-white">Cadastre sua biometria</h2>
          <p class="mx-auto mb-8 max-w-sm text-sm text-slate-300">Sua digital vincula a chave deste aluguel ao aparelho. O locker so sera reservado e aberto depois da confirmacao do PIX.</p>

          <div class="mx-auto mb-8 flex h-40 w-40 items-center justify-center">
            <div class="relative flex h-full w-full items-center justify-center">
              <div :class="['absolute inset-0 rounded-full border-4 transition-all duration-700', biometricState === 'scanning' ? 'border-brand-400 opacity-30 animate-ping' : 'border-transparent']" />
              <div :class="['absolute inset-2 rounded-full border-2 transition-all duration-500', biometricState === 'scanning' ? 'border-brand-400/60' : biometricState === 'success' ? 'border-brand-500' : 'border-slate-600']" />
              <div :class="['flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500', biometricState === 'idle' ? 'bg-slate-700' : biometricState === 'scanning' ? 'bg-brand-900/50' : 'bg-brand-600']">
                <svg class="h-14 w-14" :class="biometricState === 'success' ? 'text-white' : 'text-slate-300'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 1C8.13 1 5 4.13 5 8v1H4C2.9 9 2 9.9 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.87-3.13-7-7-7z" /></svg>
              </div>
              <div v-if="biometricState === 'scanning'" class="absolute inset-4 overflow-hidden rounded-full"><div class="absolute h-0.5 w-full animate-scan-line bg-brand-400/80" /></div>
              <div v-if="biometricState === 'success'" class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg"><svg class="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg></div>
            </div>
          </div>

          <p class="mb-6 text-sm font-semibold text-white">{{ biometricStateLabel }}</p>
          <div v-if="!webauthnSupported" class="mx-auto mb-4 max-w-md rounded-lg border border-amber-400/30 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">{{ webauthnSupportHint }}</div>
          <div v-if="error" class="mx-auto mb-4 max-w-md rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">{{ error }}</div>
          <button v-if="biometricState !== 'success'" type="button" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200" :class="biometricState === 'scanning' ? 'cursor-wait bg-white/10 text-white' : 'bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-500'" :disabled="biometricState === 'scanning' || actionLoading || !webauthnSupported" @click="startBiometricRegistration"><BaseSpinner v-if="biometricState === 'scanning'" size="sm" color="white" /><span>{{ biometricState === 'scanning' ? 'Lendo digital...' : 'Escanear digital' }}</span></button>
          <button v-if="biometricState === 'success'" type="button" class="inline-flex h-12 items-center justify-center rounded-xl bg-brand-500 px-8 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-400" @click="goToPayment">Continuar → Pagar PIX</button>
        </div>
      </section>

      <section v-else-if="currentStep === 'open'" class="step-content">
        <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <h2 class="text-4xl font-black tracking-tight text-white">Locker reservado e aberto!</h2>
          <p class="mt-3 text-lg text-brand-100">PIX confirmado e chave vinculada ao seu aparelho.</p>
          <p class="mx-auto mt-2 max-w-sm text-sm text-brand-200">Guarde seus itens, feche o locker e so entao comece a contagem do tempo.</p>
          <div v-if="selectedLocker" class="mx-auto mt-6 max-w-[220px] rounded-2xl border border-white/20 bg-white/10 p-3">
            <LockerGrid
              :lockers="[selectedLocker]"
              :interactive="false"
              :selected-locker-id="selectedLocker.id"
              :global-animation-state="globalAnimationState === 'closing' ? 'closing' : 'open'"
            />
          </div>
          <div class="mt-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"><span class="h-2 w-2 animate-pulse rounded-full bg-brand-300" />Taxa: {{ formatCents(lockerHourlyRate) }}/hora</div>
          <div class="mt-8"><button type="button" class="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 disabled:opacity-50" :disabled="actionLoading" @click="startStoring"><BaseSpinner v-if="actionLoading" size="sm" color="brand" /><span>{{ actionLoading ? 'Fechando locker...' : 'Guardei meus itens → Fechar locker' }}</span></button></div>
        </div>
      </section>

      <section v-else-if="currentStep === 'storing'" class="step-content">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="bg-slate-900 px-6 py-5 text-center">
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Locker <span class="font-mono text-white">{{ selectedLocker?.code }}</span> em uso</p>
            <div v-if="selectedLocker" class="mx-auto mb-4 max-w-[210px]">
              <LockerGrid
                :lockers="[selectedLocker]"
                :interactive="false"
                :selected-locker-id="selectedLocker.id"
                global-animation-state="idle"
              />
            </div>
            <div class="font-mono text-5xl font-black tracking-widest text-white">{{ timerDisplay }}</div>
            <p class="mt-2 text-sm text-slate-400">tempo decorrido</p>
          </div>
          <div class="px-6 py-6">
            <div class="mb-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center"><p class="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Taxa inicial paga</p><p class="text-2xl font-black text-slate-900">{{ formatCents(lockerInitialFee) }}</p></div>
              <div class="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-center"><p class="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Taxa extra estimada</p><p class="text-2xl font-black text-brand-700">{{ formatCents(accumulatedCost) }}</p></div>
            </div>
            <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><strong>Taxa de {{ formatCents(lockerHourlyRate) }}/hora</strong> — cobrança por hora cheia começada. Retire seus itens quando quiser.</div>
            <button type="button" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500" @click="goToRetrieve">Quero retirar meus itens agora</button>
            <div v-if="currentRental" class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-5 py-3.5"><p class="text-sm font-bold text-slate-800">Retirar depois</p><span class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Salve este QR</span></div>
              <div class="flex flex-col gap-0 sm:flex-row">
                <div class="flex-1 px-5 py-5">
                  <p class="mb-4 text-sm leading-relaxed text-slate-600">Feche esta página e volte quando quiser. Basta abrir o link de retirada ou escanear o QR abaixo. Esta página já sabe qual aluguel deve liberar; a digital só autoriza a retirada.</p>
                  <div class="mb-3">
                    <label class="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Link de retirada</label>
                    <div class="flex items-center gap-2">
                      <input type="text" readonly :value="retrieveLink" class="min-w-0 flex-1 cursor-text select-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none" @click="selectInputText" />
                      <button type="button" class="shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all" :class="linkCopied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'" @click="copyRetrieveLink">{{ linkCopied ? 'Copiado' : 'Copiar' }}</button>
                    </div>
                  </div>
                  <a :href="retrieveLink" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700">Abrir página de retirada</a>
                </div>
                <div class="shrink-0 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:border-l sm:border-t-0">
                  <p class="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Escanear com celular</p>
                  <div class="rounded-xl border border-slate-200 bg-white p-2 shadow-sm"><img :src="retrieveQrUrl" alt="QR Code de retirada" width="140" height="140" class="rounded-lg" /></div>
                  <p class="mt-2 max-w-[140px] text-center text-[10px] leading-relaxed text-slate-400">Locker <span class="font-mono font-black text-slate-700">{{ selectedLocker?.code }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import LockerMap from '@/components/map/LockerMap.vue'
import LockerGrid from '@/components/lockers/LockerGrid.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { getApiErrorMessage } from '@/lib/api-errors'
import { summarizeAddress } from '@/lib/address'
import { findNearestLocation, formatDistance, haversineDistanceMeters } from '@/lib/geo'
import { estimateExtraChargeCentsFromElapsedSeconds, normalizeTimestampToNow } from '@/lib/rental-pricing'
import { getWebAuthnErrorMessage, getWebAuthnSupportHint, getWebAuthnSupportState, registerPasskey } from '@/composables/useWebAuthn'

const route = useRoute()
const router = useRouter()
const locations = ref([])
const lockers = ref([])
const selectedLocationId = ref('')
const selectedLocker = ref(null)
const currentRental = ref(null)
const currentStep = ref('choose')
const isLoading = ref(true)
const isLockersLoading = ref(false)
const isPolling = ref(false)
const actionLoading = ref(false)
const error = ref('')
const geoStatus = ref('pending')
const geoLabel = ref('Buscando sua localizacao')
const mapCenter = ref({ lat: -23.55052, lng: -46.633308, zoom: 12 })
const userLocation = ref(null)
const biometricState = ref('idle')
const elapsedSeconds = ref(0)
const linkCopied = ref(false)
const hasManualLocationSelection = ref(false)
const nearestHintDismissed = ref(false)
const globalAnimationState = ref('idle')
const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()
const baseUrl = typeof window === 'undefined' ? '' : window.location.origin
const mapHeight = 'clamp(360px, 62vh, 560px)'
const NEAREST_HINT_HIDE_DISTANCE_METERS = 180
let timerInterval = null
let pollingInterval = null

const steps = [{ key: 'choose', label: 'Localizar' }, { key: 'biometric', label: 'Biometria' }, { key: 'pay', label: 'Pagamento inicial' }, { key: 'open', label: 'Locker aberto' }, { key: 'storing', label: 'Armazenando' }]
const currentStepIndex = computed(() => Math.max(0, steps.findIndex((step) => step.key === currentStep.value)))
const selectedLocation = computed(() => locations.value.find((item) => item.id === selectedLocationId.value) || null)
const availableLockers = computed(() => lockers.value.filter(l => l.status === 'free'))
const occupiedLockers = computed(() => lockers.value.filter(l => l.status === 'occupied'))
const maintenanceLockers = computed(() => lockers.value.filter(l => l.status === 'maintenance'))
const lockerInitialFee = computed(() => selectedLocation.value?.initial_fee_cents ?? 500)
const lockerHourlyRate = computed(() => !selectedLocation.value || !selectedLocker.value ? 500 : selectedLocker.value.size === 'P' ? selectedLocation.value.hourly_rate_small ?? 500 : selectedLocker.value.size === 'M' ? selectedLocation.value.hourly_rate_medium ?? 1000 : selectedLocation.value.hourly_rate_large ?? 1500)
const biometricStateLabel = computed(() => biometricState.value === 'scanning' ? 'Registrando a chave biometrica deste aparelho...' : biometricState.value === 'success' ? 'Biometria cadastrada. Agora confirme o PIX para reservar o locker.' : 'Pressione para cadastrar sua digital')
const locationCandidates = computed(() => {
  const withAvailability = locations.value.filter((location) => Number(location.free_lockers ?? 0) > 0)
  return withAvailability.length ? withAvailability : locations.value
})
const nearestLocation = computed(() => findNearestLocation(userLocation.value, locationCandidates.value))
const nearestDistanceLabel = computed(() => nearestLocation.value ? formatDistance(nearestLocation.value.distance_meters) : '')
const showNearestHint = computed(() => {
  if (currentStep.value !== 'choose' || !nearestLocation.value || nearestHintDismissed.value) {
    return false
  }

  return nearestLocation.value.distance_meters > NEAREST_HINT_HIDE_DISTANCE_METERS
})
const timerDisplay = computed(() => {
  const total = Math.max(0, elapsedSeconds.value)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const accumulatedCost = computed(() => estimateExtraChargeCentsFromElapsedSeconds(elapsedSeconds.value, lockerHourlyRate.value))
const selectedLocationDistanceLabel = computed(() => {
  if (!userLocation.value || !selectedLocation.value) {
    return ''
  }

  return formatDistance(haversineDistanceMeters(userLocation.value, {
    lat: Number(selectedLocation.value.latitude),
    lng: Number(selectedLocation.value.longitude)
  }))
})
const retrieveLink = computed(() => currentRental.value ? `${baseUrl}/retrieve` : '')
const retrieveQrUrl = computed(() => currentRental.value ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&format=svg&data=${encodeURIComponent(retrieveLink.value)}` : '')

watch(selectedLocationId, (newId) => {
  if (newId) {
    fetchLockers(newId)
    startPolling(newId)
  } else {
    lockers.value = []
    stopPolling()
  }
})

watch(
  () => route.params.lockerId,
  async (lockerId, previousLockerId) => {
    if (isLoading.value || !lockerId || lockerId === previousLockerId) {
      return
    }

    await autoSelectLocker(String(lockerId))
  }
)

watch(
  [locations, nearestLocation],
  () => {
    syncPreferredLocation()
  },
  { deep: true }
)

watch(
  () => nearestLocation.value?.id,
  (nextNearestId, previousNearestId) => {
    if (nextNearestId && nextNearestId !== previousNearestId) {
      nearestHintDismissed.value = false
    }
  }
)

watch(currentStep, (newStep) => {
  if (newStep === 'choose' && selectedLocationId.value) {
    startPolling(selectedLocationId.value)
  } else if (newStep !== 'choose') {
    stopPolling()
  }
})

onMounted(async () => {
  resolveUserLocation()
  await fetchLocations()
  if (route.params.lockerId) {
    await autoSelectLocker(String(route.params.lockerId))
  }
})

onUnmounted(() => {
  stopTimer()
  stopPolling()
})

async function fetchLocations() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.get('/locations?limit=200')
    locations.value = (response.data || []).map(mapLocationRecord)
    syncPreferredLocation()
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, 'Falha ao carregar o mapa de lockers.')
  } finally {
    isLoading.value = false
  }
}

async function fetchLockers(locationId, quiet = false) {
  if (!locationId) return
  if (!quiet) isLockersLoading.value = true
  isPolling.value = true
  try {
    const response = await api.get(`/lockers?location_id=${locationId}&limit=100`)
    lockers.value = response.data || []
  } catch (requestError) {
    if (!quiet) error.value = getApiErrorMessage(requestError, 'Falha ao carregar os lockers deste local.')
  } finally {
    isLockersLoading.value = false
    isPolling.value = false
  }
}

function startPolling(locationId) {
  stopPolling()
  pollingInterval = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchLockers(locationId, true)
    }
  }, 12000)
}

function stopPolling() {
  if (pollingInterval) {
    window.clearInterval(pollingInterval)
    pollingInterval = null
  }
}

/**
 * @param {any} location
 * @returns {any}
 */
function mapLocationRecord(location) {
  return {
    ...location,
    address: summarizeAddress(location?.address || '')
  }
}

async function autoSelectLocker(lockerId) {
  try {
    const context = await api.get(`/lockers/${lockerId}/public-context`)
    if (context.mode !== 'rent' || context.locker?.status !== 'free') {
      error.value = 'Este locker nao esta disponivel para uma nova ativacao. Use a pagina de retirada do aluguel em andamento.'
      return
    }
    selectedLocationId.value = context.locker.location_id || ''
    selectedLocker.value = context.locker
    currentStep.value = 'biometric'
    animateStep()
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, 'Nao foi possivel abrir este locker pelo QR.')
  }
}

function resolveUserLocation() {
  if (!navigator.geolocation) {
    geoStatus.value = 'fallback'
    geoLabel.value = 'GPS indisponivel neste navegador'
    return
  }
  geoStatus.value = 'pending'
  geoLabel.value = 'Atualizando pelo GPS'
  navigator.geolocation.getCurrentPosition((position) => {
    userLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    geoStatus.value = 'granted'
    geoLabel.value = 'Mapa centrado em voce'
    mapCenter.value = { lat: position.coords.latitude, lng: position.coords.longitude, zoom: 14 }
    syncPreferredLocation()
  }, () => {
    geoStatus.value = 'fallback'
    geoLabel.value = 'Usando centro padrao'
  }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 })
}

function syncPreferredLocation() {
  if (!locations.value.length) {
    selectedLocationId.value = ''
    return
  }

  if (route.params.lockerId || hasManualLocationSelection.value || currentStep.value !== 'choose') {
    if (!selectedLocationId.value) {
      selectedLocationId.value = locations.value[0].id
    }
    return
  }

  const preferredLocationId = nearestLocation.value?.id || locations.value[0].id

  if (preferredLocationId) {
    selectedLocationId.value = preferredLocationId
  }
}

function selectLocation(location) {
  hasManualLocationSelection.value = true
  selectedLocationId.value = location.id
}

function jumpToNearest() {
  if (!nearestLocation.value) {
    return
  }

  nearestHintDismissed.value = true
  hasManualLocationSelection.value = true
  selectedLocationId.value = nearestLocation.value.id
}

function selectLocker(locker) {
  if (locker?.status !== 'free') {
    error.value = 'Este armário não está disponível para um novo aluguel.'
    return
  }

  selectedLocker.value = locker
  currentRental.value = null
  biometricState.value = 'idle'
  linkCopied.value = false
  elapsedSeconds.value = 0
  stopTimer()
  
  globalAnimationState.value = 'preview'
  
  setTimeout(() => {
    currentStep.value = 'biometric'
    error.value = ''
    globalAnimationState.value = 'idle'
    animateStep()
  }, 400)
}

async function startBiometricRegistration() {
  if (!selectedLocker.value?.id) {
    error.value = 'Selecione um locker antes de cadastrar a biometria.'
    return
  }
  biometricState.value = 'scanning'
  actionLoading.value = true
  error.value = ''
  try {
    if (!currentRental.value?.id) {
      currentRental.value = await api.post('/rentals', {
        locker_id: selectedLocker.value.id,
        payment_confirmed: false
      })
    }

    const options = await api.post(`/rentals/${currentRental.value.id}/webauthn/registration-options`)
    const credential = await registerPasskey(options)
    currentRental.value = await api.post(`/rentals/${currentRental.value.id}/webauthn/registrations`, { credential })
    biometricState.value = 'success'
  } catch (requestError) {
    biometricState.value = 'idle'
    error.value = isProbablyWebAuthnError(requestError) ? getWebAuthnErrorMessage(requestError, 'Falha ao cadastrar a biometria deste aparelho.') : getApiErrorMessage(requestError, 'Falha ao cadastrar a biometria deste aparelho.')
  } finally {
    actionLoading.value = false
  }
}

function goToPayment() {
  if (biometricState.value !== 'success') {
    error.value = 'Cadastre a biometria antes de seguir para o pagamento.'
    return
  }

  currentStep.value = 'pay'
  error.value = ''
  animateStep()
}

function goToBiometricStep() {
  currentStep.value = 'biometric'
  error.value = ''
  animateStep()
}

async function confirmInitialPayment() {
  if (!currentRental.value?.id) {
    error.value = 'Cadastre a biometria antes de confirmar o pagamento.'
    return
  }

  actionLoading.value = true
  error.value = ''

  try {
    currentRental.value = await api.post(`/rentals/${currentRental.value.id}/confirm-initial-payment`, {})
    selectedLocker.value = {
      ...selectedLocker.value,
      status: 'occupied',
      status_label: 'Reservado'
    }
    currentStep.value = 'open'
    globalAnimationState.value = 'open'
    animateStep()
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, 'Nao foi possivel confirmar o pagamento inicial.')
  } finally {
    actionLoading.value = false
  }
}

function goToOpen() {
  currentStep.value = 'open'
  globalAnimationState.value = 'open'
  error.value = ''
  animateStep()
}

async function startStoring() {
  if (!currentRental.value?.id) {
    error.value = 'O aluguel não está pronto para iniciar a armazenagem.'
    return
  }
  actionLoading.value = true
  error.value = ''
  try {
    globalAnimationState.value = 'closing'
    await new Promise((resolve) => window.setTimeout(resolve, 280))

    currentRental.value = await api.post(`/rentals/${currentRental.value.id}/start-storing`, {})
    selectedLocker.value = {
      ...selectedLocker.value,
      status: 'occupied',
      status_label: 'Seu locker'
    }
    
    // Save to local storage for the RetrieveEntryView list
    try {
      const activeRentals = JSON.parse(window.localStorage.getItem('fastlock.active_rentals') || '[]')
      activeRentals.push({
        id: currentRental.value.id,
        lockerCode: selectedLocker.value.code,
        size: sizeLabel(selectedLocker.value.size),
        locationName: selectedLocation.value.name,
        startedAt: new Date(resolveUnlockedAt(currentRental.value.unlocked_at) || Date.now()).toISOString()
      })
      window.localStorage.setItem('fastlock.active_rentals', JSON.stringify(activeRentals))
    } catch (err) {}

    currentStep.value = 'storing'
    globalAnimationState.value = 'idle'
    syncTimer()
    animateStep()
  } catch (requestError) {
    globalAnimationState.value = 'open'
    error.value = getApiErrorMessage(requestError, 'Não foi possível iniciar a contagem do locker.')
  } finally {
    actionLoading.value = false
  }
}

function syncTimer() {
  stopTimer()
  const startedAt = resolveUnlockedAt(currentRental.value?.unlocked_at)

  if (!startedAt) {
    elapsedSeconds.value = 0
    return
  }

  const tick = () => {
    elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  }
  tick()
  timerInterval = window.setInterval(tick, 1000)
}

function resolveUnlockedAt(unlockedAt) {
  return normalizeTimestampToNow(unlockedAt)
}

function stopTimer() {
  if (!timerInterval) return
  window.clearInterval(timerInterval)
  timerInterval = null
}

function goToRetrieve() {
  router.push({ name: 'retrieve-entry' })
}

function copyRetrieveLink() {
  if (!retrieveLink.value) return
  navigator.clipboard.writeText(retrieveLink.value)
  linkCopied.value = true
  window.setTimeout(() => { linkCopied.value = false }, 2500)
}

function selectInputText(event) {
  event?.target?.select?.()
}

function goToChoose() {
  currentStep.value = 'choose'
  selectedLocker.value = null
  currentRental.value = null
  biometricState.value = 'idle'
  elapsedSeconds.value = 0
  linkCopied.value = false
  error.value = ''
  globalAnimationState.value = 'idle'
  stopTimer()
  syncPreferredLocation()
  if (route.params.lockerId) {
    router.replace({ name: 'use' })
  }
  animateStep()
}

function animateStep() {
  window.setTimeout(() => {
    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  }, 30)
}

function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[size] || size
}

function formatCents(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100)
}

function isProbablyWebAuthnError(error) {
  return !!error?.name && !error?.response
}
</script>

<style scoped>
@keyframes scan-line {
  0% { top: 0%; }
  100% { top: 100%; }
}

.animate-scan-line {
  animation: scan-line 1.2s ease-in-out infinite alternate;
}

.map-hint-enter-active,
.map-hint-leave-active {
  transition: opacity 180ms cubic-bezier(0.23, 1, 0.32, 1), transform 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.map-hint-enter-from,
.map-hint-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
