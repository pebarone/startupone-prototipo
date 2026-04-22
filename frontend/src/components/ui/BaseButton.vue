<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      sizeClass,
      variantClass,
      (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    v-bind="$attrs"
  >
    <BaseSpinner v-if="loading" :size="spinnerSize" :color="spinnerColor" />
    <slot v-else-if="$slots.icon && !loading" name="icon" />
    <span :class="loading ? 'opacity-0' : ''"><slot /></span>
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <BaseSpinner :size="spinnerSize" :color="spinnerColor" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import BaseSpinner from './BaseSpinner.vue'

/**
 * @typedef {'primary'|'secondary'|'danger'|'ghost'|'outline'|'dark'} ButtonVariant
 * @typedef {'sm'|'md'|'lg'|'xl'} ButtonSize
 */

const props = defineProps({
  /** @type {ButtonVariant} */
  variant: { type: String, default: 'primary' },
  /** @type {ButtonSize} */
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' }
})

const sizeClass = computed(() => ({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-base'
}[props.size] || 'px-5 py-2.5 text-sm'))

const variantClass = computed(() => ({
  primary: 'bg-brand-600 text-white hover:bg-brand-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 focus-visible:ring-brand-500',
  secondary: 'bg-slate-800 text-white hover:bg-slate-700 hover:-translate-y-0.5 focus-visible:ring-slate-500',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30 focus-visible:ring-red-500',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500',
  outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500',
}[props.variant] || 'bg-brand-600 text-white hover:bg-brand-500'))

const spinnerSize = computed(() => props.size === 'xl' || props.size === 'lg' ? 'sm' : 'xs')
const spinnerColor = computed(() => props.variant === 'ghost' || props.variant === 'outline' ? 'slate' : 'white')
</script>
