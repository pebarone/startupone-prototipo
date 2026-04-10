<template>
  <section class="py-32 relative bg-brand-900 border-t border-brand-800 overflow-hidden">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzNGQzOTkiIGZpbGwtb3BhY2l0eT0iMC4yNSIvPjwvc3ZnPg==')] opacity-30 cta-bg"></div>

    <div class="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center text-white">
      <h2 class="text-4xl md:text-6xl font-heading font-black tracking-tight mb-8">
        Guarde o passado.<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">Viva o presente.</span>
      </h2>
      <p class="text-xl text-brand-100 mb-12 max-w-2xl mx-auto leading-relaxed">
        Não importa se você precisa de 1 hora ou 1 semana. Nossa plataforma protege aquilo que importa com seguros reais e acesso via smartphone.
      </p>

      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <a href="/use" class="px-8 py-4 rounded-xl bg-white text-brand-900 font-bold hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-500 hover:scale-105 flex items-center justify-center gap-2 group">
          Começar a Guardar
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="#partner" class="px-8 py-4 rounded-xl bg-brand-800 text-white font-bold hover:bg-brand-700 hover:-translate-y-1 border border-brand-700 hover:border-brand-500 transition-all duration-500 flex items-center justify-center gap-2 group">
           <svg class="w-5 h-5 text-brand-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
           Cadastrar Estabelecimento
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'

onMounted(() => {
  gsap.to('.cta-bg', {
    backgroundPosition: '100px 100px',
    duration: 10,
    ease: 'linear',
    repeat: -1
  })
})
</script>