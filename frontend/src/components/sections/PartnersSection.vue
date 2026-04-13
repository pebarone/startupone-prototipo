<template>
  <section class="py-20 relative bg-slate-900 border-t border-slate-800" id="parceiros">
     <!-- Dark background patterns -->
     <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
       <div class="absolute top-[20%] left-[10%] w-72 h-72 bg-brand-900/40 rounded-full blur-[100px]"></div>
       <div class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-brand-600/20 rounded-full blur-[120px]"></div>
     </div>

     <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center mb-16 partners-header">
       <h2 class="text-brand-500 font-bold tracking-wide uppercase text-sm mb-3">Para Estabelecimentos</h2>
       <h3 class="text-3xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
         Transforme ociosidade em <span class="text-brand-400 inline-block">lucro.</span><br />
         Sem funcionários.
       </h3>
     </div>

     <div class="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
       <div class="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
         <div class="space-y-8 partner-features">
           <div class="flex gap-4 partner-feature">
             <div class="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-brand-400 flex items-center justify-center shadow-lg icon-box">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <div>
               <h4 class="text-xl font-bold text-white">Monetização Passiva</h4>
               <p class="text-slate-400 mt-1">Nenhum custo fixo alto. Seus clientes locam por hora, você ganha. Controle via dashboard em tempo real.</p>
             </div>
           </div>

           <div class="flex gap-4 partner-feature">
             <div class="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-brand-400 flex items-center justify-center shadow-lg icon-box">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             </div>
             <div>
               <h4 class="text-xl font-bold text-white">100% Segurado</h4>
               <p class="text-slate-400 mt-1">Com a FastLock a responsabilidade é nossa. Apólice anti-roubo inclusa por locker e item.</p>
             </div>
           </div>

           <div class="flex gap-4 partner-feature">
             <div class="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-brand-400 flex items-center justify-center shadow-lg icon-box">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <div>
               <h4 class="text-xl font-bold text-white">Nenhum Hardware Complexo</h4>
               <p class="text-slate-400 mt-1">O usuário usa a biometria do celular para abrir. Zero manutenção, apenas adesivos e travas na porta.</p>
             </div>
           </div>

           <div class="flex gap-4 partner-feature">
             <div class="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-brand-400 flex items-center justify-center shadow-lg icon-box">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </div>
             <div>
               <h4 class="text-xl font-bold text-white">Defina o Preço</h4>
               <p class="text-slate-400 mt-1">Configure taxa inicial e valor por hora (P/M/G) do seu ponto direto no dashboard. Você controla a receita.</p>
             </div>
           </div>
         </div>

         <!-- Dashboard Mockup -->
         <div class="relative w-full aspect-video rounded-2xl bg-slate-800 border border-slate-700 p-2 shadow-2xl shadow-brand-900/20 overflow-hidden group dashboard-mockup">
           <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent z-10 pointer-events-none"></div>
           <div class="w-full h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col relative z-0">
             <div class="h-8 border-b border-slate-800 flex items-center px-4 gap-2">
               <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
               <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
               <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
             </div>
             <div class="p-4 flex-1">
               <div class="h-10 w-32 bg-slate-800 rounded-lg mb-4 glow-bar delay-200"></div>
               <div class="grid grid-cols-2 gap-4 mb-4">
                 <div class="h-20 bg-brand-900/30 border border-brand-900/50 rounded-xl glow-bar"></div>
                 <div class="h-20 bg-slate-800 rounded-xl glow-bar delay-500"></div>
               </div>
               <div class="h-32 bg-slate-800 rounded-xl glow-bar delay-300"></div>
             </div>
           </div>
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
  gsap.from('.partners-header', {
    scrollTrigger: {
      trigger: '.partners-header',
      start: 'top 85%',
      toggleActions: 'play reverse play reverse'
    },
    y: 30,
    opacity: 0,
    duration: 0.8
  })

  gsap.fromTo('.partner-feature',
    { x: -30, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.partner-features',
        start: 'top 75%',
        toggleActions: 'play reverse play reverse'
      },
      x: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to('.partner-feature .icon-box svg', {
          scale: 1.1,
          rotate: 5,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          stagger: 0.2,
          ease: 'power1.inOut'
        })
      }
    }
  )

  // Pulsing dashboard elements
  gsap.fromTo('.glow-bar',
    { opacity: 0.5 },
    { opacity: 1, duration: 1.5, yoyo: true, repeat: -1, stagger: 0.3, ease: 'sine.inOut' }
  )

  gsap.from('.dashboard-mockup', {
    scrollTrigger: {
      trigger: '.dashboard-mockup',
      start: 'top 80%'
    },
    x: 40,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1)'
  })
})
</script>