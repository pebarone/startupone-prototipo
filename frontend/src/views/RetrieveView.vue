<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      <div v-if="isLoading" class="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner size="xl" color="brand" />
          <p class="text-sm text-slate-500">Carregando dados do aluguel...</p>
        </div>
      </div>

      <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {{ loadError }}
      </div>

      <template v-else-if="rental">
        <div class="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Locker</p>
              <p class="mt-1 font-mono text-3xl font-black text-slate-900">{{ rental.locker?.code }}</p>
              <p class="mt-1 text-sm text-slate-500">Tamanho {{ sizeLabel(rental.locker?.size) }}</p>
            </div>

            <div class="text-right">
              <span :class="statusPill(rental.status)">{{ statusText(rental.status) }}</span>
              <p class="mt-2 text-xs text-slate-400">Iniciado {{ formatRelativeTime(rental.started_at) }}</p>
            </div>
          </div>

           <div v-if="lockerVisual" class="mt-6 border-t border-slate-100 pt-6">
             <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Contexto visual</p>
             <div class="max-w-[160px] mx-auto">
                <LockerGrid 
                :lockers="[lockerVisual]" 
                :selected-locker-id="lockerVisual.id"
                  :interactive="false"
                  :global-animation-state="rental.status === 'finished' ? 'open' : 'idle'"
                />
             </div>
          </div>

          <div v-if="rental.status === 'storing'" class="mt-6 rounded-xl bg-slate-900 px-5 py-4 text-center">
            <p class="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tempo decorrido</p>
            <div class="font-mono text-4xl font-black tracking-widest text-white">{{ timerDisplay }}</div>
            <p class="mt-2 text-xs text-slate-400">
              Custo acumulado estimado:
              <span class="font-semibold text-brand-400">{{ formatCents(accumulatedCost) }}</span>
            </p>
          </div>
        </div>

        <div v-if="rental.status === 'active'" class="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-6 text-center shadow-sm">
          <h2 class="text-xl font-black tracking-tight text-slate-900">Ativacao ainda em andamento</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Este aluguel ja foi criado, mas o locker ainda nao entrou em armazenagem. Feche o locker na etapa de ativacao para comecar a contagem e liberar a retirada.
          </p>
        </div>

        <div v-else-if="rental.status === 'storing' && currentStep === 'verify'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
          <h2 class="mb-2 text-2xl font-black tracking-tight text-white">Verificacao biometrica</h2>
          <p class="mx-auto mb-8 max-w-sm text-sm text-slate-300">
            Esta pagina ja identifica o aluguel e o locker corretos. Sua digital apenas autoriza a retirada.
          </p>

          <div class="mx-auto mb-8 flex h-40 w-40 items-center justify-center">
            <div class="relative flex h-full w-full items-center justify-center">
              <div :class="['absolute inset-0 rounded-full border-4 transition-all duration-700', bioState === 'scanning' ? 'border-brand-400 opacity-30 animate-ping' : 'border-transparent']" />
              <div :class="['absolute inset-2 rounded-full border-2 transition-all duration-500', bioState === 'scanning' ? 'border-brand-400/60' : bioState === 'success' ? 'border-brand-500' : 'border-slate-600']" />
              <div :class="['flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500', bioState === 'idle' ? 'bg-slate-700' : bioState === 'scanning' ? 'bg-brand-900/50' : 'bg-brand-600']">
                <svg class="h-14 w-14" :class="bioState === 'success' ? 'text-white' : 'text-slate-300'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M12 1C8.13 1 5 4.13 5 8v1H4C2.9 9 2 9.9 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div v-if="bioState === 'scanning'" class="absolute inset-4 overflow-hidden rounded-full">
                <div class="absolute h-0.5 w-full animate-scan-line bg-brand-400/80" />
              </div>
              <div v-if="bioState === 'success'" class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                <svg class="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <p class="mb-6 text-sm font-semibold text-white">{{ bioLabel }}</p>
          <div v-if="!webauthnSupported" class="mx-auto mb-4 max-w-md rounded-lg border border-amber-400/30 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">
            {{ webauthnSupportHint }}
          </div>
          <div v-if="actionError" class="mx-auto mb-4 max-w-md rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">
            {{ actionError }}
          </div>

          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200"
            :class="bioState === 'scanning' ? 'cursor-wait bg-white/10 text-white' : 'bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-500'"
            :disabled="bioState === 'scanning' || isSubmitting || !webauthnSupported"
            @click="authenticateAndRetrieve"
          >
            <BaseSpinner v-if="bioState === 'scanning' || isSubmitting" size="sm" color="white" />
            <span>{{ bioState === 'scanning' || isSubmitting ? 'Lendo digital...' : 'Ler digital e liberar locker' }}</span>
          </button>
        </div>

        <div v-else-if="currentStep === 'payment'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6">
            <h2 class="text-2xl font-black tracking-tight text-slate-900">Locker liberado</h2>
            <p class="mt-1 text-sm text-slate-500">
              A biometria ja autorizou a retirada. Agora finalize a cobranca simulada deste aluguel.
            </p>
          </div>

          <div class="px-6 py-6">
            <div class="mb-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa inicial (ja paga)</span>
                <span class="font-semibold text-emerald-600">{{ formatCents(rental.initial_fee_cents) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Tempo de uso</span>
                <span class="font-semibold text-slate-900">{{ displayMinutes }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa por hora</span>
                <span class="font-semibold text-slate-900">{{ formatCents(rental.hourly_rate_cents) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800">Total a pagar agora</span>
                  <span class="text-3xl font-black tracking-tight text-slate-900">{{ formatCents(extraChargeCents) }}</span>
                </div>
              </div>
            </div>

            <div v-if="extraChargeCents > 0" class="mb-4 flex flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5">
              <p class="mb-3 text-sm font-semibold text-brand-700">Escaneie o QR Code PIX</p>
              <svg viewBox="0 0 120 120" class="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="120" fill="white" rx="6" />
                <rect x="8" y="8" width="30" height="30" rx="3" fill="#111827" />
                <rect x="12" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="16" width="14" height="14" rx="1" fill="#111827" />
                <rect x="82" y="8" width="30" height="30" rx="3" fill="#111827" />
                <rect x="86" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="90" y="16" width="14" height="14" rx="1" fill="#111827" />
                <rect x="8" y="82" width="30" height="30" rx="3" fill="#111827" />
                <rect x="12" y="86" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="90" width="14" height="14" rx="1" fill="#111827" />
                <rect x="46" y="46" width="28" height="28" rx="4" fill="#16a34a" />
                <rect x="52" y="52" width="16" height="16" rx="2" fill="white" />
              </svg>
            </div>

            <div v-else class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Nenhuma taxa extra. O locker ja foi liberado e este aluguel pode ser encerrado agora.
            </div>

            <div v-if="actionError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ actionError }}
            </div>

            <button
              type="button"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="confirmPayment"
            >
              <BaseSpinner v-if="isSubmitting" size="sm" color="white" />
              <span>{{ isSubmitting ? 'Finalizando...' : paymentButtonLabel }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="currentStep === 'done' || ['finished', 'cancelled'].includes(rental.status)" class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-4xl font-black tracking-tight text-white">Tudo certo!</h2>
          <p class="mt-3 text-lg text-brand-100">Seus itens foram retirados e o locker esta livre.</p>

          <div class="mx-auto mt-6 max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 text-left">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-white/80">
                <span>Taxa inicial</span>
                <span class="font-semibold text-white">{{ formatCents(rental.initial_fee_cents) }}</span>
              </div>
              <div class="flex justify-between text-white/80">
                <span>Taxa extra</span>
                <span class="font-semibold text-white">{{ formatCents(extraChargeCents) }}</span>
              </div>
              <div class="flex justify-between border-t border-white/20 pt-2">
                <span class="font-bold text-white">Total</span>
                <span class="text-xl font-black text-white">{{ formatCents(totalCents) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="/use" class="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50">
              Novo aluguel
            </a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import LockerGrid from '@/components/lockers/LockerGrid.vue'
import { api } from '@/composables/useApi'
import { authenticatePasskey, getWebAuthnErrorMessage, getWebAuthnSupportHint, getWebAuthnSupportState } from '@/composables/useWebAuthn'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const rentalId = computed(() => String(route.params.rentalId || ''))

const rental = ref(null)
const retrieval = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const actionError = ref('')
const bioState = ref('idle')
const currentStep = ref('verify')
const elapsedSeconds = ref(0)

const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()

let timerInterval = null

const bioLabel = computed(() => {
  if (bioState.value === 'scanning') return 'Verificando a credencial deste aparelho...'
  if (bioState.value === 'success') return 'Digital confirmada com sucesso!'
  return 'Pressione para verificar sua digital'
})
const timerDisplay = computed(() => formatElapsedTime(elapsedSeconds.value))
const accumulatedCost = computed(() => {
  if (!rental.value) return 0
  return (Math.ceil(Math.max(0, elapsedSeconds.value) / 3600) || 1) * (rental.value.hourly_rate_cents || 0)
})
const extraChargeCents = computed(() => retrieval.value?.extra_charge_cents ?? rental.value?.extra_charge_cents ?? 0)
const totalCents = computed(() => retrieval.value?.total_cents ?? rental.value?.total_cents ?? rental.value?.initial_fee_cents ?? 0)
const displayMinutes = computed(() => formatMinutes(retrieval.value?.minutes_used ?? deriveMinutesUsed(rental.value)))
const paymentButtonLabel = computed(() => (extraChargeCents.value > 0 ? 'Confirmar pagamento e encerrar aluguel' : 'Encerrar aluguel'))
const lockerVisual = computed(() => {
  if (!rental.value?.locker) {
    return null
  }

  if (rental.value.status === 'storing') {
    return {
      ...rental.value.locker,
      status: 'free',
      status_label: 'Seu locker'
    }
  }

  if (rental.value.status === 'pending_retrieval_payment') {
    return {
      ...rental.value.locker,
      status: 'free',
      status_label: 'Pagamento'
    }
  }

  return rental.value.locker
})

watch(rentalId, async () => {
  await loadRental()
})

onMounted(async () => {
  await loadRental()
})

onUnmounted(() => {
  stopTimer()
})

async function loadRental() {
  isLoading.value = true
  loadError.value = ''
  actionError.value = ''
  retrieval.value = null
  bioState.value = 'idle'
  stopTimer()

  try {
    const data = await api.get(`/rentals/${rentalId.value}`)
    rental.value = data

    if (data.status === 'storing') {
      syncTimer(data)
      currentStep.value = 'verify'
      return
    }

    if (data.status === 'pending_retrieval_payment') {
      retrieval.value = {
        minutes_used: deriveMinutesUsed(data),
        extra_charge_cents: data.extra_charge_cents,
        total_cents: data.total_cents
      }
      currentStep.value = 'payment'
      return
    }

    if (['finished', 'cancelled'].includes(data.status)) {
      currentStep.value = 'done'
      return
    }

    currentStep.value = 'verify'
  } catch (requestError) {
    loadError.value = getApiErrorMessage(requestError, 'Nao foi possivel localizar este aluguel.')
  } finally {
    isLoading.value = false
  }
}

async function authenticateAndRetrieve() {
  if (!rental.value?.id) {
    actionError.value = 'Este aluguel nao esta pronto para retirada.'
    return
  }

  bioState.value = 'scanning'
  isSubmitting.value = true
  actionError.value = ''

  try {
    const options = await api.post(`/rentals/${rental.value.id}/webauthn/authentication-options`)
    const credential = await authenticatePasskey(options)
    retrieval.value = await api.post(`/rentals/${rental.value.id}/retrieve`, { credential })

    rental.value = {
      ...rental.value,
      status: 'pending_retrieval_payment',
      retrieved_at: new Date().toISOString(),
      extra_charge_cents: retrieval.value.extra_charge_cents,
      total_cents: retrieval.value.total_cents
    }

    currentStep.value = 'payment'
    bioState.value = 'success'
    stopTimer()
  } catch (requestError) {
    bioState.value = 'idle'
    actionError.value = isProbablyWebAuthnError(requestError)
      ? getWebAuthnErrorMessage(requestError, 'Falha ao validar a biometria deste aparelho.')
      : getApiErrorMessage(requestError, 'Falha ao validar a biometria deste aparelho.')
  } finally {
    isSubmitting.value = false
  }
}

async function confirmPayment() {
  if (!rental.value?.id) {
    actionError.value = 'Nao existe uma retirada pendente para este aluguel.'
    return
  }

  isSubmitting.value = true
  actionError.value = ''

  try {
    rental.value = await api.post(`/rentals/${rental.value.id}/confirm-retrieval`)
    currentStep.value = 'done'

    try {
      let activeRentals = JSON.parse(window.localStorage.getItem('fastlock.active_rentals') || '[]')
      activeRentals = activeRentals.filter(r => r.id !== rental.value.id)
      window.localStorage.setItem('fastlock.active_rentals', JSON.stringify(activeRentals))
    } catch (e) {}
  } catch (requestError) {
    actionError.value = getApiErrorMessage(requestError, 'Nao foi possivel finalizar a retirada.')
  } finally {
    isSubmitting.value = false
  }
}

function syncTimer(currentRental) {
  stopTimer()

  if (!currentRental?.unlocked_at) {
    elapsedSeconds.value = 0
    return
  }

  let startedAt = new Date(currentRental.unlocked_at).getTime()
  if (startedAt > Date.now()) {
    startedAt = Date.now()
  }
  const baseElapsed = Number.isFinite(currentRental.elapsed_seconds)
    ? Number(currentRental.elapsed_seconds)
    : Math.max(0, Math.floor((Date.now() - startedAt) / 1000))

  const render = () => {
    const delta = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
    elapsedSeconds.value = Math.max(baseElapsed, delta)
  }

  render()
  timerInterval = window.setInterval(render, 1000)
}

function stopTimer() {
  if (!timerInterval) return
  window.clearInterval(timerInterval)
  timerInterval = null
}

function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[size] || size
}

function statusText(status) {
  return {
    active: 'Ativacao pendente',
    storing: 'Armazenando',
    pending_retrieval_payment: 'Aguardando pagamento',
    finished: 'Finalizado',
    cancelled: 'Cancelado'
  }[status] || status
}

function statusPill(status) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border '

  return {
    active: `${base}border-blue-200 bg-blue-50 text-blue-700`,
    storing: `${base}border-amber-200 bg-amber-50 text-amber-700`,
    pending_retrieval_payment: `${base}border-brand-200 bg-brand-50 text-brand-700`,
    finished: `${base}border-emerald-200 bg-emerald-50 text-emerald-700`,
    cancelled: `${base}border-slate-200 bg-slate-50 text-slate-600`
  }[status] || `${base}border-slate-200 bg-slate-50 text-slate-600`
}

function formatCents(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100)
}

function formatMinutes(minutes) {
  if (!minutes || minutes < 1) return '< 1 min'

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (!hours) return `${minutes} min`
  return remainder ? `${hours}h ${remainder}min` : `${hours}h`
}

function formatRelativeTime(date) {
  if (!date) return ''

  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `ha ${minutes} min`

  const hours = Math.floor(minutes / 60)
  return `ha ${hours}h`
}

function formatElapsedTime(seconds) {
  const total = Math.max(0, Number(seconds) || 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function deriveMinutesUsed(currentRental) {
  if (!currentRental?.unlocked_at) {
    return 0
  }

  const finishedAt = currentRental.retrieved_at ? new Date(currentRental.retrieved_at).getTime() : Date.now()
  const startedAt = new Date(currentRental.unlocked_at).getTime()
  return Math.max(1, Math.ceil((finishedAt - startedAt) / 60000))
}

function isProbablyWebAuthnError(error) {
  return !!error?.name && !error?.response
}
</script>

<style scoped>
@keyframes scan-line {
  0% {
    top: 0%;
  }

  100% {
    top: 100%;
  }
}

.animate-scan-line {
  animation: scan-line 1.2s ease-in-out infinite alternate;
}
</style>
