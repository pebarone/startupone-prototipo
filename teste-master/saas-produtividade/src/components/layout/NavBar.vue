<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ArrowRight } from 'lucide-vue-next'
import gsap from 'gsap'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Integrações', href: '#integrations' },
  { name: 'Preços', href: '#pricing' },
  { name: 'FAQ', href: '#faq' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  
  if (isMobileMenuOpen.value) {
    gsap.fromTo('.mobile-menu-item', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    )
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Navbar entrance animation
  gsap.fromTo('nav',
    { y: -100, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
  )
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[isScrolled ? 'py-3 glass' : 'py-6 bg-transparent']"
  >
    <div class="container mx-auto px-6 md:px-12 flex items-center justify-between">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
          P
        </div>
        <span class="font-heading font-bold text-xl tracking-tight text-dark">ProTask</span>
      </a>

      <!-- Desktop Links -->
      <div class="hidden md:flex items-center gap-8">
        <a 
          v-for="link in navLinks" 
          :key="link.name" 
          :href="link.href"
          class="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
        >
          {{ link.name }}
        </a>
      </div>

      <!-- Desktop CTA -->
      <div class="hidden md:flex items-center gap-4">
        <a href="#" class="text-sm font-medium text-slate-600 hover:text-dark transition-colors">Login</a>
        <a href="#pricing" class="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-primary border border-transparent rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary overflow-hidden">
          <span class="relative z-10 flex items-center gap-2">
            Testar Grátis
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div class="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10 z-0"></div>
        </a>
      </div>

      <!-- Mobile Menu Toggle -->
      <button 
        @click="toggleMobileMenu"
        class="md:hidden p-2 text-slate-600 hover:text-dark transition-colors focus:outline-none"
        aria-label="Toggle menu"
      >
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div 
      v-show="isMobileMenuOpen"
      class="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden"
    >
      <div class="px-6 py-4 flex flex-col gap-4">
        <a 
          v-for="link in navLinks" 
          :key="link.name" 
          :href="link.href"
          @click="isMobileMenuOpen = false"
          class="mobile-menu-item text-base font-medium text-slate-600 hover:text-primary py-2 border-b border-slate-100"
        >
          {{ link.name }}
        </a>
        <div class="flex flex-col gap-3 mt-4 mobile-menu-item">
          <a href="#" class="text-center py-2 text-sm font-medium text-slate-600">Login</a>
          <a href="#pricing" class="text-center py-3 text-sm font-semibold text-white bg-primary rounded-lg">
            Testar Grátis
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>
