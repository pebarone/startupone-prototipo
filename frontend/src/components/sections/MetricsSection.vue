<template>
  <section class="py-20 bg-slate-50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16 metrics-header">
       <h2 class="text-brand-600 font-bold tracking-wide uppercase text-sm mb-2">Comprovado</h2>
       <p class="text-4xl font-heading font-black text-slate-900 tracking-tight">Números que trazem confiança</p>
    </div>

    <!-- Counters -->
    <div class="max-w-5xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center metrics-grid relative z-10">
      <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
        <h5 class="text-6xl font-black text-brand-600 font-heading mb-2 number-stat" data-target="15000">0</h5>
        <div class="text-slate-500 font-medium">Itens protegidos</div>
      </div>
      <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 delay-100">
        <h5 class="text-6xl font-black text-slate-900 font-heading mb-2 number-stat" data-target="99">0<span class="text-4xl">%</span></h5>
        <div class="text-slate-500 font-medium">Cobertura automática por sinistro</div>
      </div>
      <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 delay-200">
        <h5 class="text-6xl font-black text-brand-600 font-heading mb-2 number-stat" data-target="200">0<span class="text-4xl">+</span></h5>
        <div class="text-slate-500 font-medium">Parceiros Ativos</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  gsap.from('.metrics-header', {
    scrollTrigger: {
      trigger: '.metrics-header',
      start: 'top 85%'
    },
    y: 20,
    opacity: 0,
    duration: 0.6
  })

  gsap.from('.metrics-grid > div', {
    scrollTrigger: {
      trigger: '.metrics-grid',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'back.out(1)'
  })

  // Simple number counter via GSAP
  gsap.utils.toArray('.number-stat').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target'))
    const suffix = el.innerHTML.match(/<span.*/)?.[0] || ''
    
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%'
      },
      innerHTML: target,
      duration: 2,
      ease: 'power3.out',
      snap: { innerHTML: 1 },
      onUpdate: function() {
        if(suffix) el.innerHTML = Math.round(this.targets()[0].innerHTML) + suffix;
      }
    })
  })
})
</script>