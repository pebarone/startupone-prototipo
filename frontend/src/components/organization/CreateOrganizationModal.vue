<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Criar Organização" max-width="md" @close="$emit('update:modelValue', false)">
    <!-- Step 1: Name -->
    <div v-if="step === 1">
      <p class="text-slate-400 text-sm mb-6">
        Sua organização representa seu negócio na plataforma FastLock. Você será o proprietário e poderá convidar membros da equipe.
      </p>
      <div class="space-y-4">
        <div>
          <label for="org-name" class="block text-sm font-medium text-slate-300 mb-2">Nome da Organização *</label>
          <input
            id="org-name"
            v-model="form.name"
            type="text"
            placeholder="Ex: Shopping Paulista"
            maxlength="80"
            class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
            @keyup.enter="nextStep"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Slug (URL amigável)</label>
          <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span class="text-slate-500 text-sm">fastlock.app/</span>
            <span class="text-white text-sm font-mono">{{ generatedSlug || '...' }}</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Gerado automaticamente. Pode ser personalizado após a criação.</p>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-sm">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Step 2: Confirming -->
    <div v-else-if="step === 2" class="text-center py-4">
      <div class="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/40 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white mb-1">{{ form.name }}</h3>
      <p class="text-slate-400 text-sm mb-6">Confirme a criação da sua organização</p>
      <div class="bg-slate-800/60 rounded-xl p-4 text-left space-y-2 mb-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Nome</span>
          <span class="text-white font-medium">{{ form.name }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Slug</span>
          <span class="text-white font-mono text-xs">{{ generatedSlug }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Seu papel</span>
          <span class="text-brand-400 font-semibold">Proprietário</span>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        v-if="step === 1"
        @click="$emit('update:modelValue', false)"
        class="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        Cancelar
      </button>
      <button
        v-if="step === 2"
        @click="step = 1"
        :disabled="isCreating"
        class="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
      >
        Voltar
      </button>
      <button
        v-if="step === 1"
        id="btn-org-next"
        @click="nextStep"
        :disabled="!form.name.trim()"
        class="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar →
      </button>
      <button
        v-if="step === 2"
        id="btn-org-create"
        @click="createOrganization"
        :disabled="isCreating"
        class="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <BaseSpinner v-if="isCreating" size="xs" color="white" />
        {{ isCreating ? 'Criando...' : 'Criar Organização' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue', 'created'])

const { fetchMe } = useAuth()

const step = ref(1)
const isCreating = ref(false)
const errorMsg = ref('')
const form = ref({ name: '' })

const generatedSlug = computed(() => {
  return form.value.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || ''
})

// Reset when closed
watch(() => props.modelValue, (val) => {
  if (!val) {
    step.value = 1
    form.value.name = ''
    errorMsg.value = ''
  }
})

function nextStep() {
  if (!form.value.name.trim()) return
  errorMsg.value = ''
  step.value = 2
}

async function createOrganization() {
  isCreating.value = true
  errorMsg.value = ''
  try {
    const result = await api.post('/organizations', {
      name: form.value.name.trim()
    })
    await fetchMe()
    emit('created', result.id)
    emit('update:modelValue', false)
  } catch (err) {
    step.value = 1
    const msg = err.response?.data?.message || err.message
    errorMsg.value = msg?.includes('slug') ? 'Já existe uma organização com este nome.' : 'Erro ao criar organização. Tente novamente.'
    console.error('[CreateOrganizationModal]', err)
  } finally {
    isCreating.value = false
  }
}
</script>
