<template>
  <div class="locker-grid-container relative">
    <!-- Polling / Loading Overlay -->
    <div
      v-if="loading && !lockers.length"
      class="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <BaseSpinner size="lg" color="brand" />
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Carregando grade...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!lockers.length"
      class="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center"
    >
      <div class="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-500">{{ emptyMessage }}</p>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="grid gap-4 transition-all duration-500"
      :style="gridStyle"
    >
      <LockerItem
        v-for="locker in lockers"
        :key="locker.id"
        :locker="locker"
        :selected="selectedLockerId === locker.id"
        :interactive="interactive"
        :require-available="requireAvailable"
        :animation-state="getAnimationState(locker)"
        @select="$emit('select', $event)"
      />
    </div>

    <!-- Polling Indicator (Subtle) -->
    <div
      v-if="polling"
      class="absolute -top-6 right-0 flex items-center gap-1.5 px-2 py-1"
    >
      <span class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ao vivo</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LockerItem from './LockerItem.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'

const props = defineProps({
  lockers: {
    type: Array,
    default: () => []
  },
  selectedLockerId: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  polling: {
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
  animateAll: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'Nenhum locker disponível neste local.'
  },
  /** @type {'idle' | 'preview' | 'opening' | 'open' | 'closing'} */
  globalAnimationState: {
    type: String,
    default: 'idle'
  }
})

defineEmits(['select'])

const gridStyle = computed(() => ({
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
}))

function getAnimationState(locker) {
  if (props.animateAll) {
    return props.globalAnimationState
  }

  if (props.selectedLockerId === locker.id) {
    return props.globalAnimationState
  }

  return 'idle'
}
</script>
