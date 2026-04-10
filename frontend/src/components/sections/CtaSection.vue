<template>
  <section class="py-32 relative bg-slate-900 border-t border-slate-800 overflow-hidden cta-section">
    <!-- Animated background patterns -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzNGQzOTkiIGZpbGwtb3BhY2l0eT0iMC4yNSIvPjwvc3ZnPg==')] opacity-10 cta-bg"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Floating animated SVG props -->
    <div class="absolute top-20 left-[15%] w-24 h-24 text-brand-500/30 cta-float-1 lg:block hidden">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
    </div>
    <div class="absolute bottom-20 right-[15%] w-32 h-32 text-brand-400/20 cta-float-2 lg:block hidden">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
    </div>

    <div class="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center text-white">
      <div class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
        </span>
        Tecnologia Zero Atrito
      </div>

      <h2 class="text-5xl md:text-7xl font-heading font-black tracking-tight mb-8">
        Guarde o passado.<br/>
        <span class="text-brand-400">Viva o presente.</span>
      </h2>
      
      <p class="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
        Não importa se você precisa de 1 hora ou 1 semana. Nossa plataforma protege aquilo que importa com seguros reais e acesso via smartphone.
      </p>

      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <a href="/use" class="relative group overflow-hidden px-8 py-4 rounded-xl bg-brand-500 text-white font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3">
          <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <span class="relative z-10">Começar a Guardar</span>
          <svg class="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="#partner" class="px-8 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 hover:-translate-y-1 border border-slate-700 hover:border-brand-500 transition-all duration-300 flex items-center justify-center gap-3 group">
           <svg class="w-5 h-5 text-brand-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
           Cadastrar Estabelecimento
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  gsap.to('.cta-bg', {
    backgroundPosition: '100px 100px',
    duration: 15,
    ease: 'linear',
    repeat: -1
  })

  // Floating SVGs Animation
  gsap.to('.cta-float-1', {
    y: 30,
    rotation: 15,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })

  gsap.to('.cta-float-2', {
    y: -40,
    rotation: -10,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1.5
  })
})
</script>