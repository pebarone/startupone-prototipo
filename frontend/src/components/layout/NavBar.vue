<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
    :class="[ scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-slate-200 py-3' : 'bg-transparent border-transparent py-5' ]"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
      
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
          <div class="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <span class="font-heading font-black text-xl tracking-tight text-slate-900 group-hover:text-brand-900 transition-colors">
          Fast<span class="text-brand-600">Lock</span>
        </span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex gap-8 items-center text-sm font-medium">
        <a href="#solucao" @click.prevent="scrollTo('#solucao')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">A Solução</a>
        <a href="#como-funciona" @click.prevent="scrollTo('#como-funciona')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">Como Funciona</a>
        <a href="#parceiros" @click.prevent="scrollTo('#parceiros')" class="text-slate-600 hover:text-brand-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">Para Parceiros</a>
      </nav>

      <!-- CTA -->
      <div class="hidden md:flex items-center gap-4">
        <a href="/use" class="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors">Usar um Locker</a>
        <a href="#parceiros" @click.prevent="scrollTo('#parceiros')" class="text-sm font-semibold px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-brand-900 hover:shadow-xl hover:shadow-brand-900/20 hover:-translate-y-0.5 transition-all duration-300">
          Seja um parceiro
        </a>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const scrollTo = (id) => {
  const el = document.querySelector(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>