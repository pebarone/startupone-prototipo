<template>
  <PartnerLayout :org-id="orgId" page-title="Lockers">

    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="w-7 h-7 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-white tracking-tight">Lockers</h1>
          <p class="text-slate-500 text-sm mt-0.5">{{ lockers.length }} cadastrado{{ lockers.length !== 1 ? 's' : '' }}</p>
        </div>
        <div v-if="canAdmin" class="flex gap-2">
          <button
            id="btn-bulk-lockers"
            @click="openBulkModal"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.97]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            Adicionar vários
          </button>
          <button
            id="btn-new-locker"
            @click="openSingleModal"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 shadow-sm shadow-brand-600/20 transition-all duration-150 active:scale-[0.97]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Novo locker
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit mb-6">
        <button
          v-for="f in filters"
          :key="f.value"
          @click="activeFilter = f.value"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
            activeFilter === f.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          {{ f.label }}
          <span :class="['ml-1 tabular-nums', activeFilter === f.value ? 'text-slate-300' : 'text-slate-600']">
            {{ f.value === 'all' ? lockers.length : lockers.filter(l => l.status === f.value).length }}
          </span>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="filteredLockers.length === 0 && activeFilter === 'all'" class="rounded-2xl border border-slate-100 border-dashed p-12 text-center bg-white">
        <div class="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <p class="text-slate-800 font-semibold mb-1">Nenhum locker cadastrado</p>
        <p class="text-slate-500 text-sm mb-5">Adicione seu primeiro locker para começar</p>
        <button
          @click="openSingleModal"
          class="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors active:scale-[0.97]"
        >
          Adicionar locker
        </button>
      </div>

      <div v-else-if="filteredLockers.length === 0" class="rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm bg-white">
        Nenhum locker com este status.
      </div>

      <!-- Lockers grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div
          v-for="locker in filteredLockers"
          :key="locker.id"
          class="group bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200"
          :class="statusBorder(locker.status)"
        >
          <!-- Status indicator strip -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-slate-500 font-medium">Size {{ locker.size }}</span>
            <span
              class="w-2 h-2 rounded-full flex-shrink-0"
              :style="{ backgroundColor: statusColor(locker.status) }"
            />
          </div>

          <p class="text-lg font-black text-slate-900 font-mono tracking-tight mb-3 leading-none">{{ locker.code }}</p>

          <p class="text-xs font-semibold mb-4" :style="{ color: statusColor(locker.status) }">
            {{ statusLabel(locker.status) }}
          </p>

          <!-- Actions (admin only) -->
          <div v-if="canAdmin" class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              v-if="locker.status !== 'free'"
              @click="patchStatus(locker.id, 'free')"
              :disabled="updatingId === locker.id"
              class="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors active:scale-[0.97] disabled:opacity-40"
            >
              Liberar
            </button>
            <button
              v-if="locker.status !== 'maintenance'"
              @click="patchStatus(locker.id, 'maintenance')"
              :disabled="updatingId === locker.id"
              class="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors active:scale-[0.97] disabled:opacity-40"
            >
              Manutenção
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Single locker modal ─── -->
    <BaseModal :model-value="showSingleModal" @update:model-value="showSingleModal = $event" title="Novo Locker" max-width="sm">
      <div class="space-y-4">
        <div>
          <label for="locker-code" class="block text-sm font-medium text-slate-700 mb-1.5">Código *</label>
          <input
            id="locker-code"
            v-model="singleForm.code"
            type="text"
            placeholder="Ex: LCK-007"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all text-sm font-mono uppercase"
            @input="singleForm.code = singleForm.code.toUpperCase()"
          />
          <p class="text-xs text-slate-400 mt-1">Apenas letras maiúsculas, números e hífens (ex: LCK-001)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Tamanho *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="sz in sizes"
              :key="sz.v"
              @click="singleForm.size = sz.v"
              :class="[
                'py-3 rounded-xl text-sm font-bold border transition-all duration-150 active:scale-[0.97]',
                singleForm.size === sz.v
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-white'
              ]"
            >
              <div class="text-base">{{ sz.v }}</div>
              <div class="text-xs font-normal opacity-60 mt-0.5">{{ sz.label }}</div>
            </button>
          </div>
        </div>
        <div v-if="singleError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ singleError }}
        </div>
      </div>
      <template #footer>
        <button @click="showSingleModal = false" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        <button
          id="btn-save-locker"
          @click="createSingle"
          :disabled="!singleForm.code.trim() || !singleForm.size || isCreatingSingle"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40 active:scale-95"
        >
          <div v-if="isCreatingSingle" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isCreatingSingle ? 'Criando…' : 'Criar Locker' }}
        </button>
      </template>
    </BaseModal>

    <!-- ─── Bulk locker modal ─── -->
    <BaseModal :model-value="showBulkModal" @update:model-value="showBulkModal = $event" title="Adicionar Vários Lockers" max-width="lg">
      <div class="space-y-5">
        <p class="text-sm text-slate-400">Configure o padrão de código e o tamanho, depois informe quantos lockers deseja criar de uma vez.</p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Prefixo dos Códigos *</label>
            <input
              v-model="bulkForm.prefix"
              type="text"
              placeholder="Ex: LCK"
              class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 text-sm font-mono uppercase"
              @input="bulkForm.prefix = bulkForm.prefix.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
            <p class="text-xs text-slate-500 mt-1">Só letras e números</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Número inicial</label>
            <input
              v-model.number="bulkForm.startAt"
              type="number"
              min="1"
              max="999"
              placeholder="1"
              class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Quantidade *</label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="bulkForm.count"
              type="range"
              min="1"
              max="50"
              class="flex-1 accent-brand-500"
            />
            <span class="w-16 text-center text-white font-black text-xl tabular-nums">{{ bulkForm.count }}</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Máximo 50 lockers por vez</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Tamanho *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="sz in sizes"
              :key="sz.v"
              @click="bulkForm.size = sz.v"
              :class="[
                'py-2.5 rounded-lg text-sm font-bold border transition-all duration-150 active:scale-95',
                bulkForm.size === sz.v
                  ? 'border-brand-500 bg-brand-600/15 text-brand-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              ]"
            >{{ sz.v }} · {{ sz.label }}</button>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="bulkPreview.length" class="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <p class="text-xs text-slate-500 mb-2 font-medium">Pré-visualização dos códigos:</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="code in bulkPreview.slice(0, 20)"
              :key="code"
              class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono"
            >{{ code }}</span>
            <span v-if="bulkPreview.length > 20" class="text-xs text-slate-500 self-center">
              +{{ bulkPreview.length - 20 }} mais
            </span>
          </div>
        </div>

        <!-- Progress -->
        <div v-if="bulkProgress.total > 0" class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-slate-300 font-medium">Criando lockers…</span>
            <span class="text-brand-400 font-bold tabular-nums">{{ bulkProgress.done }}/{{ bulkProgress.total }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              class="h-full rounded-full bg-brand-500"
              :style="{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%`, transition: 'width 0.3s ease-out' }"
            />
          </div>
          <p v-if="bulkProgress.errors.length" class="text-xs text-red-400 mt-2">
            {{ bulkProgress.errors.length }} erro{{ bulkProgress.errors.length > 1 ? 's' : '' }}: {{ bulkProgress.errors.slice(0, 2).join(', ') }}
          </p>
        </div>

        <div v-if="bulkError" class="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-400 text-sm">
          {{ bulkError }}
        </div>
      </div>

      <template #footer>
        <button @click="showBulkModal = false" :disabled="isCreatingBulk" class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-40">Cancelar</button>
        <button
          id="btn-create-bulk"
          @click="createBulk"
          :disabled="!bulkForm.prefix || !bulkForm.size || isCreatingBulk"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40 active:scale-95"
        >
          <div v-if="isCreatingBulk" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isCreatingBulk ? `Criando ${bulkProgress.done}/${bulkProgress.total}…` : `Criar ${bulkForm.count} Locker${bulkForm.count > 1 ? 's' : ''}` }}
        </button>
      </template>
    </BaseModal>

  </PartnerLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/composables/useApi'
import { useOrganization } from '@/composables/useOrganization'
import { useToast } from '@/composables/useToast'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const route = useRoute()
const orgId = route.params.orgId
const { canAdmin, fetchOrganization, setCurrentOrganization } = useOrganization()
const { success, error: toastError } = useToast()

/** @type {import('vue').Ref<any[]>} */
const lockers = ref([])
const isLoading = ref(true)
const updatingId = ref(null)
const activeFilter = ref('all')

// Single modal state
const showSingleModal = ref(false)
const isCreatingSingle = ref(false)
const singleError = ref('')
const singleForm = ref({ code: '', size: '' })

// Bulk modal state
const showBulkModal = ref(false)
const isCreatingBulk = ref(false)
const bulkError = ref('')
const bulkForm = ref({ prefix: 'LCK', startAt: 1, count: 5, size: '' })
const bulkProgress = ref({ total: 0, done: 0, errors: [] })

const sizes = [
  { v: 'P', label: 'Pequeno' },
  { v: 'M', label: 'Médio' },
  { v: 'G', label: 'Grande' }
]

const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Livres', value: 'free' },
  { label: 'Ocupados', value: 'occupied' },
  { label: 'Manutenção', value: 'maintenance' }
]

const filteredLockers = computed(() =>
  activeFilter.value === 'all'
    ? lockers.value
    : lockers.value.filter(l => l.status === activeFilter.value)
)

/** Preview codes for bulk creation */
const bulkPreview = computed(() => {
  if (!bulkForm.value.prefix || !bulkForm.value.count) return []
  const start = bulkForm.value.startAt || 1
  return Array.from({ length: bulkForm.value.count }, (_, i) =>
    `${bulkForm.value.prefix}-${String(start + i).padStart(3, '0')}`
  )
})

async function fetchLockers() {
  isLoading.value = true
  try {
    const res = await api.get(`/organizations/${orgId}/lockers`)
    lockers.value = res.data || []
  } catch (err) {
    toastError('Falha ao carregar lockers.')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function openSingleModal() {
  singleForm.value = { code: '', size: '' }
  singleError.value = ''
  showSingleModal.value = true
}

function openBulkModal() {
  bulkForm.value = { prefix: 'LCK', startAt: lockers.value.length + 1, count: 5, size: '' }
  bulkProgress.value = { total: 0, done: 0, errors: [] }
  bulkError.value = ''
  showBulkModal.value = true
}

async function createSingle() {
  isCreatingSingle.value = true
  singleError.value = ''
  try {
    const created = await api.post(`/organizations/${orgId}/lockers`, {
      code: singleForm.value.code.trim(),
      size: singleForm.value.size
    })
    lockers.value.push(created)
    showSingleModal.value = false
    success(`Locker ${created.code} criado!`)
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    singleError.value = msg?.includes('unique') ? `Código "${singleForm.value.code}" já existe.` : 'Erro ao criar locker.'
  } finally {
    isCreatingSingle.value = false
  }
}

async function createBulk() {
  if (!bulkForm.value.prefix || !bulkForm.value.size || !bulkForm.value.count) return
  const codes = bulkPreview.value
  isCreatingBulk.value = true
  bulkProgress.value = { total: codes.length, done: 0, errors: [] }
  bulkError.value = ''

  const results = []
  for (const code of codes) {
    try {
      const created = await api.post(`/organizations/${orgId}/lockers`, {
        code,
        size: bulkForm.value.size
      })
      results.push(created)
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      bulkProgress.value.errors.push(code + ': ' + (msg?.includes('unique') ? 'já existe' : 'erro'))
    }
    bulkProgress.value.done++
  }

  lockers.value.push(...results)
  isCreatingBulk.value = false

  if (results.length > 0) {
    success(`${results.length} locker${results.length > 1 ? 's' : ''} criado${results.length > 1 ? 's' : ''}!`)
  }
  if (bulkProgress.value.errors.length === 0) {
    showBulkModal.value = false
  }
}

/** @param {string} lockerId @param {string} status */
async function patchStatus(lockerId, status) {
  updatingId.value = lockerId
  try {
    const updated = await api.patch(`/organizations/${orgId}/lockers/${lockerId}`, { status })
    const idx = lockers.value.findIndex(l => l.id === lockerId)
    if (idx !== -1) lockers.value[idx] = updated
    success('Status atualizado!')
  } catch (err) {
    toastError('Falha ao atualizar locker.')
    console.error(err)
  } finally {
    updatingId.value = null
  }
}

/** @param {string} status */
function statusColor(status) {
  return { free: '#10b981', occupied: '#f59e0b', maintenance: '#ef4444' }[status] || '#64748b'
}

/** @param {string} status */
function statusLabel(status) {
  return { free: 'Livre', occupied: 'Ocupado', maintenance: 'Manutenção' }[status] || status
}

/** @param {string} status */
function statusBorder(status) {
  return { free: 'border-emerald-100', occupied: 'border-amber-100', maintenance: 'border-red-100' }[status] || 'border-slate-100'
}

onMounted(async () => {
  const org = await fetchOrganization(orgId)
  if (org) setCurrentOrganization(org)
  await fetchLockers()
})
</script>
