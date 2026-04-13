<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6">
    <div class="mx-auto max-w-2xl">

      <!-- Header -->
      <div class="mb-8 text-center step-content">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 mb-4">
          <span class="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          Aluguel ativo
        </div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Retirar seus itens</h1>
        <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
          Verifique sua identidade com a biometria cadastrada e pague o tempo extra utilizado para liberar seu locker.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex min-h-[300px] items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner size="xl" color="brand" />
          <p class="text-sm text-slate-500">Carregando dados do aluguel...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900 mb-2">Aluguel não encontrado</h2>
        <p class="text-sm text-slate-500 mb-5">{{ loadError }}</p>
        <a href="/use" class="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-brand-900 transition-colors">
          Novo aluguel
        </a>
      </div>

      <!-- Already finished -->
      <div v-else-if="rental && (rental.status === 'finished' || rental.status === 'cancelled')" class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900 mb-2">Este aluguel já foi finalizado</h2>
        <p class="text-sm text-slate-500 mb-5">Código do locker: <span class="font-mono font-black text-slate-900">{{ rental.locker?.code }}</span></p>
        <a href="/use" class="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-brand-900 transition-colors">
          Fazer novo aluguel
        </a>
      </div>

      <!-- Active rental flow -->
      <template v-else-if="rental">

        <!-- Rental info card -->
        <div class="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-4 flex-wrap">
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

          <!-- Timer (if storing) -->
          <div v-if="rental.status === 'storing'" class="mt-4 rounded-xl bg-slate-900 px-5 py-4 text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1">Tempo decorrido</p>
            <div class="font-mono text-4xl font-black text-white tracking-widest">{{ timerDisplay }}</div>
            <p class="mt-2 text-xs text-slate-400">Custo acumulado estimado: <span class="text-brand-400 font-semibold">{{ formatCents(accumulatedCost) }}</span></p>
          </div>
        </div>

        <!-- Step: Biometric Verification -->
        <div v-if="currentStep === 'verify'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl step-content">
          <h2 class="text-2xl font-black tracking-tight text-white mb-2">Verificação biométrica</h2>
          <p class="text-sm text-slate-300 max-w-sm mx-auto mb-8">Confirme sua identidade para calcular o tempo e abrir o locker.</p>

          <div class="mx-auto mb-8 relative w-36 h-36 flex items-center justify-center">
            <div :class="['absolute inset-0 rounded-full border-4 transition-all duration-700', bioState === 'scanning' ? 'border-brand-400 animate-ping opacity-30' : 'border-transparent']" />
            <div :class="['absolute inset-2 rounded-full border-2 transition-all duration-500', bioState === 'scanning' ? 'border-brand-400/60' : bioState === 'success' ? 'border-brand-500' : 'border-slate-600']" />
            <div :class="['w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500', bioState === 'idle' ? 'bg-slate-700' : bioState === 'scanning' ? 'bg-brand-900/50' : 'bg-brand-600']">
              <svg class="w-12 h-12" :class="bioState === 'success' ? 'text-white' : 'text-slate-300'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M12 1C8.13 1 5 4.13 5 8v1H4C2.9 9 2 9.9 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
            <div v-if="bioState === 'scanning'" class="absolute inset-4 overflow-hidden rounded-full">
              <div class="w-full h-0.5 bg-brand-400/80 absolute animate-scan-line" />
            </div>
            <div v-if="bioState === 'success'" class="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <p class="text-sm font-semibold text-white mb-6">
            {{ bioState === 'idle' ? 'Pressione para verificar sua digital' : bioState === 'scanning' ? 'Verificando...' : '✓ Identidade confirmada!' }}
          </p>

          <div v-if="actionError" class="mb-4 rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">{{ actionError }}</div>

          <button
            v-if="bioState !== 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200"
            :class="bioState === 'scanning' ? 'bg-white/10 text-white cursor-wait' : 'bg-brand-600 text-white hover:bg-brand-500 hover:-translate-y-0.5'"
            :disabled="bioState === 'scanning'"
            @click="startScan"
          >
            <BaseSpinner v-if="bioState === 'scanning'" size="sm" color="white" />
            <span>{{ bioState === 'scanning' ? 'Verificando...' : 'Verificar Digital' }}</span>
          </button>

          <button
            v-if="bioState === 'success'"
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-400 transition-all duration-200"
            :disabled="isSubmitting"
            @click="submitRetrieval"
          >
            <BaseSpinner v-if="isSubmitting" size="sm" color="white" />
            <span>{{ isSubmitting ? 'Calculando...' : 'Ver cobrança e retirar' }}</span>
          </button>
        </div>

        <!-- Step: Extra Payment -->
        <div v-if="currentStep === 'payment'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm step-content">
          <div class="border-b border-slate-100 px-6 py-6">
            <h2 class="text-2xl font-black tracking-tight text-slate-900">Resumo da locação</h2>
            <p class="mt-1 text-sm text-slate-500">Confirme o pagamento para liberar o locker.</p>
          </div>

          <div class="px-6 py-6">
            <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 mb-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa inicial (já paga)</span>
                <span class="font-semibold text-emerald-600">{{ formatCents(rental.initial_fee_cents) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Tempo de uso</span>
                <span class="font-semibold text-slate-900">{{ retrieval ? formatMinutes(retrieval.minutes_used) : '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa por hora ({{ formatCents(rental.hourly_rate_cents) }}/h)</span>
                <span class="font-semibold text-slate-900">{{ formatCents(retrieval?.extra_charge_cents ?? 0) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800">Total a pagar agora</span>
                  <span class="text-3xl font-black tracking-tight text-slate-900">{{ formatCents(retrieval?.extra_charge_cents ?? 0) }}</span>
                </div>
              </div>
            </div>

            <!-- PIX QR -->
            <div v-if="(retrieval?.extra_charge_cents ?? 0) > 0" class="flex flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5 mb-4">
              <p class="mb-3 text-sm font-semibold text-brand-700">Escaneie o QR Code PIX</p>
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
              <p class="mt-2 text-xs text-slate-500">FastLock · {{ formatCents(retrieval?.extra_charge_cents ?? 0) }}</p>
            </div>
            <div v-else class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-4">
              🎉 Nenhuma taxa extra! Seu locker foi usado por menos de 1 hora.
            </div>

            <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 mb-6">
              🔬 Demonstração — nenhuma cobrança real.
            </div>

            <div v-if="actionError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ actionError }}</div>

            <button
              type="button"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-500 transition-all duration-200 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="confirmPayment"
            >
              <BaseSpinner v-if="isSubmitting" size="sm" color="white" />
              <span>{{ isSubmitting ? 'Finalizando...' : 'Confirmar pagamento e retirar' }}</span>
            </button>
          </div>
        </div>

        <!-- Step: Done -->
        <div v-if="currentStep === 'done'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)] step-content">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white mb-6">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-4xl font-black tracking-tight text-white">Tudo certo!</h2>
          <p class="mt-3 text-lg text-brand-100">Seus itens foram retirados e o locker está livre.</p>

          <div class="mx-auto mt-6 max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 mb-3">Recibo</p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-white/80"><span>Taxa inicial</span><span class="font-semibold text-white">{{ formatCents(rental.initial_fee_cents) }}</span></div>
              <div class="flex justify-between text-white/80"><span>Taxa extra</span><span class="font-semibold text-white">{{ formatCents(retrieval?.extra_charge_cents ?? 0) }}</span></div>
              <div class="border-t border-white/20 pt-2 flex justify-between"><span class="font-bold text-white">Total</span><span class="text-xl font-black text-white">{{ formatCents(retrieval?.total_cents ?? rental.initial_fee_cents) }}</span></div>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/use" class="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 hover:-translate-y-0.5 hover:bg-brand-50 transition-all duration-200">
              Novo aluguel
            </a>
            <a href="/" class="inline-flex h-11 items-center justify-center rounded-xl bg-brand-700/60 px-6 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-700 transition-all duration-200">
              Voltar ao início
            </a>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const rentalId = computed(() => route.params.rentalId)

// ── State ──────────────────────────────────────────────────

/** @type {import('vue').Ref<any>} */
const rental = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const actionError = ref('')
const currentStep = ref('verify')

// Biometric
const bioState = ref('idle')

/** @type {import('vue').Ref<any>} */
const retrieval = ref(null)

// Timer (for storing status)
let timerInterval = null
const elapsedSeconds = ref(0)
const timerBaseSeconds = ref(0)
const timerBaseStartedAt = ref(0)

// ── Computed ───────────────────────────────────────────────

const timerDisplay = computed(() => {
  const total = Math.max(0, elapsedSeconds.value)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const accumulatedCost = computed(() => {
  if (!rental.value) return 0
  const secs = Math.max(0, elapsedSeconds.value)
  const hours = Math.ceil(secs / 3600) || 1
  return hours * rental.value.hourly_rate_cents
})

// ── Lifecycle ──────────────────────────────────────────────

onMounted(async () => {
  await loadRental()
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

// ── Methods ────────────────────────────────────────────────

async function loadRental() {
  isLoading.value = true
  loadError.value = ''
  clearInterval(timerInterval)
  timerInterval = null

  try {
    const data = await api.get(`/rentals/${rentalId.value}`)
    rental.value = data

    if (data.status === 'storing' && data.unlocked_at) {
      timerBaseSeconds.value = Number.isFinite(data.elapsed_seconds) ? Number(data.elapsed_seconds) : 0
      timerBaseStartedAt.value = Date.now()
      elapsedSeconds.value = timerBaseSeconds.value
      timerInterval = setInterval(() => {
        const localDeltaSeconds = Math.floor((Date.now() - timerBaseStartedAt.value) / 1000)
        elapsedSeconds.value = Math.max(0, timerBaseSeconds.value + localDeltaSeconds)
      }, 1000)
    }

    if (data.status === 'pending_retrieval_payment') {
      // Already retrieved, just need payment
      retrieval.value = {
        minutes_used: data.retrieved_at && data.unlocked_at
          ? Math.ceil((new Date(data.retrieved_at) - new Date(data.unlocked_at)) / 60000)
          : 0,
        extra_charge_cents: data.extra_charge_cents,
        total_cents: data.total_cents
      }
      currentStep.value = 'payment'
    }

    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  } catch (err) {
    console.error(err)
    loadError.value = err?.response?.data?.detail || 'Aluguel não encontrado ou já encerrado.'
  } finally {
    isLoading.value = false
  }
}

async function startScan() {
  bioState.value = 'scanning'
  actionError.value = ''
  await new Promise(r => setTimeout(r, 2000))
  bioState.value = 'success'
}

async function submitRetrieval() {
  if (!rental.value) return
  isSubmitting.value = true
  actionError.value = ''
  clearInterval(timerInterval)

  try {
    // Use the stored biometric token from the rental
    const result = await api.post(`/rentals/${rentalId.value}/retrieve`, {
      biometric_token: rental.value.biometric_token || `bio_sim_${Date.now()}`
    })
    retrieval.value = result
    currentStep.value = 'payment'
    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  } catch (err) {
    console.error(err)
    actionError.value = err?.response?.data?.detail || 'Falha na verificação biométrica.'
    bioState.value = 'idle'
  } finally {
    isSubmitting.value = false
  }
}

async function confirmPayment() {
  isSubmitting.value = true
  actionError.value = ''

  await new Promise(r => setTimeout(r, 800))

  try {
    await api.post(`/rentals/${rentalId.value}/confirm-retrieval`)
    currentStep.value = 'done'
    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  } catch (err) {
    console.error(err)
    actionError.value = err?.response?.data?.detail || 'Falha ao finalizar o aluguel.'
  } finally {
    isSubmitting.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────

/** @param {string} size */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Médio', G: 'Grande' }[size] || size
}

/** @param {string} status */
function statusText(status) {
  return { active: 'Aguardando biometria', storing: 'Armazenando', pending_retrieval_payment: 'Aguardando pagamento', finished: 'Finalizado', cancelled: 'Cancelado' }[status] || status
}

/** @param {string} status */
function statusPill(status) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border '
  return {
    active: base + 'border-blue-200 bg-blue-50 text-blue-700',
    storing: base + 'border-amber-200 bg-amber-50 text-amber-700',
    pending_retrieval_payment: base + 'border-brand-200 bg-brand-50 text-brand-700',
    finished: base + 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: base + 'border-slate-200 bg-slate-50 text-slate-600',
  }[status] || base + 'border-slate-200 bg-slate-50 text-slate-600'
}

/** @param {number} cents */
function formatCents(cents) {
  if (!cents && cents !== 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/** @param {number} minutes */
function formatMinutes(minutes) {
  if (!minutes || minutes < 1) return '< 1 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/** @param {string | Date} date */
function formatRelativeTime(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  if (diff < 0) return 'agora'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const h = Math.floor(mins / 60)
  return `há ${h}h`
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
