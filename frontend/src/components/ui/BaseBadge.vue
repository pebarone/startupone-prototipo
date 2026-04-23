<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border',
      variantClass
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColorClass]" />
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

/**
 * @typedef {'success'|'warning'|'danger'|'info'|'neutral'|'brand'} BadgeVariant
 */

const props = defineProps({
  /** @type {BadgeVariant} */
  variant: { type: String, default: 'neutral' },
  dot: { type: Boolean, default: false }
})

const variantClass = computed(() => ({
  success: 'bg-emerald-900/40 text-emerald-400 border-emerald-700',
  warning: 'bg-amber-900/40 text-amber-400 border-amber-700',
  danger: 'bg-red-900/40 text-red-400 border-red-700',
  info: 'bg-blue-900/40 text-blue-400 border-blue-700',
  neutral: 'bg-slate-800/60 text-slate-400 border-slate-700',
  brand: 'bg-brand-900/40 text-brand-400 border-brand-700',

  // Variantes claras para contexto light (AAA 7:1 contrast)
  'success-light': 'bg-emerald-100 text-emerald-900 border-emerald-200',
  'warning-light': 'bg-amber-100 text-amber-900 border-amber-200',
  'danger-light': 'bg-red-100 text-red-900 border-red-200',
  'info-light': 'bg-blue-100 text-blue-900 border-blue-200',
  'neutral-light': 'bg-slate-100 text-slate-900 border-slate-200',
  'brand-light': 'bg-brand-100 text-brand-900 border-brand-200',
}[props.variant] || 'bg-slate-800/60 text-slate-400 border-slate-700'))

const dotColorClass = computed(() => ({
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  neutral: 'bg-slate-400',
  brand: 'bg-brand-400',
  'success-light': 'bg-emerald-700',
  'warning-light': 'bg-amber-700',
  'danger-light': 'bg-red-700',
  'info-light': 'bg-blue-700',
  'neutral-light': 'bg-slate-700',
  'brand-light': 'bg-brand-700',
}[props.variant] || 'bg-slate-400'))
</script>
