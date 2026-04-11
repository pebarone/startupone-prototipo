<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8 flex items-center justify-center gap-2">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="flex items-center gap-2"
        >
          <div
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
              currentStepIndex > index
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : currentStepIndex === index
                  ? 'bg-slate-900 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50'
                  : 'bg-slate-200 text-slate-400'
            ]"
          >
            <svg v-if="currentStepIndex > index" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            v-if="index < steps.length - 1"
            class="hidden h-0.5 w-8 transition-colors duration-300 sm:block"
            :class="currentStepIndex > index ? 'bg-brand-500' : 'bg-slate-200'"
          />
        </div>
      </div>

      <div class="mb-8 text-center">
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{{ steps[currentStepIndex]?.label }}</p>
      </div>

      <section v-if="currentStep === 'choose'" class="step-content">
        <div class="mb-6 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Mapa de lockers</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Escolha um ponto no mapa</h1>
          <p class="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            As bolhas mostram quantos lockers livres existem em cada local. Selecione um ponto para ver os lockers disponíveis e seguir para o aluguel.
          </p>
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
          <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Ainda não existem lockers vinculados a uma localização pública. Tente novamente em instantes.
          </p>
        </div>

        <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div class="space-y-4">
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div class="mb-4 flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  Pontos com lockers livres
                </span>
                <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-slate-500" />
                  Sem lockers livres no momento
                </span>
              </div>

              <LockerMap
                :locations="locations"
                :selected-location-id="selectedLocationId"
                height="520px"
                @select-location="selectLocation"
              />
            </div>
          </div>

          <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <template v-if="selectedLocation">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Local selecionado</p>
              <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900">{{ selectedLocation.name }}</h2>
              <p class="mt-3 text-sm leading-6 text-slate-500">{{ selectedLocation.address }}</p>

              <div class="mt-5 grid grid-cols-2 gap-3">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Livres</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.free_lockers }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.total_lockers }}</p>
                </div>
              </div>

              <div class="mt-6">
                <div class="mb-3 flex items-center justify-between">
                  <p class="text-sm font-semibold text-slate-900">Lockers disponíveis</p>
                  <span class="text-xs font-medium text-slate-400">{{ availableLockers.length }} opção{{ availableLockers.length === 1 ? '' : 'es' }}</span>
                </div>

                <div v-if="availableLockers.length" class="space-y-2">
                  <button
                    v-for="locker in availableLockers"
                    :key="locker.id"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-[border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md active:scale-[0.98]"
                    @click="selectLocker(locker)"
                  >
                    <div>
                      <p class="font-mono text-sm font-black text-slate-900">{{ locker.code }}</p>
                      <p class="mt-1 text-xs font-medium text-slate-400">Tamanho {{ sizeLabel(locker.size) }}</p>
                    </div>
                    <span class="text-sm font-semibold text-brand-600">Alugar</span>
                  </button>
                </div>

                <div v-else class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Este ponto está sem lockers livres agora. Escolha outra bolha no mapa.
                </div>
              </div>
            </template>

            <div v-else class="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm text-slate-500">
              Selecione uma bolha no mapa para ver os lockers disponíveis nesse local.
            </div>
          </aside>
        </div>
      </section>

      <section v-if="currentStep === 'pay'" class="step-content">
        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-black tracking-tight text-slate-900">Confirmar aluguel</h2>
                <p class="mt-1 text-sm text-slate-500">
                  Locker selecionado:
                  <span class="font-mono font-black text-slate-900">{{ selectedLocker?.code }}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="px-6 py-6 sm:px-8">
            <div class="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Locker</span>
                <span class="font-mono font-semibold text-slate-900">{{ selectedLocker?.code }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Tamanho</span>
                <span class="font-semibold text-slate-900">{{ sizeLabel(selectedLocker?.size) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Local</span>
                <span class="font-semibold text-slate-900">{{ selectedLocation?.name }}</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-700">Total simulado</span>
                  <span class="text-2xl font-black tracking-tight text-slate-900">R$ 5,00</span>
                </div>
              </div>
            </div>

            <div class="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-700">
              Este é um ambiente de demonstração. Nenhuma cobrança real será processada.
            </div>

            <div v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {{ error }}
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-[border-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 active:scale-[0.98]"
                @click="resetFlow"
              >
                Voltar
              </button>

              <button
                id="btn-pagar"
                type="button"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading"
                @click="simulatePayment"
              >
                <BaseSpinner v-if="isLoading" size="sm" color="white" />
                <span>{{ isLoading ? 'Processando...' : 'Pagar via PIX' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 'code'" class="step-content">
        <div class="overflow-hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Pagamento confirmado
          </div>

          <h2 class="mt-6 text-3xl font-black tracking-tight text-white">Seu código de acesso</h2>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-100">
            Use este código no locker <span class="font-mono font-black text-white">{{ selectedLocker?.code }}</span> para liberar a abertura.
          </p>

          <div class="mx-auto mt-8 max-w-lg rounded-lg border border-white/15 bg-white/10 px-6 py-8 backdrop-blur">
            <p class="font-mono text-5xl font-black tracking-[0.3em] text-white sm:text-6xl">{{ accessCode }}</p>
            <p class="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-brand-100">Código de uso único</p>
          </div>

          <div class="mx-auto mt-6 max-w-xl rounded-lg border border-amber-200/30 bg-amber-300/10 px-4 py-4 text-left text-sm text-amber-100">
            Anote o código antes de chegar ao locker. Se ele expirar ou for usado, um novo aluguel será necessário.
          </div>

          <button
            id="btn-estar-no-locker"
            type="button"
            class="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-brand-700 transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.98]"
            @click="proceedToUnlock"
          >
            Já estou no locker
          </button>
        </div>
      </section>

      <section v-if="currentStep === 'unlock'" class="step-content">
        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <h2 class="text-2xl font-black tracking-tight text-slate-900">Abrir locker {{ selectedLocker?.code }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">Digite o código de 6 dígitos no teclado do locker para simular a abertura.</p>
          </div>

          <div class="px-6 py-6 sm:px-8">
            <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {{ error }}
            </div>

            <input
              id="input-codigo-acesso"
              v-model="inputCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              placeholder="000000"
              class="w-full rounded-lg border-2 border-slate-200 bg-slate-50 px-6 py-6 text-center font-mono text-5xl font-black tracking-[0.35em] text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              @keyup.enter="attemptUnlock"
            />

            <button
              id="btn-abrir-locker"
              type="button"
              class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-base font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading || inputCode.length !== 6"
              @click="attemptUnlock"
            >
              <BaseSpinner v-if="isLoading" size="sm" color="white" />
              <span>{{ isLoading ? 'Verificando...' : 'Abrir locker' }}</span>
            </button>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 'success'" class="step-content">
        <div class="overflow-hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white shadow-inner">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 11V7a4 4 0 1 1 8 0m-4 8v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
            </svg>
          </div>

          <h2 class="mt-8 text-4xl font-black tracking-tight text-white">Locker aberto</h2>
          <p class="mt-3 text-lg text-brand-100">A porta está desbloqueada para uso.</p>
          <p class="mt-2 text-sm text-brand-200">Coloque seus pertences, feche a porta e finalize quando precisar.</p>

          <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              id="btn-novo-aluguel"
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-brand-700 transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.98]"
              @click="resetFlow"
            >
              Novo aluguel
            </button>

            <a
              href="/"
              class="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700/60 px-5 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98]"
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import gsap from 'gsap'
import LockerMap from '@/components/map/LockerMap.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'

/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const selectedLocationId = ref('')
const isLoading = ref(true)
const error = ref('')
const currentStep = ref('choose')
const selectedLocker = ref(null)
const accessCode = ref('')
const inputCode = ref('')

const steps = [
  { key: 'choose', label: 'Mapa' },
  { key: 'pay', label: 'Pagamento' },
  { key: 'code', label: 'Código' },
  { key: 'unlock', label: 'Abrir' },
  { key: 'success', label: 'Concluído' }
]

const currentStepIndex = computed(() => {
  const index = steps.findIndex((step) => step.key === currentStep.value)
  return index === -1 ? 0 : index
})

const selectedLocation = computed(() =>
  locations.value.find((location) => location.id === selectedLocationId.value) || null
)

const availableLockers = computed(() => selectedLocation.value?.available_lockers || [])

onMounted(() => {
  fetchLocations()
})

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

    const hasCurrentSelection = nextLocations.some((location) => location.id === selectedLocationId.value)

    if (hasCurrentSelection) {
      return
    }

    const preferredLocation = nextLocations.find((location) => Number(location.free_lockers) > 0) || nextLocations[0]
    selectedLocationId.value = preferredLocation.id
  } catch (requestError) {
    console.error(requestError)
    error.value = 'Falha ao carregar o mapa de lockers. Tente novamente em alguns instantes.'
  } finally {
    isLoading.value = false
  }
}

/**
 * @param {any} location
 */
function selectLocation(location) {
  selectedLocationId.value = location.id
}

/**
 * @param {any} locker
 */
function selectLocker(locker) {
  selectedLocker.value = locker
  currentStep.value = 'pay'
  animateStep()
}

async function simulatePayment() {
  isLoading.value = true
  error.value = ''

  await new Promise((resolve) => setTimeout(resolve, 900))

  try {
    const rental = await api.post('/rentals', {
      locker_id: selectedLocker.value.id
    })

    accessCode.value = rental.access_code
    currentStep.value = 'code'
    animateStep()
  } catch (requestError) {
    console.error(requestError)
    error.value = requestError?.response?.data?.detail || 'Não foi possível criar o aluguel. O locker pode já ter sido reservado.'
  } finally {
    isLoading.value = false
  }
}

function proceedToUnlock() {
  currentStep.value = 'unlock'
  animateStep()
}

async function attemptUnlock() {
  if (inputCode.value.length !== 6) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await api.post('/unlock-events', {
      access_code: inputCode.value
    })

    if (response.message === 'Locker aberto') {
      currentStep.value = 'success'
      animateStep()
      return
    }

    error.value = response.message || 'Não foi possível abrir o locker.'
  } catch (requestError) {
    console.error(requestError)
    error.value = requestError?.response?.data?.detail || 'Código inválido ou expirado.'
  } finally {
    isLoading.value = false
  }
}

async function resetFlow() {
  currentStep.value = 'choose'
  selectedLocker.value = null
  accessCode.value = ''
  inputCode.value = ''
  error.value = ''
  await fetchLocations()
  animateStep()
}

function animateStep() {
  window.setTimeout(() => {
    gsap.from('.step-content', {
      opacity: 0,
      y: 16,
      duration: 0.45,
      ease: 'power2.out'
    })
  }, 30)
}

/**
 * @param {string} size
 * @returns {string}
 */
function sizeLabel(size) {
  return {
    P: 'Pequeno',
    M: 'Médio',
    G: 'Grande'
  }[size] || size
}
</script>
