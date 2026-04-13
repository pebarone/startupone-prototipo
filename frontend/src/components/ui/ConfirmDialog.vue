<template>
  <BaseModal :model-value="modelValue" max-width="sm" @update:model-value="$emit('update:modelValue', $event)">
    <div class="p-6">
      <div :class="['mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full', toneStyles.iconWrap]">
        <svg class="h-6 w-6" :class="toneStyles.icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 class="mb-2 text-center text-lg font-black text-slate-900">{{ title }}</h3>
      <p class="text-center text-sm leading-6 text-slate-500">{{ description }}</p>

      <div v-if="details.length" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <ul class="space-y-1 text-sm text-slate-600">
          <li v-for="detail in details" :key="detail">{{ detail }}</li>
        </ul>
      </div>

      <div class="mt-6 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          @click="$emit('update:modelValue', false)"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :disabled="loading"
          :class="['flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60', toneStyles.button]"
          @click="$emit('confirm')"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <span class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Processando...
          </span>
          <span v-else>{{ confirmLabel }}</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  tone: { type: String, default: 'danger' },
  loading: { type: Boolean, default: false },
  details: { type: Array, default: () => [] }
})

defineEmits(['update:modelValue', 'confirm'])

const toneStyles = computed(() => {
  if (props.tone === 'warning') {
    return {
      iconWrap: 'bg-amber-50',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-500'
    }
  }

  return {
    iconWrap: 'bg-red-50',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-500'
  }
})
</script>
