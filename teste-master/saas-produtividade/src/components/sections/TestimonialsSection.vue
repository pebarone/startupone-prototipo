<script setup>
import { onMounted, ref } from 'vue'
import { Star, Quote } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const testimonialsRef = ref(null)

const testimonials = [
  {
    name: 'Ana Silva',
    role: 'Gerente de Projetos, TechCorp',
    content: 'O ProTask revolucionou a forma como nossa equipe trabalha. A visibilidade que temos agora sobre os projetos reduziu nossas reuniões de alinhamento em 50%.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5
  },
  {
    name: 'Carlos Mendes',
    role: 'CEO, StartupX',
    content: 'Testamos várias ferramentas antes de encontrar o ProTask. A interface limpa e as automações poderosas fizeram toda a diferença na nossa produtividade diária.',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 5
  },
  {
    name: 'Mariana Costa',
    role: 'Diretora de Marketing, Agência Criativa',
    content: 'A capacidade de integrar com nossas ferramentas de design e comunicação tornou o ProTask o centro nervoso da nossa agência. Indispensável.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4
  }
]

onMounted(() => {
  gsap.fromTo('.testimonial-card',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: testimonialsRef.value,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    }
  )
})
</script>

<template>
  <section ref="testimonialsRef" class="py-24 bg-slate-50 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
    </div>

    <div class="container mx-auto px-6 md:px-12 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-sm font-bold text-primary uppercase tracking-widest mb-3">Depoimentos</h2>
        <h3 class="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark mb-6 tracking-tight">
          Amado por equipes <br class="hidden md:block" />
          <span class="text-gradient">inovadoras</span>
        </h3>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div 
          v-for="(testimonial, index) in testimonials" 
          :key="index"
          class="testimonial-card bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative group hover:-translate-y-2 transition-transform duration-300"
        >
          <Quote class="absolute top-6 right-6 w-10 h-10 text-slate-100 group-hover:text-primary/10 transition-colors duration-300" />
          
          <div class="flex gap-1 mb-6">
            <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'" />
          </div>
          
          <p class="text-slate-600 leading-relaxed mb-8 relative z-10">
            "{{ testimonial.content }}"
          </p>
          
          <div class="flex items-center gap-4 mt-auto">
            <img :src="testimonial.avatar" :alt="testimonial.name" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
            <div>
              <h4 class="font-bold text-dark text-sm">{{ testimonial.name }}</h4>
              <p class="text-xs text-slate-500">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
