<script setup>
import { onMounted, ref } from 'vue'
import { ArrowRight, Mail } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ctaRef = ref(null)

onMounted(() => {
  gsap.fromTo('.cta-content',
    { y: 50, opacity: 0, scale: 0.95 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  )
})
</script>

<template>
  <section ref="ctaRef" class="py-24 bg-white relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    
    <div class="container mx-auto px-6 md:px-12 relative z-10">
      <div class="cta-content max-w-4xl mx-auto bg-dark rounded-3xl p-10 md:p-16 text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
        
        <!-- Inner decorative elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <h2 class="text-3xl md:text-5xl font-heading font-bold text-white mb-6 tracking-tight relative z-10">
          Pronto para transformar <br class="hidden md:block" />
          sua produtividade?
        </h2>
        
        <p class="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
          Junte-se a mais de 50.000 equipes que já usam o ProTask para entregar projetos mais rápido e com menos estresse.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <a href="#pricing" class="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-dark transition-all duration-200 bg-white border border-transparent rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-lg hover:-translate-y-0.5">
            Começar teste gratuito
            <ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <button class="w-full sm:w-auto group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 backdrop-blur-sm">
            Falar com vendas
          </button>
        </div>
        
        <p class="text-sm text-slate-400 mt-6 relative z-10">
          14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>
      
      <!-- Newsletter -->
      <div class="mt-24 max-w-2xl mx-auto text-center">
        <h3 class="text-xl font-heading font-bold text-dark mb-4">Receba dicas de produtividade</h3>
        <p class="text-slate-600 mb-6">Assine nossa newsletter semanal e aprenda a trabalhar de forma mais inteligente.</p>
        
        <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" @submit.prevent>
          <div class="relative flex-grow">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              required
            />
          </div>
          <button 
            type="submit"
            class="px-6 py-3 bg-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark whitespace-nowrap"
          >
            Inscrever-se
          </button>
        </form>
      </div>
      
    </div>
  </section>
</template>
