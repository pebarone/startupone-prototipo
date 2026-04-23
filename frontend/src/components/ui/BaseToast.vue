<template>
  <Teleport to="body">
    <div class="fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-80 pb-safe" aria-live="assertive" aria-label="Notificações de sistema" role="region">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['group flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg cursor-pointer select-none', variantClass(t.type)]"
          role="alert"
          @click="dismiss(t.id)"
        >
          <!-- Icon -->
          <div class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <!-- Success -->
            <svg v-if="t.type === 'success'" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <!-- Error -->
            <svg v-else-if="t.type === 'error'" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <!-- Warning -->
            <svg v-else-if="t.type === 'warning'" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <!-- Info -->
            <svg v-else class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold leading-snug" :class="labelClass(t.type)">{{ typeLabel(t.type) }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-500">{{ t.message }}</p>
          </div>

          <!-- Dismiss X -->
          <button
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-300 opacity-100 transition-opacity hover:text-slate-500 sm:opacity-0 sm:group-hover:opacity-100"
            :aria-label="'Fechar notificação'"
            @click.stop="dismiss(t.id)"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

/** @param {string} type */
function variantClass(type) {
  return {
    success: 'bg-white border-emerald-200 shadow-emerald-100/60',
    error:   'bg-white border-red-200 shadow-red-100/60',
    warning: 'bg-white border-amber-200 shadow-amber-100/60',
    info:    'bg-white border-blue-200 shadow-blue-100/60'
  }[type] || 'bg-white border-slate-200 shadow-slate-100/40'
}

/** @param {string} type */
function labelClass(type) {
  return {
    success: 'text-emerald-700',
    error:   'text-red-700',
    warning: 'text-amber-700',
    info:    'text-blue-700'
  }[type] || 'text-slate-700'
}

/** @param {string} type */
function typeLabel(type) {
  return { success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Informação' }[type] || 'Info'
}
</script>

<style scoped>
/* Emil: enter fast (ease-out), exit instant. Never ease-in on UI elements. */
.toast-enter-active {
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: opacity 160ms ease-out, transform 160ms ease-out;
}
.toast-enter-from {
  opacity: 0;
  /* Start near final position, not from nothing */
  transform: translateX(12px) scale(0.97);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}
/* Stagger: each consecutive toast enters slightly after */
.toast-move {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
