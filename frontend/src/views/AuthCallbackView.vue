<template>
  <div class="min-h-screen bg-[#f0fdf4] flex items-center justify-center px-4 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

    <div class="relative z-10 flex flex-col items-center gap-6 text-center">
      <RouterLink to="/" class="flex items-center gap-2 mb-2">
        <div class="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <span class="font-heading font-black text-xl tracking-tight text-slate-900">
          Fast<span class="text-brand-600">Lock</span>
        </span>
      </RouterLink>

      <div v-if="state === 'loading'" class="flex flex-col items-center gap-4">
        <div class="relative w-10 h-10">
          <div class="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 animate-spin" />
        </div>
        <div>
          <p class="text-slate-900 font-semibold">Finalizando acesso...</p>
          <p class="text-slate-500 text-sm mt-0.5">Aguarde um momento</p>
        </div>
      </div>

      <div v-else-if="state === 'success'" class="flex flex-col items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-brand-100 border-2 border-brand-300 flex items-center justify-center">
          <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="text-slate-900 font-semibold">Bem-vindo. Redirecionando...</p>
          <p class="text-slate-500 text-sm mt-0.5">Um segundo...</p>
        </div>
      </div>

      <div v-else-if="state === 'error'" class="text-center max-w-xs">
        <div class="w-12 h-12 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p class="text-slate-900 font-semibold">Falha na autenticação</p>
        <p class="text-slate-500 text-sm mt-1 mb-4">{{ errorMsg }}</p>
        <RouterLink
          to="/login"
          class="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-900 transition-colors"
        >
          Tentar novamente
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { fetchMe } = useAuth()

const state = ref('loading')
const errorMsg = ref('')

onMounted(async () => {
  if (!supabase) {
    state.value = 'error'
    errorMsg.value = 'Supabase não configurado. Contate o suporte.'
    return
  }

  const params = new URLSearchParams(window.location.search)
  const providerError = params.get('error_description') || params.get('error')

  if (providerError) {
    state.value = 'error'
    errorMsg.value = 'O provedor de login recusou a autenticação. Tente novamente.'
    return
  }

  try {
    const session = await waitForSupabaseSession()

    if (!session) {
      state.value = 'error'
      errorMsg.value = 'Sessão não encontrada. Faça login novamente.'
      return
    }

    fetchMe().catch(() => {})

    state.value = 'success'
    await delay(700)
    await router.replace('/account')
  } catch (_error) {
    state.value = 'error'
    errorMsg.value = 'Não foi possível concluir o login. Tente novamente.'
  }
})

async function waitForSupabaseSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  if (data.session) {
    return data.session
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      subscription.unsubscribe()
      resolve(null)
    }, 5000)

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        window.clearTimeout(timeoutId)
        subscription.unsubscribe()
        resolve(session)
        return
      }

      if (event === 'SIGNED_OUT') {
        window.clearTimeout(timeoutId)
        subscription.unsubscribe()
        resolve(null)
      }
    })
  })
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>
