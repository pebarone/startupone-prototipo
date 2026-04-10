<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import NavBar from './components/layout/NavBar.vue'
import HeroSection from './components/sections/HeroSection.vue'
import MetricsSection from './components/sections/MetricsSection.vue'
import FeaturesSection from './components/sections/FeaturesSection.vue'
import IntegrationsSection from './components/sections/IntegrationsSection.vue'
import TestimonialsSection from './components/sections/TestimonialsSection.vue'
import PricingSection from './components/sections/PricingSection.vue'
import FaqSection from './components/sections/FaqSection.vue'
import CtaSection from './components/sections/CtaSection.vue'
import FooterSection from './components/layout/FooterSection.vue'

gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
  // Global scroll animations setup
  const sections = document.querySelectorAll('section')
  
  sections.forEach((section) => {
    gsap.fromTo(section, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  })
})
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10 pointer-events-none"></div>
    <div class="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[100px] -z-10 pointer-events-none"></div>
    
    <NavBar />
    
    <main class="flex-grow">
      <HeroSection />
      <MetricsSection />
      <FeaturesSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </main>
    
    <FooterSection />
  </div>
</template>

<style>
/* Global transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
