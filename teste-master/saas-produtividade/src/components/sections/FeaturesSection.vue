<script setup>
import { onMounted, ref } from 'vue'
import { LayoutDashboard, Zap, Users, Calendar, Shield, Smartphone } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const featuresRef = ref(null)

const features = [
  {
    icon: LayoutDashboard,
    title: 'Visão Centralizada',
    description: 'Acompanhe o progresso de todos os projetos em um único dashboard intuitivo e personalizável.',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    icon: Zap,
    title: 'Automação Inteligente',
    description: 'Crie regras para automatizar tarefas repetitivas e libere tempo para o trabalho estratégico.',
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  {
    icon: Users,
    title: 'Colaboração em Tempo Real',
    description: 'Comunique-se com sua equipe, compartilhe arquivos e tome decisões mais rápido.',
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  {
    icon: Calendar,
    title: 'Gestão de Prazos',
    description: 'Visualize cronogramas, defina dependências e garanta que nenhum prazo seja perdido.',
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  },
  {
    icon: Shield,
    title: 'Segurança de Nível Empresarial',
    description: 'Seus dados protegidos com criptografia de ponta a ponta e conformidade com LGPD.',
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  },
  {
    icon: Smartphone,
    title: 'Acesso em Qualquer Lugar',
    description: 'Aplicativos nativos para iOS e Android para você gerenciar sua equipe de onde estiver.',
    color: 'text-teal-500',
    bg: 'bg-teal-50'
  }
]

onMounted(() => {
  // Stagger animation for feature cards
  gsap.fromTo('.feature-card',
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: featuresRef.value,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    }
  )

  // Hover animations setup
  const cards = document.querySelectorAll('.feature-card')
  cards.forEach(card => {
    const iconContainer = card.querySelector('.icon-container')
    const icon = card.querySelector('svg')
    
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' })
      gsap.to(iconContainer, { scale: 1.1, duration: 0.3, ease: 'back.out(1.7)' })
      gsap.to(icon, { rotation: 15, duration: 0.3, ease: 'power2.out' })
    })
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' })
      gsap.to(iconContainer, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(icon, { rotation: 0, duration: 0.3, ease: 'power2.out' })
    })
  })
})
</script>

<template>
  <section id="features" ref="featuresRef" class="py-24 bg-slate-50 relative">
    <div class="container mx-auto px-6 md:px-12">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-sm font-bold text-primary uppercase tracking-widest mb-3">Recursos Principais</h2>
        <h3 class="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark mb-6 tracking-tight">
          Tudo que você precisa para <br class="hidden md:block" />
          <span class="text-gradient">trabalhar melhor</span>
        </h3>
        <p class="text-lg text-slate-600">
          Ferramentas poderosas projetadas para simplificar fluxos de trabalho complexos e impulsionar a produtividade da sua equipe.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card bg-white rounded-2xl p-8 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden group"
        >
          <!-- Decorative background gradient on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
          
          <div class="relative z-10">
            <div 
              class="icon-container w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform"
              :class="feature.bg"
            >
              <component :is="feature.icon" class="w-7 h-7" :class="feature.color" />
            </div>
            
            <h4 class="text-xl font-heading font-bold text-dark mb-3">{{ feature.title }}</h4>
            <p class="text-slate-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
        
      </div>
      
    </div>
  </section>
</template>
