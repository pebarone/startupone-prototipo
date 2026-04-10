<template>
  <div class="homepage relative bg-slate-50">
    <HeroSection />
    <PartnersSection />
    <HowItWorksSection />
    <BenefitsSection />
    <MetricsSection />
    <CtaSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

import HeroSection from '@/components/sections/HeroSection.vue'
import PartnersSection from '@/components/sections/PartnersSection.vue'
import HowItWorksSection from '@/components/sections/HowItWorksSection.vue'
import BenefitsSection from '@/components/sections/BenefitsSection.vue'
import MetricsSection from '@/components/sections/MetricsSection.vue'
import CtaSection from '@/components/sections/CtaSection.vue'

onMounted(() => {
  // Master animations if needed, mostly handled inside components
})
</script>