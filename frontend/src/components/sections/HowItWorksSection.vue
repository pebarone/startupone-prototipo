<template>
  <section class="py-24 bg-white relative overflow-hidden" id="como-funciona">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <div class="text-center max-w-2xl mx-auto mb-20 section-header">
        <h2 class="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Como Funciona</h2>
        <h3 class="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight">
          Cinco passos. Tudo seguro.
        </h3>
        <p class="mt-4 text-slate-500 text-lg">
          Escaneia, paga, cadastra sua digital, guarda — e volta quando quiser. Pague só pelo tempo que usou.
        </p>
        
        <!-- Mobile swipe hint -->
        <div class="mt-6 md:hidden flex items-center justify-center gap-2 text-brand-500 font-medium text-sm">
          <span>Deslize para ver os passos</span>
          <svg class="w-5 h-5 animate-swipe-arrow text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <!-- Mobile scroll progress indicator (hidden on desktop) -->
        <div class="md:hidden mt-4 flex gap-1 justify-center items-center">
          <div v-for="i in 5" :key="i" class="h-1 rounded-full transition-all duration-300" :class="i === activeStepCard ? 'w-4 bg-brand-600' : 'w-2 bg-slate-300'"></div>
        </div>
      </div>

      <div class="relative steps-container">
        <!-- Connecting line desktop only -->
        <div class="hidden md:block absolute top-[50px] left-[8%] right-[8%] h-0.5 bg-slate-100 z-0 step-line">
          <div class="w-full h-full bg-brand-500 origin-left scale-x-0 line-progress"></div>
        </div>

        <!-- Mobile: horizontal snap scroll | Desktop: 5-col grid -->
        <div class="steps-scroll flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 md:grid md:grid-cols-5 md:gap-8 md:overflow-visible md:snap-none md:pb-0 relative z-10 hide-scrollbar">

          <!-- Step 1 -->
          <div class="flex flex-col items-center text-center step-card w-full flex-none snap-center md:w-auto md:snap-none">
            <div class="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="absolute top-2 right-2 text-xs font-black text-slate-200">01</span>
              <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-2">Escaneie o QR Code</h4>
            <p class="text-slate-500 text-sm">Encontre um locker no mapa e escaneie o QR Code do locker físico.</p>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-center text-center step-card w-full flex-none snap-center md:w-auto md:snap-none">
            <div class="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="absolute top-2 right-2 text-xs font-black text-slate-200">02</span>
              <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-2">Cadastre sua biometria</h4>
            <p class="text-slate-500 text-sm">Biometria vinculada ao locker. Só você consegue abrir para retirar.</p>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-center text-center step-card w-full flex-none snap-center md:w-auto md:snap-none">
            <div class="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="absolute top-2 right-2 text-xs font-black text-slate-200">03</span>
              <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-2">Pague via PIX</h4>
            <p class="text-slate-500 text-sm">Taxa de ativação simples. Pague via PIX na hora, sem burocracia.</p>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col items-center text-center step-card w-full flex-none snap-center md:w-auto md:snap-none">
            <div class="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="absolute top-2 right-2 text-xs font-black text-slate-200">04</span>
              <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-2">Guarde · Pague por hora</h4>
            <p class="text-slate-500 text-sm">Defina o parceiro a taxa/hora. Você paga só o que usar. Justo e simples.</p>
          </div>

          <!-- Step 5 -->
          <div class="flex flex-col items-center text-center step-card w-full flex-none snap-center md:w-auto md:snap-none">
            <div class="w-24 h-24 rounded-2xl bg-brand-900 border border-brand-800 shadow-xl shadow-brand-900/40 flex items-center justify-center mb-6 relative overflow-hidden group">
              <div class="absolute inset-0 bg-brand-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="absolute top-2 right-2 text-xs font-black text-brand-700">05</span>
              <svg class="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-2">Retire com sua digital</h4>
            <p class="text-slate-500 text-sm">Confirme a identidade, pague o extra via PIX e retire seus itens. Locker livre.</p>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const activeStepCard = ref(1)
let stepsScrollElement = null
let stepsScrollRaf = 0
let stepsScrollHandler = null
let stepsResizeHandler = null

function updateActiveStepCard() {
  if (!stepsScrollElement) {
    return
  }

  if (window.innerWidth >= 768) {
    activeStepCard.value = 1
    return
  }

  const cards = stepsScrollElement.querySelectorAll('.step-card')
  if (!cards.length) {
    return
  }

  const containerRect = stepsScrollElement.getBoundingClientRect()
  const containerCenter = containerRect.left + (containerRect.width / 2)

  let closestIndex = 1
  let closestDistance = Number.POSITIVE_INFINITY

  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect()
    const cardCenter = cardRect.left + (cardRect.width / 2)
    const distance = Math.abs(cardCenter - containerCenter)

    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index + 1
    }
  })

  activeStepCard.value = closestIndex
}

function scheduleStepsProgressUpdate() {
  if (stepsScrollRaf) {
    return
  }

  stepsScrollRaf = window.requestAnimationFrame(() => {
    stepsScrollRaf = 0
    updateActiveStepCard()
  })
}

onMounted(() => {
  gsap.from('.section-header', {
    scrollTrigger: {
      trigger: '.section-header',
      start: 'top 85%',
      toggleActions: 'play reverse play reverse'
    },
    y: 30,
    opacity: 0,
    duration: 0.8
  })

  gsap.fromTo('.step-card',
    { y: 40, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.steps-container',
        start: 'top 75%',
        toggleActions: 'play reverse play reverse'
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    }
  )

  gsap.to('.line-progress', {
    scrollTrigger: {
      trigger: '.step-line',
      start: 'top 75%',
      toggleActions: 'play reverse play reverse'
    },
    scaleX: 1,
    duration: 2,
    ease: 'power2.inOut'
  })

  stepsScrollElement = document.querySelector('.steps-scroll')
  if (!stepsScrollElement) {
    return
  }

  stepsScrollHandler = () => {
    scheduleStepsProgressUpdate()
  }
  stepsResizeHandler = () => {
    scheduleStepsProgressUpdate()
  }

  stepsScrollElement.addEventListener('scroll', stepsScrollHandler, { passive: true })
  window.addEventListener('resize', stepsResizeHandler)
  scheduleStepsProgressUpdate()
})

onUnmounted(() => {
  if (stepsScrollElement && stepsScrollHandler) {
    stepsScrollElement.removeEventListener('scroll', stepsScrollHandler)
  }

  if (stepsResizeHandler) {
    window.removeEventListener('resize', stepsResizeHandler)
  }

  if (stepsScrollRaf) {
    window.cancelAnimationFrame(stepsScrollRaf)
    stepsScrollRaf = 0
  }
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes swipe-arrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6px); }
}
.animate-swipe-arrow {
  animation: swipe-arrow 1.5s ease-in-out infinite;
}
</style>