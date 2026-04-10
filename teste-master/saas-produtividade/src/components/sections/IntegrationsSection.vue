<script setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const marqueeRef = ref(null)

const integrations = [
  { name: 'Slack', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg' },
  { name: 'Google Drive', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
  { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
  { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Jira', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg' },
  { name: 'Trello', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg' },
  { name: 'Notion', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg' },
  { name: 'Zoom', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zoom/zoom-original.svg' }
]

onMounted(() => {
  // Infinite marquee animation
  const marqueeContent = marqueeRef.value.querySelector('.marquee-content')
  const marqueeWidth = marqueeContent.offsetWidth
  
  gsap.to(marqueeContent, {
    x: -marqueeWidth / 2,
    duration: 20,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % (marqueeWidth / 2))
    }
  })
})
</script>

<template>
  <section id="integrations" class="py-20 bg-white border-y border-slate-100 overflow-hidden">
    <div class="container mx-auto px-6 md:px-12 text-center mb-12">
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Integra-se com suas ferramentas favoritas</h2>
    </div>
    
    <div ref="marqueeRef" class="relative w-full overflow-hidden flex items-center">
      <!-- Gradient masks for smooth edges -->
      <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      
      <div class="marquee-content flex items-center gap-16 px-8 whitespace-nowrap">
        <!-- Duplicate list for seamless loop -->
        <template v-for="i in 2" :key="i">
          <div 
            v-for="(integration, index) in integrations" 
            :key="`${i}-${index}`"
            class="flex items-center justify-center w-24 h-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <img :src="integration.icon" :alt="integration.name" class="w-12 h-12 object-contain" />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
