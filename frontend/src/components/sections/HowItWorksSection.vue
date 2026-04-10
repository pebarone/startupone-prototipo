<template>
  <section class="py-24 bg-white relative overflow-hidden" id="como-funciona">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div class="text-center max-w-2xl mx-auto mb-20 section-header">
        <h2 class="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Como Funciona</h2>
        <h3 class="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight">
          Proteção impecável em três passos.
        </h3>
        <p class="mt-4 text-slate-500 text-lg">
          Nenhuma fila, nenhuma burocracia. Escaneie, pague e guarde num sistema protegido por um seguro que traz paz de espírito real.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-10 relative steps-container">
        <!-- Connecting Line -->
        <div class="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-0.5 bg-slate-100 z-0 step-line">
           <div class="w-full h-full bg-brand-500 origin-left scale-x-0 line-progress"></div>
        </div>

        <!-- Step 1 -->
        <div class="relative z-10 flex flex-col items-center text-center step-card">
          <div class="w-24 h-24 rounded-2xl bg-white border divide-x border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
            <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span class="absolute top-2 right-2 text-xs font-black text-slate-200">01</span>
            <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
          </div>
          <h4 class="text-xl font-bold text-slate-900 mb-2">Escaneie o QR Code</h4>
          <p class="text-slate-500">Encontre um parceiro local pelo mapa e escaneie o código no locker vazio.</p>
        </div>

        <!-- Step 2 -->
        <div class="relative z-10 flex flex-col items-center text-center step-card">
          <div class="w-24 h-24 rounded-2xl bg-white border divide-x border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative overflow-hidden group">
            <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span class="absolute top-2 right-2 text-xs font-black text-slate-200">02</span>
            <svg class="w-10 h-10 text-brand-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
          <h4 class="text-xl font-bold text-slate-900 mb-2">Pagamento Seguro</h4>
          <p class="text-slate-500">Pague direto pelo celular via Pix ou Cartão. Na hora, ativamos o seguro garantia completa.</p>
        </div>

        <!-- Step 3 -->
        <div class="relative z-10 flex flex-col items-center text-center step-card">
          <div class="w-24 h-24 rounded-2xl bg-brand-900 border divide-x border-brand-800 shadow-xl shadow-brand-900/40 flex items-center justify-center mb-6 relative overflow-hidden group">
            <div class="absolute inset-0 bg-brand-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span class="absolute top-2 right-2 text-xs font-black text-brand-700">03</span>
            <svg class="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
          </div>
          <h4 class="text-xl font-bold text-slate-900 mb-2">Guarde e Curta</h4>
          <p class="text-slate-500">A porta destranca via sistema. Feche e pode curtir sua viagem, show ou rolê sem pesos.</p>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  gsap.from('.section-header', {
    scrollTrigger: {
      trigger: '.section-header',
      start: 'top 85%'
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
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.3,
      ease: 'power2.out'
    }
  )

  gsap.to('.line-progress', {
    scrollTrigger: {
      trigger: '.step-line',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    scaleX: 1,
    duration: 1.5,
    ease: 'power2.inOut'
  })
})
</script>