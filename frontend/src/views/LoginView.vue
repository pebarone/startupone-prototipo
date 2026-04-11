<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">

    <!-- Minimal top bar -->
    <div class="h-16 flex items-center px-6 lg:px-8 border-b border-slate-100 bg-white">
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <span class="font-heading font-black text-lg tracking-tight text-slate-900">
          Fast<span class="text-brand-600">Lock</span>
        </span>
      </a>
    </div>

    <!-- Centered content -->
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">

        <!-- Headline -->
        <div class="mb-8 text-center">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center mb-6 shadow-xl shadow-brand-600/25">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="font-heading font-black text-3xl text-slate-900 tracking-tight">Bem-vindo de volta</h1>
          <p class="text-slate-500 mt-2 text-sm">Entre na sua conta para acessar o painel</p>
        </div>

        <!-- Error message -->
        <div
          v-if="errorMessage"
          class="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
        >
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ errorMessage }}
        </div>

        <!-- Card -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-6">
            <!-- Google button -->
            <button
              id="btn-google-login"
              @click="handleGoogleLogin"
              :disabled="isLoading"
              class="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-sm border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
            >
              <template v-if="isLoading">
                <div class="w-5 h-5 rounded-full border-2 border-slate-300 border-t-brand-600 animate-spin flex-shrink-0" />
                <span class="text-slate-500">Redirecionando…</span>
              </template>
              <template v-else>
                <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </template>
            </button>
          </div>

          <!-- Divider -->
          <div class="px-6 flex items-center gap-3">
            <div class="flex-1 h-px bg-slate-100" />
            <span class="text-xs text-slate-400">acesso seguro via OAuth 2.0</span>
            <div class="flex-1 h-px bg-slate-100" />
          </div>

          <!-- Security badges -->
          <div class="p-6 space-y-2">
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <svg class="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Autenticação com criptografia de ponta a ponta
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <svg class="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Não armazenamos sua senha
            </div>
          </div>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">
          <a href="/" class="hover:text-slate-600 transition-colors">← Voltar para a página inicial</a>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isAuthenticated, signInWithGoogle } = useAuth()

const isLoading = ref(false)
const errorMessage = ref('')

if (isAuthenticated.value) {
  router.replace('/account')
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await signInWithGoogle()
  } catch (err) {
    isLoading.value = false
    if (err?.message?.includes('provider is not enabled')) {
      errorMessage.value = 'O provedor Google não está habilitado. Contate o suporte.'
    } else {
      errorMessage.value = 'Não foi possível iniciar o login. Tente novamente.'
    }
  }
}
</script>
