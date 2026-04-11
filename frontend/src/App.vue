<template>
  <div class="app-container overflow-hidden min-h-screen flex flex-col antialiased">

    <!-- Global loading screen (while auth initializes) -->
    <div
      v-if="isInitializing"
      class="fixed inset-0 bg-white z-[100] flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div class="w-6 h-6 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
      </div>
    </div>

    <!-- NavBar: visible on public pages and account -->
    <NavBar v-if="!isPartnerRoute && !isHeaderlessRoute" />

    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer: hidden on partner/auth/account pages -->
    <FooterSection v-if="!isFooterlessRoute" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NavBar from '@/components/layout/NavBar.vue'
import FooterSection from '@/components/layout/FooterSection.vue'

const route = useRoute()
const { initializeAuth, isInitializing } = useAuth()

// Routes that use their own layout (partner dashboard has its own sidebar)
const isPartnerRoute = computed(() => route.path.startsWith('/partner'))

// Routes with their own full-page layout (no NavBar)
const isHeaderlessRoute = computed(() =>
  ['/login', '/auth/callback', '/oauth/callback'].includes(route.path)
)

// Routes where footer should be hidden
const isFooterlessRoute = computed(() =>
  isPartnerRoute.value || ['/login', '/auth/callback', '/oauth/callback', '/account'].includes(route.path)
)

onMounted(async () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  await initializeAuth()
})
</script>
