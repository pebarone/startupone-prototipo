<template>
  <div class="app-container overflow-hidden min-h-screen flex flex-col antialiased">
    <NavBar />
    <main class="flex-grow">
      <router-view />
    </main>
    <FooterSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import FooterSection from '@/components/layout/FooterSection.vue'

onMounted(() => {
  // Global setups
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)
})
</script>

<style>
/* Global styles can go here */
</style>
