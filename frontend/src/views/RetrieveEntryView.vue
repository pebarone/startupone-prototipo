<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      
      <!-- List of Active Rentals (Shown AFTER digital scan) -->
      <div v-if="showList && activeRentals.length > 0" class="mb-8 animate-fade-in">
        <div class="text-center mb-6">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Seus aluguéis</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">Escolha o locker para retirar</h1>
          <p class="mt-2 text-sm text-slate-500">Identificamos estes aluguéis vinculados a você. Qual deseja finalizar agora?</p>
        </div>

        <div class="space-y-4">
          <button 
            v-for="rental in activeRentals" 
            :key="rental.id"
            @click="selectRental(rental.id)"
            class="w-full text-left rounded-2xl bg-white border border-slate-200 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-300"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1">Locker em uso</p>
                <p class="text-2xl font-black font-mono text-slate-900">{{ rental.lockerCode }}</p>
                <p class="text-sm text-slate-500 mt-1">{{ rental.locationName }} · {{ rental.size }}</p>
              </div>
              <div class="bg-brand-50 text-brand-700 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                Ver detalhes
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Iniciado em {{ formatTime(rental.startedAt) }}</span>
              <span class="flex items-center gap-1 text-amber-600 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Ativo
              </span>
            </div>
          </button>
        </div>

        <div class="mt-8 text-center border-t border-slate-200 pt-8">
          <button @click="showList = false; bioState = 'idle'" class="text-sm text-brand-600 font-semibold hover:text-brand-700">Escanear outra digital</button>
        </div>
      </div>

      <!-- Default Biometric Lookup -->
      <div v-else class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
        <p class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          Busca geral por biometria
        </p>
        <h2 class="mb-3 text-2xl font-black tracking-tight text-white">Identifique seu aluguel</h2>
        <p class="mx-auto mb-8 max-w-md text-sm text-slate-300">
          Leia sua digital neste aparelho para procurarmos os aluguéis vinculados à sua chave de segurança.
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
        <div v-if="error" class="mx-auto mb-4 max-w-md rounded-lg border border-red-400/30 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {{ error }}
        </div>

        <button
          type="button"
          class="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200"
          :class="bioState === 'scanning' ? 'cursor-wait bg-white/10 text-white' : 'bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-500'"
          :disabled="bioState === 'scanning' || loading || !webauthnSupported"
          @click="startRetrievalLookup"
        >
          <BaseSpinner v-if="bioState === 'scanning' || loading" size="sm" color="white" />
          <span>{{ bioState === 'scanning' || loading ? 'Lendo digital...' : 'Procurar pela digital' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { authenticatePasskey, getWebAuthnErrorMessage, getWebAuthnSupportHint, getWebAuthnSupportState } from '@/composables/useWebAuthn'
import { getApiErrorMessage } from '@/lib/api-errors'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const bioState = ref('idle')
const activeRentals = ref([])
const showList = ref(false)

const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()

const bioLabel = computed(() => {
  if (bioState.value === 'scanning') return 'Localizando o aluguel vinculado a esta credencial...'
  if (bioState.value === 'success') return 'Aluguéis identificados!'
  return 'Pressione para autenticar sua digital'
})

onMounted(() => {
  loadRentalsFromStorage()
})

function loadRentalsFromStorage() {
  try {
    const stored = window.localStorage.getItem('fastlock.active_rentals')
    if (stored) {
      activeRentals.value = JSON.parse(stored)
    }
  } catch (err) {}
}

function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function selectRental(rentalId) {
  router.push({ name: 'retrieve', params: { rentalId } })
}

async function startRetrievalLookup() {
  loading.value = true
  error.value = ''
  bioState.value = 'scanning'

  try {
    const options = await api.post('/retrievals/webauthn/authentication-options')
    const credential = await authenticatePasskey(options)
    const result = await api.post('/retrievals/webauthn/retrieve', { credential })
    bioState.value = 'success'

    // Adiciona o aluguel destravado à lista local, se não existir
    try {
      let activeRentalsLocal = JSON.parse(window.localStorage.getItem('fastlock.active_rentals') || '[]')
      if (!activeRentalsLocal.find(r => r.id === result.rental.id)) {
         activeRentalsLocal.push({
           id: result.rental.id,
           lockerCode: result.rental.locker.code,
           size: result.rental.locker.size,
           locationName: 'FastLock',
           startedAt: result.rental.unlocked_at
         })
         window.localStorage.setItem('fastlock.active_rentals', JSON.stringify(activeRentalsLocal))
      }
    } catch(e) {}

    loadRentalsFromStorage()
    
    // Se não tiver nenhum na lista (o que seria estranho pois acabamos de adicionar), vai direto.
    if (activeRentals.value.length === 0) {
      await router.replace({ name: 'retrieve', params: { rentalId: result.rental.id } })
      return
    }

    setTimeout(() => {
      showList.value = true
    }, 800)

  } catch (requestError) {
    bioState.value = 'idle'
    error.value = isProbablyWebAuthnError(requestError)
      ? getWebAuthnErrorMessage(requestError, 'Falha ao localizar o aluguel desta biometria.')
      : getApiErrorMessage(requestError, 'Falha ao localizar o aluguel desta biometria.')
  } finally {
    loading.value = false
  }
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
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
