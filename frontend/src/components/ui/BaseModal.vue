<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @mousedown.self="closeOnBackdrop && close()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <!-- Panel -->
        <div
          :class="[
            'relative z-10 w-full bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden',
            maxWidthClass
          ]"
          role="dialog"
          :aria-label="title"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
            <slot name="header">
              <h2 class="text-lg font-bold text-white">{{ title }}</h2>
            </slot>
            <button
              v-if="showClose"
              @click="close"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-700/60 flex items-center justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: 'md' },
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

/** @param {string} size */
function close() {
  emit('update:modelValue', false)
  emit('close')
}

const maxWidthClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
}[props.maxWidth] || 'max-w-md'))
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}
</style>
