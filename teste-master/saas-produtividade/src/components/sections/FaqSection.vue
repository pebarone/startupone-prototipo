<script setup>
import { onMounted, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const faqRef = ref(null)
const activeIndex = ref(null)

const faqs = [
  {
    question: 'O que é o ProTask?',
    answer: 'O ProTask é uma plataforma completa de gestão de projetos e produtividade projetada para equipes modernas. Ele centraliza tarefas, comunicação e arquivos em um único lugar.'
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem taxas ocultas. O acesso continuará até o final do ciclo de faturamento atual.'
  },
  {
    question: 'O ProTask se integra com outras ferramentas?',
    answer: 'Absolutamente! O ProTask possui integrações nativas com Slack, Google Drive, GitHub, Figma, Jira, Trello, Notion e muitas outras ferramentas populares.'
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'A segurança é nossa prioridade. Utilizamos criptografia de ponta a ponta, backups diários e estamos em total conformidade com a LGPD e GDPR.'
  },
  {
    question: 'Existe um limite de projetos no plano Básico?',
    answer: 'Não, todos os nossos planos incluem projetos ilimitados. Acreditamos que você não deve ser penalizado por ser produtivo.'
  }
]

const toggleFaq = (index) => {
  if (activeIndex.value === index) {
    activeIndex.value = null
  } else {
    activeIndex.value = index
  }
}

onMounted(() => {
  gsap.fromTo('.faq-item',
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: faqRef.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  )
})
</script>

<template>
  <section id="faq" ref="faqRef" class="py-24 bg-slate-50 relative">
    <div class="container mx-auto px-6 md:px-12 max-w-4xl">
      
      <div class="text-center mb-16">
        <h2 class="text-sm font-bold text-primary uppercase tracking-widest mb-3">Dúvidas Frequentes</h2>
        <h3 class="text-3xl md:text-4xl font-heading font-bold text-dark mb-6 tracking-tight">
          Tudo que você precisa <br class="hidden md:block" />
          <span class="text-gradient">saber</span>
        </h3>
      </div>

      <div class="space-y-4">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300"
          :class="activeIndex === index ? 'shadow-md border-primary/30' : 'hover:border-slate-300'"
        >
          <button 
            @click="toggleFaq(index)"
            class="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
          >
            <span class="font-bold text-dark pr-8">{{ faq.question }}</span>
            <ChevronDown 
              class="w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0"
              :class="activeIndex === index ? 'rotate-180 text-primary' : ''"
            />
          </button>
          
          <div 
            class="px-6 overflow-hidden transition-all duration-300 ease-in-out"
            :class="activeIndex === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'"
          >
            <p class="text-slate-600 leading-relaxed">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
      
    </div>
  </section>
</template>
