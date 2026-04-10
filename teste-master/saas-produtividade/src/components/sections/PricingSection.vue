<script setup>
import { onMounted, ref } from 'vue'
import { Check, X } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const pricingRef = ref(null)
const isAnnual = ref(true)

const plans = [
  {
    name: 'Básico',
    description: 'Para indivíduos e pequenas equipes começando.',
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      { name: 'Até 5 usuários', included: true },
      { name: 'Projetos ilimitados', included: true },
      { name: 'Integrações básicas', included: true },
      { name: 'Suporte por email', included: true },
      { name: 'Automações avançadas', included: false },
      { name: 'Relatórios personalizados', included: false }
    ],
    popular: false,
    cta: 'Começar Grátis'
  },
  {
    name: 'Pro',
    description: 'Para equipes em crescimento que precisam de mais poder.',
    monthlyPrice: 79,
    annualPrice: 69,
    features: [
      { name: 'Até 20 usuários', included: true },
      { name: 'Projetos ilimitados', included: true },
      { name: 'Todas as integrações', included: true },
      { name: 'Suporte prioritário', included: true },
      { name: 'Automações avançadas', included: true },
      { name: 'Relatórios personalizados', included: false }
    ],
    popular: true,
    cta: 'Testar Pro por 14 dias'
  },
  {
    name: 'Enterprise',
    description: 'Para grandes organizações com necessidades complexas.',
    monthlyPrice: 199,
    annualPrice: 179,
    features: [
      { name: 'Usuários ilimitados', included: true },
      { name: 'Projetos ilimitados', included: true },
      { name: 'Integrações personalizadas', included: true },
      { name: 'Gerente de conta dedicado', included: true },
      { name: 'Automações avançadas', included: true },
      { name: 'Relatórios personalizados', included: true }
    ],
    popular: false,
    cta: 'Falar com Vendas'
  }
]

onMounted(() => {
  gsap.fromTo('.pricing-card',
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: pricingRef.value,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    }
  )
})
</script>

<template>
  <section id="pricing" ref="pricingRef" class="py-24 bg-white relative">
    <div class="container mx-auto px-6 md:px-12">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-sm font-bold text-primary uppercase tracking-widest mb-3">Preços Simples</h2>
        <h3 class="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark mb-6 tracking-tight">
          Planos que crescem <br class="hidden md:block" />
          <span class="text-gradient">com você</span>
        </h3>
        
        <!-- Toggle -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <span class="text-sm font-medium" :class="!isAnnual ? 'text-dark' : 'text-slate-500'">Mensal</span>
          <button 
            @click="isAnnual = !isAnnual"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="isAnnual ? 'bg-primary' : 'bg-slate-300'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isAnnual ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
          <span class="text-sm font-medium flex items-center gap-2" :class="isAnnual ? 'text-dark' : 'text-slate-500'">
            Anual
            <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">Economize 20%</span>
          </span>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div 
          v-for="(plan, index) in plans" 
          :key="index"
          class="pricing-card relative bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col"
          :class="plan.popular ? 'border-primary shadow-xl shadow-primary/10 scale-105 z-10' : 'border-slate-200 shadow-sm hover:shadow-md'"
        >
          <div v-if="plan.popular" class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            Mais Popular
          </div>
          
          <div class="mb-8">
            <h4 class="text-xl font-heading font-bold text-dark mb-2">{{ plan.name }}</h4>
            <p class="text-sm text-slate-500 h-10">{{ plan.description }}</p>
          </div>
          
          <div class="mb-8 flex items-baseline gap-2">
            <span class="text-4xl font-heading font-bold text-dark">
              R$ {{ isAnnual ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span class="text-slate-500 text-sm font-medium">/mês</span>
          </div>
          
          <ul class="space-y-4 mb-8 flex-grow">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex" class="flex items-start gap-3">
              <Check v-if="feature.included" class="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <X v-else class="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <span class="text-sm" :class="feature.included ? 'text-slate-700' : 'text-slate-400'">{{ feature.name }}</span>
            </li>
          </ul>
          
          <button 
            class="w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="plan.popular ? 'bg-primary text-white hover:bg-blue-800 focus:ring-primary shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200'"
          >
            {{ plan.cta }}
          </button>
        </div>
      </div>
      
    </div>
  </section>
</template>
