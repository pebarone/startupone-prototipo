<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      data-base-modal-overlay="true"
      class="fixed inset-0 z-[2500] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40"
        aria-hidden="true"
        @mousedown="closeOnBackdrop && close()"
      />

      <!-- Panel -->
      <div
        :class="[
          'relative z-10 w-full bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col overscroll-contain',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[92dvh] sm:max-h-[90vh] pb-safe pt-safe',
          maxWidthClass
        ]"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
      >
        <!-- Header -->
        <div v-if="title || $slots.header" class="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <slot name="header">
            <h2 class="text-base font-bold text-slate-900">{{ title }}</h2>
          </slot>
          <button
            v-if="showClose"
            @click="close"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body — scrollable -->
        <div class="px-5 py-5 overflow-y-auto flex-1 overscroll-contain">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50/80">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: 'md' },
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])
const route = useRoute()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function recoverModalState() {
  if (props.modelValue) {
    close()
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    recoverModalState()
  }
}

function handleWindowFocus() {
  recoverModalState()
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

const maxWidthClass = computed(() => ({
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
}[props.maxWidth] || 'sm:max-w-md'))

watch(
  () => route.fullPath,
  () => {
    if (props.modelValue) {
      close()
    }
  }
)

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>
