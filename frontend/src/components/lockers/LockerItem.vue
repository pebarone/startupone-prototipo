<template>
  <button
    type="button"
    class="locker-item group relative block w-full outline-none perspective-1000 transition-all duration-300"
    :class="[
      interactive && isAvailable ? 'cursor-pointer' : 'cursor-default',
      sizeClass,
      selected ? 'z-10' : 'z-0'
    ]"
    :disabled="disabled || (requireAvailable && !isAvailable)"
    @click="$emit('select', locker)"
  >
    <!-- Selection Glow -->
    <div
      v-if="selected"
      class="absolute -inset-1.5 rounded-2xl bg-brand-500/20 blur-md animate-pulse"
    />

    <!-- Locker Container (Internal Cavity) -->
    <div
      class="relative h-full w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 shadow-inner"
    >
      <!-- Depth Shadow -->
      <div class="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent" />
      
      <!-- Internal Content (Visible when door opens) -->
      <div class="flex h-full w-full items-center justify-center opacity-40">
        <svg
          v-if="animationState === 'open' || animationState === 'opening'"
          class="h-6 w-6 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>

    <!-- Locker Door (The Front) -->
    <div
      class="absolute inset-0 rounded-xl border-2 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
      :class="[
        doorClasses,
        doorTransformClass,
        interactive && isAvailable ? 'group-hover:shadow-md group-active:scale-[0.98]' : ''
      ]"
      style="transform-origin: left center;"
    >
      <!-- Door Details -->
      <div class="flex h-full w-full flex-col p-3">
        <div class="flex items-start justify-between">
          <span class="font-mono text-xs font-black tracking-tight" :class="textClass">
            {{ locker.code }}
          </span>
          <span class="h-2 w-2 rounded-full" :class="dotClass" />
        </div>

        <div class="mt-auto flex items-end justify-between">
          <div class="space-y-0.5">
            <p class="text-[9px] font-black uppercase tracking-widest opacity-60" :class="textClass">
              {{ sizeLabel }}
            </p>
            <p class="text-[10px] font-bold uppercase tracking-wider" :class="textClass">
              {{ statusLabel }}
            </p>
          </div>
          
          <!-- Handle -->
          <div class="h-5 w-1.5 rounded-full bg-black/5 ring-1 ring-black/5" />
        </div>
      </div>
      
      <!-- Gloss effect -->
      <div class="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>

    <!-- Tooltip for non-interactive/busy states -->
    <div 
      v-if="!isAvailable && !requireAvailable"
      class="absolute -top-1 px-2 py-0.5 rounded bg-slate-800 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      {{ statusLabel }}
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  locker: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: true
  },
  requireAvailable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** @type {'idle' | 'preview' | 'opening' | 'open' | 'closing'} */
  animationState: {
    type: String,
    default: 'idle'
  }
})

defineEmits(['select'])

const isAvailable = computed(() => props.locker.status === 'free')

const statusLabel = computed(() => {
  return {
    free: 'Livre',
    occupied: 'Ocupado',
    maintenance: 'Em manutenção'
  }[props.locker.status] || props.locker.status
})

const sizeLabel = computed(() => {
  return { P: 'Pequeno', M: 'Médio', G: 'Grande' }[props.locker.size] || props.locker.size
})

const sizeClass = computed(() => {
  // Height based on size
  return {
    P: 'h-32',
    M: 'h-48',
    G: 'h-64'
  }[props.locker.size] || 'h-40'
})

const doorClasses = computed(() => {
  const status = props.locker.status
  if (status === 'free') return 'bg-emerald-50 border-emerald-200 shadow-emerald-500/5'
  if (status === 'occupied') return 'bg-red-50 border-red-200 shadow-red-500/5'
  if (status === 'maintenance') return 'bg-amber-50 border-amber-200 shadow-amber-500/5'
  return 'bg-slate-50 border-slate-200'
})

const textClass = computed(() => {
  const status = props.locker.status
  if (status === 'free') return 'text-emerald-700'
  if (status === 'occupied') return 'text-red-700'
  if (status === 'maintenance') return 'text-amber-700'
  return 'text-slate-700'
})

const dotClass = computed(() => {
  const status = props.locker.status
  if (status === 'free') return 'bg-emerald-500'
  if (status === 'occupied') return 'bg-red-500'
  if (status === 'maintenance') return 'bg-amber-500'
  return 'bg-slate-400'
})

const doorTransformClass = computed(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     return props.animationState === 'open' ? 'opacity-20' : 'opacity-100'
  }

  return {
    idle: 'rotate-y-0',
    preview: '-rotate-y-12',
    opening: '-rotate-y-45',
    open: '-rotate-y-[105deg]',
    closing: 'rotate-y-0'
  }[props.animationState] || 'rotate-y-0'
})
</script>

<style scoped>
.rotate-y-0 { transform: rotateY(0deg); }
.preview-rotate { transform: rotateY(-12deg); }
.-rotate-y-12 { transform: rotateY(-12deg); }
.-rotate-y-45 { transform: rotateY(-45deg); }
.-rotate-y-\[105deg\] { transform: rotateY(-105deg); }

.locker-item {
  transform-style: preserve-3d;
}

.locker-door {
  backface-visibility: hidden;
}
</style>
