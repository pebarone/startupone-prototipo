<template>
  <div class="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6">
    <div class="max-w-2xl mx-auto">

      <!-- Step progress indicator -->
      <div class="mb-8 flex items-center justify-center gap-2">
        <div
          v-for="(s, idx) in steps"
          :key="s.key"
          class="flex items-center gap-2"
        >
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
              currentStepIndex > idx
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/40'
                : currentStepIndex === idx
                  ? 'bg-slate-900 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50'
                  : 'bg-slate-200 text-slate-400'
            ]"
          >
            <svg v-if="currentStepIndex > idx" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span
            v-if="idx < steps.length - 1"
            :class="['hidden sm:block w-8 h-0.5 transition-colors duration-300', currentStepIndex > idx ? 'bg-brand-500' : 'bg-slate-200']"
          />
        </div>
      </div>

      <!-- Step label -->
      <div class="text-center mb-8">
        <p class="text-xs uppercase tracking-widest text-slate-400 font-medium">{{ steps[currentStepIndex]?.label }}</p>
      </div>

      <!-- STEP: ESCOLHER LOCKER -->
      <div v-if="currentStep === 'choose'" class="step-content">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-slate-50">
            <h2 class="text-2xl font-black text-slate-900 mb-1">Lockers Disponíveis</h2>
            <p class="text-slate-500 text-sm">Escolha um locker para guardar seus pertences com segurança.</p>
          </div>
          <div class="p-6">
            <!-- Loading -->
            <div v-if="isLoading" class="flex justify-center py-12">
              <BaseSpinner size="xl" color="brand" />
            </div>
            <!-- Erro -->
            <div v-else-if="error" class="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error }}
            </div>
            <!-- Vazio -->
            <div v-else-if="freeLockers.length === 0" class="text-center py-12">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p class="text-slate-500 font-medium">Nenhum locker disponível no momento.</p>
              <p class="text-slate-400 text-sm mt-1">Tente novamente em alguns instantes.</p>
            </div>
            <!-- Lista -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button
                v-for="locker in freeLockers"
                :key="locker.id"
                @click="selectLocker(locker)"
                class="group relative text-left bg-white border-2 border-slate-200 rounded-xl p-5 cursor-pointer hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50" />
                <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {{ sizeLabel(locker.size) }}
                </div>
                <div class="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors font-mono">
                  {{ locker.code }}
                </div>
                <div class="mt-3 text-xs text-slate-400 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Acesso seguro por código
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP: SIMULAR PAGAMENTO -->
      <div v-if="currentStep === 'pay'" class="step-content">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-black text-slate-900">Confirmar Pagamento</h2>
                <p class="text-slate-500 text-sm">Locker selecionado: <span class="font-bold text-slate-900">{{ selectedLocker?.code }}</span></p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- Summary -->
            <div class="bg-slate-50 rounded-xl p-5 mb-6 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Locker</span>
                <span class="font-semibold text-slate-900 font-mono">{{ selectedLocker?.code }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Tamanho</span>
                <span class="font-semibold text-slate-900">{{ sizeLabel(selectedLocker?.size) }}</span>
              </div>
              <div class="border-t border-slate-200 my-2"/>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700">Total (simulado)</span>
                <span class="text-xl font-black text-slate-900">R$ 5,00</span>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Este é um ambiente de demonstração. Nenhuma cobrança real será realizada.
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-600">
              {{ error }}
            </div>

            <div class="flex gap-3">
              <button
                @click="resetFlow"
                class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                ← Voltar
              </button>
              <button
                @click="simulatePayment"
                :disabled="isLoading"
                id="btn-pagar"
                class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-brand-900 transition-all hover:shadow-xl hover:shadow-brand-900/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BaseSpinner v-if="isLoading" size="sm" color="white" />
                <span>{{ isLoading ? 'Processando...' : 'Pagar via PIX' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP: CÓDIGO DE ACESSO -->
      <div v-if="currentStep === 'code'" class="step-content">
        <div class="bg-white rounded-2xl shadow-2xl border-t-4 border-brand-500 overflow-hidden">
          <div class="p-8 text-center">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wide mb-6">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Pagamento Confirmado
            </div>

            <h2 class="text-xl font-bold text-slate-700 mb-1">Seu Código de Acesso</h2>
            <p class="text-slate-400 text-sm mb-8">Use este código para abrir o locker <strong class="text-slate-700">{{ selectedLocker?.code }}</strong></p>

            <!-- Code display -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 inline-block w-full">
              <div class="text-6xl tracking-[0.3em] font-black text-brand-600 font-mono leading-none">
                {{ accessCode }}
              </div>
              <p class="text-xs text-slate-400 mt-3 font-medium">Código de 6 dígitos — uso único</p>
            </div>

            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-left mb-6 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Anote ou memorize o código. Ele será solicitado no teclado do locker.
            </div>

            <button
              @click="proceedToUnlock"
              id="btn-estar-no-locker"
              class="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-brand-900 transition-colors"
            >
              Já estou no Locker →
            </button>
          </div>
        </div>
      </div>

      <!-- STEP: ABRIR LOCKER -->
      <div v-if="currentStep === 'unlock'" class="step-content">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100 bg-slate-50">
            <h2 class="text-2xl font-black text-slate-900 mb-1">Abrir Locker {{ selectedLocker?.code }}</h2>
            <p class="text-slate-500 text-sm">Digite o código de 6 dígitos no teclado do locker (simulado abaixo).</p>
          </div>

          <div class="p-8">
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600 flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error }}
            </div>

            <input
              v-model="inputCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              placeholder="000000"
              id="input-codigo-acesso"
              class="w-full text-center text-5xl font-mono tracking-[0.4em] font-black p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all mb-6"
              @keyup.enter="attemptUnlock"
            />

            <button
              @click="attemptUnlock"
              :disabled="isLoading || inputCode.length !== 6"
              id="btn-abrir-locker"
              class="w-full py-4 rounded-xl bg-brand-600 text-white font-black text-lg hover:bg-brand-500 transition-all hover:shadow-xl hover:shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <BaseSpinner v-if="isLoading" size="sm" color="white" />
              <span>{{ isLoading ? 'Verificando...' : 'Abrir Locker' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STEP: SUCESSO -->
      <div v-if="currentStep === 'success'" class="step-content">
        <div class="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-2xl shadow-brand-800/30 overflow-hidden p-12 text-center text-white">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur mb-8 shadow-inner">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 class="text-4xl font-black mb-3">Locker Aberto!</h2>
          <p class="text-brand-100 text-lg mb-2">A porta está desbloqueada.</p>
          <p class="text-brand-200 text-sm mb-10">Coloque seus pertences e feche a porta com segurança.</p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="resetFlow"
              id="btn-novo-aluguel"
              class="px-8 py-3 bg-white text-brand-700 rounded-full font-bold hover:bg-brand-50 transition-colors shadow-lg"
            >
              Novo Aluguel
            </button>
            <a
              href="/"
              class="px-8 py-3 bg-brand-700/60 text-white rounded-full font-bold hover:bg-brand-700 transition-colors"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import gsap from 'gsap'

const { error: toastError } = useToast()

/** @type {import('vue').Ref<any[]>} */
const freeLockers = ref([])
/** @type {import('vue').Ref<boolean>} */
const isLoading = ref(true)
/** @type {import('vue').Ref<string|null>} */
const error = ref(null)
/** @type {import('vue').Ref<string>} */
const currentStep = ref('choose')
/** @type {import('vue').Ref<any>} */
const selectedLocker = ref(null)
/** @type {import('vue').Ref<string>} */
const accessCode = ref('')
/** @type {import('vue').Ref<string>} */
const inputCode = ref('')

const steps = [
  { key: 'choose', label: 'Escolher Locker' },
  { key: 'pay', label: 'Pagamento' },
  { key: 'code', label: 'Código' },
  { key: 'unlock', label: 'Abrir' },
  { key: 'success', label: 'Concluído' }
]

const currentStepIndex = computed(() => {
  const idx = steps.findIndex(s => s.key === currentStep.value)
  return idx === -1 ? 0 : idx
})

async function fetchLockers() {
  isLoading.value = true
  error.value = null
  try {
    const res = await api.get('/lockers?status=free')
    const arr = res.data || []
    freeLockers.value = arr.filter(l => l.status === 'free')
  } catch (err) {
    error.value = 'Falha ao carregar lockers disponíveis. Verifique sua conexão.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/** @param {any} locker */
function selectLocker(locker) {
  selectedLocker.value = locker
  currentStep.value = 'pay'
  animateStep()
}

async function simulatePayment() {
  isLoading.value = true
  error.value = null
  await new Promise(r => setTimeout(r, 1200))
  try {
    const res = await api.post('/rentals', {
      locker_id: selectedLocker.value.id
    })
    accessCode.value = res.access_code
    currentStep.value = 'code'
    animateStep()
  } catch (err) {
    error.value = err.response?.data?.message || 'Falha ao criar aluguel. O locker pode não estar disponível.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function proceedToUnlock() {
  currentStep.value = 'unlock'
  animateStep()
}

async function attemptUnlock() {
  if (!inputCode.value || inputCode.value.length !== 6) return
  isLoading.value = true
  error.value = null
  try {
    const res = await api.post('/unlock-events', {
      access_code: inputCode.value
    })
    if (res.message === 'Locker aberto') {
      currentStep.value = 'success'
      animateStep()
    } else {
      error.value = res.message || 'Não foi possível abrir o locker.'
    }
  } catch (err) {
    const msg = err.response?.data?.message
    error.value = msg || 'Código inválido ou expirado. Verifique e tente novamente.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function resetFlow() {
  currentStep.value = 'choose'
  selectedLocker.value = null
  accessCode.value = ''
  inputCode.value = ''
  error.value = null
  fetchLockers()
}

function animateStep() {
  setTimeout(() => {
    gsap.from('.step-content', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' })
  }, 30)
}

/** @param {string} size */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Médio', G: 'Grande' }[size] || size
}

onMounted(() => {
  fetchLockers()
})
</script>
