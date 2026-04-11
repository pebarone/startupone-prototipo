<template>
  <div :class="['inline-flex items-center justify-center', sizeClass]" role="status" aria-label="Carregando">
    <svg
      :class="['animate-spin', colorClass, sizeClass]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * @typedef {'xs'|'sm'|'md'|'lg'|'xl'} SpinnerSize
 * @typedef {'brand'|'white'|'slate'|'red'} SpinnerColor
 */

const props = defineProps({
  /** @type {SpinnerSize} */
  size: { type: String, default: 'md' },
  /** @type {SpinnerColor} */
  color: { type: String, default: 'brand' }
})

const sizeClass = computed(() => ({
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}[props.size] || 'h-6 w-6'))

const colorClass = computed(() => ({
  brand: 'text-brand-600',
  white: 'text-white',
  slate: 'text-slate-400',
  red: 'text-red-500'
}[props.color] || 'text-brand-600'))
</script>
