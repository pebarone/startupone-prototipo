<template>
  <section class="hero-section relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50 flex items-center min-h-[90vh]">
    <!-- Abstract Background Decor -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="blur-blob w-[600px] h-[600px] bg-brand-200/40 rounded-full blur-3xl absolute -top-40 -right-20"></div>
      <div class="blur-blob w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl absolute top-60 -left-20"></div>
    </div>

    <!-- Content Grid -->
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      
      <!-- Text Area -->
      <div class="flex flex-col items-start hero-text">
        <h1 class="text-5xl lg:text-7xl font-heading font-black tracking-tight text-slate-900 leading-tight mb-6" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);">
          <span class="block translate-y-[100%] opacity-0 title-line">Guarde com</span>
          <span class="block text-brand-600 translate-y-[100%] opacity-0 title-line">Confiança.</span>
          <span class="block translate-y-[100%] opacity-0 title-line">Explore livre.</span>
        </h1>
        
        <p class="text-lg text-slate-600 mb-10 max-w-xl subtitle opacity-0 translate-y-4">
          Nós transformamos o espaço ocioso do comércio local num ponto seguro para seus itens. Tecnologia de acesso inteligente atrelada à melhor proteção de seguros, para sua paz de espírito.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto buttons opacity-0 translate-y-4">
          <a href="/use" class="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-brand-900 hover:shadow-2xl hover:shadow-brand-900/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
            <span class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
            <span class="relative z-10 flex items-center justify-center gap-2">
              Quero Guardar Algo
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </a>
          
          <a :href="partnerEntryHref" class="px-8 py-4 rounded-xl bg-white text-slate-900 border border-slate-200 font-semibold hover:border-brand-300 hover:bg-brand-50 transition-all duration-300 relative flex items-center justify-center gap-2 group">
            <svg class="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Tornar-se Parceiro
          </a>
        </div>
        
        <div class="mt-12 flex items-center gap-[-10px] avatars opacity-0 translate-y-4">
          <div class="flex -space-x-3">
            <div class="w-10 h-10 rounded-full border-2 border-white bg-slate-200" style="background-image: url('https://i.pravatar.cc/100?img=1'); background-size: cover;"></div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-slate-200" style="background-image: url('https://i.pravatar.cc/100?img=2'); background-size: cover;"></div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-slate-200" style="background-image: url('https://i.pravatar.cc/100?img=3'); background-size: cover;"></div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-xs font-bold text-white">+5k</div>
          </div>
          <span class="ml-4 text-sm font-medium text-slate-500">Usuários confiam na FastLock</span>
        </div>
      </div>

      <!-- Animated Device Area (SVG Mockup) -->
      <div class="relative w-full aspect-[4/5] lg:aspect-square flex items-center justify-center mockup-area opacity-0 translate-x-12">
        <!-- Floating Elements -->
        <div class="absolute inset-0 z-0">
          <svg class="w-full h-full text-slate-200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path class="spin-slow origin-center" fill="currentColor" d="M44.7,-76.4C58.3,-69.2,71,-58.5,79.5,-45.1C88,-31.7,92.5,-15.8,92,-0.3C91.5,15.2,86,30.4,76.5,42.5C67,54.6,53.5,63.6,39.3,71.5C25.1,79.4,10.2,86.2,-4.5,91.8C-19.2,97.4,-33.6,101.9,-44.6,94.9C-55.6,87.9,-63.1,69.5,-71.4,53.1C-79.7,36.7,-88.8,22.3,-89.6,7.5C-90.4,-7.3,-82.9,-22.6,-73.4,-35.1C-63.9,-47.6,-52.4,-57.3,-39.8,-65.2C-27.2,-73.1,-13.6,-79.2,1.2,-81.3C16,-83.4,31.1,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <!-- The Locker Mockup -->
        <div class="relative z-10 w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl shadow-brand-900/10 border border-slate-100 p-6 locker-mockup">
          <div class="w-full h-12 bg-slate-50 rounded-xl mb-6 flex items-center px-4 justify-between border border-slate-100">
             <div class="w-16 h-2 bg-brand-500/20 rounded-full"><div class="w-10 h-full bg-brand-500 rounded-full progress-bar"></div></div>
             <div class="text-xs font-bold text-slate-400">04:20 PM</div>
          </div>
          
          <div class="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-100 relative flex items-center justify-center overflow-hidden mb-6 locker-door group hover:border-brand-200 transition-colors cursor-pointer">
             <div class="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center door-handle group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6 text-slate-800 lock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             </div>
             
             <!-- Tech overlay -->
             <div class="absolute inset-0 bg-gradient-to-tr from-brand-600/5 to-transparent pointer-events-none"></div>
             <!-- Success checkmark hidden initially -->
             <div class="absolute inset-0 flex items-center justify-center success-overlay opacity-0 scale-50 bg-brand-500/90 text-white backdrop-blur-sm">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
          </div>
          
          <div class="space-y-3">
             <div class="w-full h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-brand-900 transition-colors activate-btn">
               Acesso via FastCode
             </div>
             <div class="flex gap-2 text-xs text-brand-600 items-center justify-center font-medium bg-brand-50 p-2 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Assegurado por TechInsurance
             </div>
          </div>
        </div>

        <!-- Floating Cards -->
        <div class="absolute z-20 -left-12 top-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 float-card-1">
          <div class="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">Status do Locker</p>
            <p class="text-sm font-bold text-slate-900">Seguro e Trancado</p>
          </div>
        </div>
        
        <div class="absolute z-30 -right-8 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 float-card-2">
          <div class="w-10 h-10 rounded-lg bg-brand-900 text-white flex items-center justify-center">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">Economia</p>
            <p class="text-sm font-bold text-brand-600">R$ 150/mês gerados</p>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import gsap from 'gsap'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
const partnerEntryHref = computed(() => (isAuthenticated.value ? '/account' : '/login'))

onMounted(() => {
  const tl = gsap.timeline()
  
  // Text stagger
  tl.to('.title-line', {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.15,
    ease: "power4.out"
  })
  .to(['.subtitle', '.buttons', '.avatars'], {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  }, "-=0.6")
  
  // Mockup entrance
  tl.to('.mockup-area', {
    x: 0,
    opacity: 1,
    duration: 1,
    ease: "back.out(1.2)"
  }, "-=1")

  // Float cards
  gsap.fromTo('.float-card-1', { y: 15, opacity: 0 }, {
    y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 1
  })
  gsap.fromTo('.float-card-2', { y: -15, opacity: 0 }, {
    y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 1.2
  })
  
  // Idle floating animation
  gsap.to('.float-card-1', {
    y: -10,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
  gsap.to('.float-card-2', {
    y: 10,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 0.5
  })

  // Simulated unlock interaction
  const activateBtn = document.querySelector('.activate-btn')
  if(activateBtn) {
    activateBtn.addEventListener('mouseenter', () => {
      gsap.to('.progress-bar', { width: '100%', duration: 1.5, ease: 'power1.inOut' })
      gsap.to('.lock-icon', { rotation: -20, yoyo: true, repeat: 3, duration: 0.1 })
    })
    activateBtn.addEventListener('mouseleave', () => {
      gsap.to('.progress-bar', { width: '40%', duration: 0.5 })
    })
    
    activateBtn.addEventListener('click', () => {
      const lockTl = gsap.timeline()
      lockTl.to('.success-overlay', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' })
      lockTl.to('.success-overlay', { opacity: 0, scale: 0.5, duration: 0.3, delay: 1.5 })
    })
  }
})
</script>

<style scoped>
.spin-slow {
  animation: spin 30s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>