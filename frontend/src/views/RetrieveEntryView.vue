<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
        <p class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          Retirada por biometria
        </p>
        <h1 class="mb-3 text-3xl font-black tracking-tight text-white">Identifique seu aluguel</h1>
        <p class="mx-auto mb-8 max-w-md text-sm text-slate-300">
          Leia sua digital neste aparelho. Depois disso, a plataforma encontra o aluguel vinculado e mostra tempo de uso e cobranca antes da confirmacao final.
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
          class="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all duration-200"
          :class="bioState === 'scanning' ? 'cursor-wait bg-white/10 text-white' : 'bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-500'"
          :disabled="bioState === 'scanning' || loading || !webauthnSupported"
          @click="startRetrievalLookup"
        >
          <BaseSpinner v-if="bioState === 'scanning' || loading" size="sm" color="white" />
          <span>{{ bioState === 'scanning' || loading ? 'Lendo digital...' : 'Ler digital' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { authenticatePasskey, getWebAuthnErrorMessage, getWebAuthnSupportHint, getWebAuthnSupportState } from '@/composables/useWebAuthn'
import { getApiErrorMessage } from '@/lib/api-errors'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const bioState = ref('idle')

const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()

const bioLabel = computed(() => {
  if (bioState.value === 'scanning') return 'Localizando o aluguel vinculado a esta credencial...'
  if (bioState.value === 'success') return 'Aluguel identificado com sucesso!'
  return 'Pressione para autenticar sua digital'
})

async function startRetrievalLookup() {
  loading.value = true
  error.value = ''
  bioState.value = 'scanning'

  try {
    const options = await api.post('/retrievals/webauthn/authentication-options')
    const credential = await authenticatePasskey(options)
    const result = await api.post('/retrievals/webauthn/retrieve', { credential })
    bioState.value = 'success'

    await router.replace({
      name: 'retrieve',
      params: { rentalId: result.rental.id }
    })
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
