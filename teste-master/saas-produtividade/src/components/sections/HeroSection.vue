<script setup>
import { onMounted, ref } from 'vue'
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-vue-next'
import gsap from 'gsap'

const heroRef = ref(null)
const mockupRef = ref(null)
const contentRef = ref(null)

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // Content animation
  tl.fromTo(contentRef.value.children,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.5 }
  )

  // Mockup animation
  tl.fromTo(mockupRef.value,
    { y: 100, opacity: 0, scale: 0.95, rotationX: 15 },
    { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1.2, ease: 'expo.out' },
    '-=0.4'
  )

  // Floating elements animation
  gsap.to('.floating-element', {
    y: -15,
    duration: 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: {
      each: 0.5,
      from: 'random'
    }
  })
})
</script>

<template>
  <section ref="heroRef" class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    <div class="container mx-auto px-6 md:px-12 relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        <!-- Content -->
        <div ref="contentRef" class="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            ProTask 2.0 já disponível
          </div>
          
          <h1 class="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-dark leading-[1.1] mb-6 tracking-tight">
            Sua equipe, <br class="hidden lg:block" />
            <span class="text-gradient relative inline-block">
              sincronizada
              <svg class="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="2" fill="transparent" />
              </svg>
            </span>
            <br class="hidden lg:block" />
            e produtiva.
          </h1>
          
          <p class="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
            O ProTask centraliza tarefas, metas e comunicação em um único lugar. Elimine o caos e foque no que realmente importa.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
            <a href="#pricing" class="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-primary border border-transparent rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5">
              Testar grátis por 14 dias
              <ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <button class="w-full sm:w-auto group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 transition-all duration-200 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 shadow-sm">
              <PlayCircle class="mr-2 w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              Ver demonstração
            </button>
          </div>
          
          <div class="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
            <div class="flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-accent" />
              Sem cartão de crédito
            </div>
            <div class="flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-accent" />
              Cancele quando quiser
            </div>
          </div>
        </div>
        
        <!-- Mockup -->
        <div class="relative lg:h-[600px] flex items-center justify-center perspective-1000">
          <!-- Decorative background blobs -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl -z-10"></div>
          
          <div ref="mockupRef" class="relative w-full max-w-lg lg:max-w-none transform-style-3d">
            <!-- Main Dashboard Mockup -->
            <div class="relative rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden z-20">
              <!-- Browser Header -->
              <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div class="mx-auto bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-400 w-1/2 text-center flex items-center justify-center gap-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  app.protask.com
                </div>
              </div>
              
              <!-- App Content (Simplified) -->
              <div class="p-6 grid grid-cols-12 gap-4 bg-slate-50/50">
                <!-- Sidebar -->
                <div class="col-span-3 space-y-3">
                  <div class="h-8 bg-slate-200 rounded-md w-3/4 mb-6"></div>
                  <div class="h-4 bg-slate-200 rounded w-full"></div>
                  <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div class="h-4 bg-slate-200 rounded w-4/6"></div>
                  <div class="h-4 bg-slate-200 rounded w-full mt-8"></div>
                  <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
                
                <!-- Main Area -->
                <div class="col-span-9 space-y-4">
                  <div class="flex justify-between items-center mb-2">
                    <div class="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div class="h-8 w-8 bg-primary/20 rounded-full"></div>
                  </div>
                  
                  <!-- Cards -->
                  <div class="grid grid-cols-3 gap-3">
                    <div class="h-24 bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col justify-between">
                      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                      <div class="h-6 bg-primary/10 rounded w-3/4"></div>
                    </div>
                    <div class="h-24 bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col justify-between">
                      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                      <div class="h-6 bg-accent/10 rounded w-3/4"></div>
                    </div>
                    <div class="h-24 bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col justify-between">
                      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                      <div class="h-6 bg-amber-100 rounded w-3/4"></div>
                    </div>
                  </div>
                  
                  <!-- List -->
                  <div class="bg-white border border-slate-100 rounded-xl shadow-sm p-4 space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 rounded border border-slate-300"></div>
                      <div class="h-3 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 rounded border border-slate-300 bg-primary"></div>
                      <div class="h-3 bg-slate-200 rounded w-1/2 line-through opacity-50"></div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 rounded border border-slate-300"></div>
                      <div class="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Floating Elements -->
            <div class="floating-element absolute -right-8 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-30 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-dark">Projeto entregue</div>
                <div class="text-xs text-slate-500">Há 2 minutos</div>
              </div>
            </div>
            
            <div class="floating-element absolute -left-6 bottom-20 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 flex items-center gap-3">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                <div class="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                <div class="w-8 h-8 rounded-full bg-amber-200 border-2 border-white"></div>
              </div>
              <div class="text-sm font-semibold text-dark">+5 online</div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
