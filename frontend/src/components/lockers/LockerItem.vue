<template>
  <button
    type="button"
    class="locker-item group relative block w-full outline-none transition-all duration-300"
    :class="[
      isButtonDisabled ? 'cursor-default' : 'cursor-pointer',
      selected ? 'z-10' : 'z-0'
    ]"
    :disabled="isButtonDisabled"
    :aria-label="ariaLabel"
    @click="handleSelect"
  >
    <div v-if="selected" class="absolute -inset-1.5 rounded-2xl bg-brand-500/20 blur-md" />

    <div class="relative overflow-hidden rounded-2xl border p-1.5 shadow-sm transition-all duration-300" :class="[shellClass, sizeClass]">
      <svg viewBox="0 0 124 150" class="h-full w-full" role="img" aria-hidden="true">
        <defs>
          <linearGradient :id="frameGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient :id="doorGradientId" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" :stop-color="doorGradientStart" />
            <stop offset="100%" :stop-color="doorGradientEnd" />
          </linearGradient>
        </defs>

        <rect x="6" y="6" width="112" height="138" rx="16" :fill="`url(#${frameGradientId})`" />
        <rect x="13" y="14" width="98" height="122" rx="12" fill="#0b1220" />

        <g class="cavity-inner" :class="showCavityMark ? 'is-visible' : ''">
          <rect x="24" y="30" width="76" height="90" rx="10" fill="#111827" stroke="#1f2937" stroke-width="1" />
          <path d="M45 74l9 9 21-21" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        </g>

        <g class="door-group" :class="doorStateClass">
          <rect x="14" y="16" width="96" height="118" rx="13" :fill="`url(#${doorGradientId})`" />
          <rect x="22" y="27" width="80" height="18" rx="6" fill="rgba(255,255,255,0.16)" />
          <rect x="22" y="50" width="80" height="52" rx="8" fill="rgba(15,23,42,0.12)" />
          <rect x="95" y="63" width="4.5" height="24" rx="999" fill="rgba(226,232,240,0.85)" />
          <rect x="24" y="106" width="76" height="18" rx="6" fill="rgba(15,23,42,0.18)" />
        </g>

        <circle cx="102" cy="20" r="5.2" :fill="lampColor" />
        <circle cx="102" cy="20" r="8.4" :fill="lampGlow" opacity="0.36" />
      </svg>
    </div>

    <div class="mt-2 flex items-end justify-between px-0.5">
      <div>
        <p class="font-mono text-xs font-black tracking-tight" :class="textClass">{{ locker.code }}</p>
        <p class="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{{ sizeLabel }}</p>
      </div>
      <span class="rounded-full px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]" :class="statusBadgeClass">{{ statusLabel }}</span>
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

const emit = defineEmits(['select'])

const isAvailable = computed(() => props.locker.status === 'free')
const isButtonDisabled = computed(() => props.disabled || !props.interactive || (props.requireAvailable && !isAvailable.value))

const statusLabel = computed(() => {
  if (typeof props.locker?.status_label === 'string' && props.locker.status_label.trim()) {
    return props.locker.status_label
  }

  return {
    free: 'Livre',
    occupied: 'Ocupado',
    maintenance: 'Manutencao'
  }[props.locker.status] || props.locker.status
})

const sizeLabel = computed(() => {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[props.locker.size] || props.locker.size
})

const sizeClass = computed(() => {
  return {
    P: 'h-36',
    M: 'h-40',
    G: 'h-44'
  }[props.locker.size] || 'h-40'
})

const shellClass = computed(() => {
  if (props.locker.status === 'free') return 'border-emerald-200 bg-emerald-50/60 hover:-translate-y-0.5 hover:shadow-emerald-100'
  if (props.locker.status === 'occupied') return 'border-red-200 bg-red-50/60 hover:-translate-y-0.5 hover:shadow-red-100'
  if (props.locker.status === 'maintenance') return 'border-amber-200 bg-amber-50/60 hover:-translate-y-0.5 hover:shadow-amber-100'
  return 'border-slate-200 bg-slate-50/70'
})

const textClass = computed(() => {
  if (props.locker.status === 'free') return 'text-emerald-900'
  if (props.locker.status === 'occupied') return 'text-red-900'
  if (props.locker.status === 'maintenance') return 'text-amber-900'
  return 'text-slate-900'
})

const statusBadgeClass = computed(() => {
  if (props.locker.status === 'free') return 'bg-emerald-100 text-emerald-700'
  if (props.locker.status === 'occupied') return 'bg-red-100 text-red-700'
  if (props.locker.status === 'maintenance') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
})

const lampColor = computed(() => {
  if (props.locker.status === 'free') return '#22c55e'
  if (props.locker.status === 'occupied') return '#ef4444'
  if (props.locker.status === 'maintenance') return '#f59e0b'
  return '#94a3b8'
})

const lampGlow = computed(() => {
  if (props.locker.status === 'free') return '#4ade80'
  if (props.locker.status === 'occupied') return '#f87171'
  if (props.locker.status === 'maintenance') return '#fbbf24'
  return '#cbd5e1'
})

const doorGradientStart = computed(() => {
  if (props.locker.status === 'free') return '#ecfdf5'
  if (props.locker.status === 'occupied') return '#fef2f2'
  if (props.locker.status === 'maintenance') return '#fffbeb'
  return '#f8fafc'
})

const doorGradientEnd = computed(() => {
  if (props.locker.status === 'free') return '#bbf7d0'
  if (props.locker.status === 'occupied') return '#fecaca'
  if (props.locker.status === 'maintenance') return '#fde68a'
  return '#e2e8f0'
})

const showCavityMark = computed(() => ['preview', 'opening', 'open'].includes(props.animationState))

const doorStateClass = computed(() => {
  return {
    idle: 'door-idle',
    preview: 'door-preview',
    opening: 'door-opening',
    open: 'door-open',
    closing: 'door-closing'
  }[props.animationState] || 'door-idle'
})

const svgUid = computed(() => String(props.locker.id || props.locker.code || 'locker').replace(/[^a-zA-Z0-9_-]/g, ''))
const frameGradientId = computed(() => `locker-frame-${svgUid.value}`)
const doorGradientId = computed(() => `locker-door-${svgUid.value}`)

const ariaLabel = computed(() => `Armario ${props.locker.code}, tamanho ${sizeLabel.value}, status ${statusLabel.value}`)

function handleSelect() {
  if (isButtonDisabled.value) {
    return
  }

  emit('select', props.locker)
}
</script>

<style scoped>
.locker-item {
  transform-style: preserve-3d;
}

.door-group {
  transform-origin: 14px 75px;
  transform-box: fill-box;
  transition: transform 420ms cubic-bezier(0.23, 1, 0.32, 1);
}

.door-group.door-idle {
  transform: translateX(0px) scaleX(1);
}

.door-group.door-preview {
  transform: translateX(-4px) scaleX(0.8) skewY(-2deg);
}

.door-group.door-opening {
  transform: translateX(-8px) scaleX(0.46) skewY(-4deg);
}

.door-group.door-open {
  transform: translateX(-11px) scaleX(0.2) skewY(-5deg);
}

.door-group.door-closing {
  transform: translateX(-2px) scaleX(0.88) skewY(-1deg);
}

.cavity-inner {
  opacity: 0;
  transition: opacity 260ms ease-out;
}

.cavity-inner.is-visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .door-group,
  .cavity-inner {
    transition: none;
  }

  .door-group {
    transform: translateX(0px) scaleX(1) !important;
  }
}
</style>
