<template>
  <section class="py-24 bg-white relative" id="solucao">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center benefits-header">
       <h2 class="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Porque Escolher a Solução</h2>
       <p class="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-8 md:mb-16">
         Muito mais que um guarda-volumes.
       </p>

       <div class="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-brand-500 md:hidden">
         <span>Deslize para ver os benefícios</span>
         <svg class="h-5 w-5 animate-swipe-arrow text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
         </svg>
       </div>

       <div class="mb-8 flex items-center justify-center gap-1 md:hidden">
         <div v-for="i in 4" :key="i" class="h-1 rounded-full transition-all duration-300" :class="i === activeBenefitCard ? 'w-4 bg-brand-600' : 'w-2 bg-slate-300'"></div>
       </div>
    </div>

    <div class="benefits-cards hide-scrollbar relative mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-8 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:snap-none md:pb-0 lg:grid-cols-4 lg:px-8">
       <!-- Card 1 -->
       <div class="benefit-card w-[84%] min-w-[260px] flex-none snap-center rounded-3xl border border-slate-100 bg-slate-50 p-8 overflow-hidden relative group transform-gpu transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10 md:w-auto md:min-w-0 md:snap-none">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Segurança de Nível Bancário</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Cobertura de R$ 5.000 contra qualquer sinistro atrelada a cada locação automaticamente.</p>
       </div>
       
       <!-- Card 2 -->
       <div class="benefit-card w-[84%] min-w-[260px] flex-none snap-center rounded-3xl border border-slate-100 bg-slate-50 p-8 overflow-hidden relative group transform-gpu transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10 md:w-auto md:min-w-0 md:snap-none">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0115.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Acesso Biométrico</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Cadastre sua digital ou facial. Só você abre o locker para retirar seus itens. Sem códigos, sem filas.</p>
       </div>

       <!-- Card 3 -->
       <div class="benefit-card w-[84%] min-w-[260px] flex-none snap-center rounded-3xl border border-slate-100 bg-slate-50 p-8 overflow-hidden relative group transform-gpu transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10 md:w-auto md:min-w-0 md:snap-none">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Sempre Perto</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Mapeamento em tempo real do comércio local pra ter um locker onde você estiver.</p>
       </div>

       <!-- Card 4 -->
       <div class="benefit-card w-[84%] min-w-[260px] flex-none snap-center rounded-3xl border border-brand-100 bg-brand-50 p-8 overflow-hidden relative group transform-gpu transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/15 md:w-auto md:min-w-0 md:snap-none">
         <div class="absolute inset-0 bg-brand-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-brand-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Pague pelo Tempo</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Cobrança justa por hora iniciada. Não pague mais do que o necessário. Transparente e simples.</p>
       </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const activeBenefitCard = ref(1)
let benefitsScrollElement = null
let benefitsScrollRaf = 0
let benefitsScrollHandler = null
let benefitsResizeHandler = null

function updateActiveBenefitCard() {
  if (!benefitsScrollElement) {
    return
  }

  if (window.innerWidth >= 768) {
    activeBenefitCard.value = 1
    return
  }

  const cards = benefitsScrollElement.querySelectorAll('.benefit-card')
  if (!cards.length) {
    return
  }

  const containerRect = benefitsScrollElement.getBoundingClientRect()
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

  activeBenefitCard.value = closestIndex
}

function scheduleBenefitsProgressUpdate() {
  if (benefitsScrollRaf) {
    return
  }

  benefitsScrollRaf = window.requestAnimationFrame(() => {
    benefitsScrollRaf = 0
    updateActiveBenefitCard()
  })
}

onMounted(() => {
  gsap.from('.benefits-header', {
    scrollTrigger: {
       trigger: '.benefits-header',
       start: 'top 85%',
       toggleActions: 'play reverse play reverse'
    },
    y: 30,
    opacity: 0,
    duration: 0.6
  })

  gsap.fromTo('.benefit-card', 
    { y: 50, opacity: 0 },
    {
      scrollTrigger: {
         trigger: '.benefits-cards',
         start: 'top 75%',
         toggleActions: 'play reverse play reverse'
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    }
  )

  benefitsScrollElement = document.querySelector('.benefits-cards')
  if (!benefitsScrollElement) {
    return
  }

  benefitsScrollHandler = () => {
    scheduleBenefitsProgressUpdate()
  }
  benefitsResizeHandler = () => {
    scheduleBenefitsProgressUpdate()
  }

  benefitsScrollElement.addEventListener('scroll', benefitsScrollHandler, { passive: true })
  window.addEventListener('resize', benefitsResizeHandler)
  scheduleBenefitsProgressUpdate()
})

onUnmounted(() => {
  if (benefitsScrollElement && benefitsScrollHandler) {
    benefitsScrollElement.removeEventListener('scroll', benefitsScrollHandler)
  }

  if (benefitsResizeHandler) {
    window.removeEventListener('resize', benefitsResizeHandler)
  }

  if (benefitsScrollRaf) {
    window.cancelAnimationFrame(benefitsScrollRaf)
    benefitsScrollRaf = 0
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

@media (prefers-reduced-motion: reduce) {
  .animate-swipe-arrow {
    animation: none;
  }
}
</style>
