<template>
  <section class="py-24 bg-white relative" id="solucao">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center benefits-header">
       <h2 class="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Porque Escolher a Solução</h2>
       <p class="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-16">
         Muito mais que um guarda-volumes.
       </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 lg:px-8 benefits-cards relative">
       <!-- Card 1 -->
       <div class="bg-slate-50 border border-slate-100 rounded-3xl p-8 overflow-hidden relative group benefit-card">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Segurança de Nível Bancário</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Cobertura de R$ 5.000 contra qualquer sinistro atrelada a cada locação automaticamente.</p>
       </div>
       
       <!-- Card 2 -->
       <div class="bg-slate-50 border border-slate-100 rounded-3xl p-8 overflow-hidden relative group benefit-card">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Experiência 1-Click</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Basta a câmera do seu celular para operar qualquer locker em segundos.</p>
       </div>

       <!-- Card 3 -->
       <div class="bg-slate-50 border border-slate-100 rounded-3xl p-8 overflow-hidden relative group benefit-card">
         <div class="absolute inset-0 bg-brand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
         <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand-600 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
         </div>
         <h4 class="text-xl font-bold text-slate-900 mb-3 relative z-10">Sempre Perto</h4>
         <p class="text-slate-600 relative z-10 leading-relaxed font-medium">Mapeamento em tempo real do comércio local pra ter um locker onde você estiver.</p>
       </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
      ease: 'back.out(1)'
    }
  )
})
</script>