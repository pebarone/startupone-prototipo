<script setup>
import { onMounted, ref } from 'vue'
import { CountUp } from 'countup.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

const metricsRef = ref(null)
const counters = ref([])

const metrics = [
  { id: 'users', value: 50000, suffix: '+', label: 'Usuários ativos', color: 'text-primary' },
  { id: 'tasks', value: 2.5, suffix: 'M', label: 'Tarefas concluídas', color: 'text-accent' },
  { id: 'time', value: 30, suffix: '%', label: 'Tempo economizado', color: 'text-amber-500' },
  { id: 'rating', value: 4.9, suffix: '/5', label: 'Avaliação média', color: 'text-purple-500', decimals: 1 }
]

onMounted(() => {
  // Initialize CountUp instances
  metrics.forEach((metric, index) => {
    const el = document.getElementById(`counter-${metric.id}`)
    if (el) {
      const countUp = new CountUp(el, metric.value, {
        decimalPlaces: metric.decimals || 0,
        duration: 2.5,
        useEasing: true,
        useGrouping: true,
        separator: '.',
        decimal: ',',
        suffix: metric.suffix
      })
      counters.value.push(countUp)
    }
  })

  // Trigger animation on scroll
  ScrollTrigger.create({
    trigger: metricsRef.value,
    start: 'top 80%',
    onEnter: () => {
      counters.value.forEach(counter => {
        if (!counter.error) {
          counter.start()
        } else {
          console.error(counter.error)
        }
      })
      
      // Animate the containers
      gsap.fromTo('.metric-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      )
    },
    once: true
  })
})
</script>

<template>
  <section ref="metricsRef" class="py-16 bg-white border-y border-slate-100 relative overflow-hidden">
    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#1E40AF 1px, transparent 1px); background-size: 24px 24px;"></div>
    
    <div class="container mx-auto px-6 md:px-12 relative z-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-slate-100">
        
        <div v-for="metric in metrics" :key="metric.id" class="metric-item flex flex-col items-center justify-center opacity-0">
          <div 
            :id="`counter-${metric.id}`" 
            class="text-4xl md:text-5xl font-heading font-bold mb-2 tracking-tight"
            :class="metric.color"
          >
            0
          </div>
          <div class="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">
            {{ metric.label }}
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>
