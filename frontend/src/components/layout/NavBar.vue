<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
    :class="scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-slate-200 py-3' : 'bg-transparent border-transparent py-5'"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center gap-6">

      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 group flex-shrink-0">
        <div class="w-9 h-9 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
          <div class="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span class="font-heading font-black text-xl tracking-tight text-slate-900 group-hover:text-brand-900 transition-colors">
          Fast<span class="text-brand-600">Lock</span>
        </span>
      </a>

      <!-- Desktop nav — only on home -->
      <nav v-if="isHomePage" class="hidden md:flex gap-7 items-center text-sm font-medium flex-1 justify-center">
        <a href="#parceiros" @click.prevent="scrollTo('#parceiros')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">Parceiros</a>
        <a href="#como-funciona" @click.prevent="scrollTo('#como-funciona')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">Como Funciona</a>
        <a href="#solucao" @click.prevent="scrollTo('#solucao')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">A Solução</a>
      </nav>
      <div v-else class="flex-1" />

      <!-- Desktop CTAs -->
      <div class="hidden md:flex items-center gap-3 flex-shrink-0">
        <a href="/use" class="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">Usar um Locker</a>
        <a href="/retrieve" class="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">Retirar itens</a>

        <!-- Not logged in -->
        <template v-if="!isLoggedIn">
          <a
            href="/login"
            class="text-sm font-semibold px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-brand-900 hover:shadow-xl hover:shadow-brand-900/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            Entrar / Seja Parceiro
          </a>
        </template>

        <!-- Logged in -->
        <template v-else>
          <div class="relative" ref="dropdownRef">
            <button
              @click="dropdownOpen = !dropdownOpen"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-300 transition-all shadow-sm"
            >
              <div class="w-6 h-6 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center flex-shrink-0">
                <img v-if="user?.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="text-white text-[10px] font-bold">{{ initials }}</span>
              </div>
              <span class="text-sm font-semibold text-slate-800 max-w-[120px] truncate">{{ user?.full_name?.split(' ')[0] || 'Conta' }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform" :class="dropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown -->
            <Transition name="fadeDrop">
              <div v-if="dropdownOpen" class="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <a href="/account" class="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Minha Conta
                </a>
                <div class="mx-3 border-t border-slate-100" />
                <button @click="handleSignOut" class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sair da conta
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        @click="mobileOpen = !mobileOpen"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slideDown">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
        <template v-if="isHomePage">
          <a href="#parceiros" @click.prevent="scrollTo('#parceiros'); mobileOpen = false" class="block text-sm font-medium text-slate-700 py-2">Parceiros</a>
          <a href="#como-funciona" @click.prevent="scrollTo('#como-funciona'); mobileOpen = false" class="block text-sm font-medium text-slate-700 py-2">Como Funciona</a>
          <a href="#solucao" @click.prevent="scrollTo('#solucao'); mobileOpen = false" class="block text-sm font-medium text-slate-700 py-2">A Solução</a>
          <div class="border-t border-slate-100" />
        </template>
        <a href="/use" class="block text-sm font-medium text-slate-700 py-2">Usar um Locker</a>
        <a href="/retrieve" class="block text-sm font-medium text-slate-700 py-2">Retirar itens</a>
        <a v-if="!isLoggedIn" href="/login" class="block w-full text-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">Entrar / Seja Parceiro</a>
        <template v-else>
          <a href="/account" class="block text-sm font-medium text-slate-700 py-2">Minha Conta</a>
          <button @click="handleSignOut" class="block w-full text-left text-sm font-medium text-red-500 py-2">Sair</button>
        </template>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, signOut } = useAuth()

const scrolled = ref(false)
const mobileOpen = ref(false)
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const isHomePage = computed(() => route.path === '/')
const isLoggedIn = computed(() => isAuthenticated.value)

const initials = computed(() => {
  const name = user.value?.full_name || user.value?.email || '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

function scrollTo(id) {
  const el = document.querySelector(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  mobileOpen.value = false
}

async function handleSignOut() {
  dropdownOpen.value = false
  await signOut()
  router.push('/')
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 50 })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fadeDrop-enter-active { transition: all 0.15s cubic-bezier(0.23, 1, 0.32, 1); }
.fadeDrop-leave-active { transition: all 0.1s ease-in; }
.fadeDrop-enter-from, .fadeDrop-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }

.slideDown-enter-active { transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1); }
.slideDown-leave-active { transition: all 0.15s ease-in; }
.slideDown-enter-from, .slideDown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
