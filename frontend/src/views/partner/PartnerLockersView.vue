<template>
  <PartnerLayout :org-id="orgId" page-title="Lockers">
    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="h-7 w-7 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
        <p class="text-sm text-slate-400">Carregando lockers...</p>
      </div>
    </div>

    <template v-else>
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Operação</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Lockers da organização</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Cadastre, organize e atribua cada locker a uma localização para aparecer corretamente no mapa público.
          </p>
        </div>

        <div v-if="canAdmin" class="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-[border-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
            @click="openBulkModal"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Adicionar vários
          </button>

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md active:scale-[0.98]"
            @click="openCreateModal"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo locker
          </button>
        </div>
      </div>

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ lockers.length }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Com localização</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ assignedLockersCount }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sem localização</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ unassignedLockersCount }}</p>
        </div>
      </div>

      <div class="mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
          :class="activeFilter === filter.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <span class="ml-1 text-xs text-slate-400">{{ filterCount(filter.value) }}</span>
        </button>
      </div>

      <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <label for="location-filter" class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Filtrar por localização
        </label>
        <select
          id="location-filter"
          v-model="activeLocationFilter"
          class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
        >
          <option value="all">Todas ({{ locationFilterCount('all') }})</option>
          <option value="unassigned">Sem localização ({{ locationFilterCount('unassigned') }})</option>
          <option v-for="location in locations" :key="location.id" :value="location.id">
            {{ location.name }} ({{ locationFilterCount(location.id) }})
          </option>
        </select>
      </div>

      <div
        v-if="!filteredLockers.length && activeFilter === 'all' && activeLocationFilter === 'all'"
        class="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-5 text-xl font-black tracking-tight text-slate-900">Nenhum locker cadastrado.</h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Crie o primeiro locker e vincule-o a uma localização para aparecer no mapa público.
        </p>
        <button
          v-if="canAdmin"
          type="button"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md active:scale-[0.98]"
          @click="openCreateModal"
        >
          Criar primeiro locker
        </button>
      </div>

      <div v-else-if="!filteredLockers.length" class="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Nenhum locker encontrado com os filtros selecionados.
      </div>

      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="locker in filteredLockers"
          :key="locker.id"
          class="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
          <!-- Visual Grid Item -->
          <div class="mb-4">
             <LockerItem :locker="locker" :interactive="false" />
          </div>

          <!-- Location Info -->
          <div class="mb-4 flex items-center justify-between">
             <span class="text-xs font-semibold text-slate-500">Local:</span>
             <span
              class="inline-flex max-w-[120px] truncate rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              :class="locker.location_id ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-500'"
              :title="locationLabel(locker.location_id)"
            >
              {{ locationLabel(locker.location_id) }}
            </span>
          </div>

          <!-- Actions -->
          <div v-if="canAdmin" class="mt-auto grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 active:scale-[0.98]"
              :disabled="deletingId === locker.id"
              @click="openEditModal(locker)"
            >
              Editar
            </button>

            <button
              v-if="locker.status !== 'free'"
              type="button"
              class="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-[0.98]"
              :disabled="updatingId === locker.id || deletingId === locker.id"
              @click="patchStatus(locker.id, 'free')"
            >
              Liberar
            </button>

            <button
              v-if="locker.status !== 'maintenance'"
              type="button"
              class="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 active:scale-[0.98]"
              :disabled="updatingId === locker.id || deletingId === locker.id"
              @click="patchStatus(locker.id, 'maintenance')"
            >
              Manutenção
            </button>

            <button
              type="button"
              class="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]"
              :disabled="deletingId === locker.id || updatingId === locker.id"
              @click="removeLocker(locker)"
            >
              {{ deletingId === locker.id ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <BaseModal
      :model-value="showLockerModal"
      :title="editingLockerId ? 'Editar locker' : 'Novo locker'"
      max-width="lg"
      @update:model-value="showLockerModal = $event"
      @close="resetLockerForm"
    >
      <div class="space-y-5">
        <div>
          <label for="locker-code" class="mb-1.5 block text-sm font-medium text-slate-700">Código *</label>
          <input
            id="locker-code"
            v-model="lockerForm.code"
            type="text"
            placeholder="Ex: LCK-007"
            class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @input="lockerForm.code = lockerForm.code.toUpperCase()"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Tamanho *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="size in sizes"
              :key="size.value"
              type="button"
              class="rounded-lg border px-3 py-3 text-sm font-bold transition-colors"
              :class="lockerForm.size === size.value ? 'border-brand-500 bg-brand-600/15 text-brand-300' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'"
              @click="lockerForm.size = size.value"
            >
              <span class="block text-base">{{ size.value }}</span>
              <span class="mt-1 block text-xs font-medium opacity-70">{{ size.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label for="locker-location" class="mb-1.5 block text-sm font-medium text-slate-700">Localização</label>
          <select
            id="locker-location"
            v-model="lockerForm.location_id"
            class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Sem localização</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
          <p class="mt-1 text-xs text-slate-500">
            O locker só aparece no mapa público quando estiver vinculado a um ponto.
          </p>
        </div>

        <div v-if="lockerError" class="rounded-lg border border-red-800 bg-red-950/60 px-3.5 py-3 text-sm text-red-300">
          {{ lockerError }}
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          @click="showLockerModal = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isSavingLocker || !lockerForm.code.trim() || !lockerForm.size"
          @click="saveLocker"
        >
          <span v-if="isSavingLocker" class="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isSavingLocker ? 'Salvando...' : editingLockerId ? 'Salvar locker' : 'Criar locker' }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :model-value="showBulkModal"
      title="Adicionar varios lockers"
      max-width="lg"
      @update:model-value="showBulkModal = $event"
      @close="resetBulkForm"
    >
      <div class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="bulk-prefix" class="mb-1.5 block text-sm font-medium text-slate-700">Prefixo *</label>
            <input
              id="bulk-prefix"
              v-model="bulkForm.prefix"
              type="text"
              placeholder="Ex: LCK"
              class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              @input="bulkForm.prefix = bulkForm.prefix.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
          </div>

          <div>
            <label for="bulk-start" class="mb-1.5 block text-sm font-medium text-slate-700">Número inicial</label>
            <input
              id="bulk-start"
              v-model.number="bulkForm.startAt"
              type="number"
              min="1"
              max="999"
              class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Quantidade *</label>
          <div class="flex items-center gap-3">
            <input v-model.number="bulkForm.count" type="range" min="1" max="50" class="flex-1 accent-brand-500" />
            <span class="w-16 text-center text-xl font-black text-white">{{ bulkForm.count }}</span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Tamanho *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="size in sizes"
                :key="size.value"
                type="button"
                class="rounded-lg border px-3 py-3 text-sm font-bold transition-colors"
                :class="bulkForm.size === size.value ? 'border-brand-500 bg-brand-600/15 text-brand-300' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'"
                @click="bulkForm.size = size.value"
              >
                {{ size.value }}
              </button>
            </div>
          </div>

          <div>
            <label for="bulk-location" class="mb-1.5 block text-sm font-medium text-slate-700">Localização</label>
            <select
              id="bulk-location"
              v-model="bulkForm.location_id"
              class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Sem localização</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="bulkPreview.length" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pré-visualização</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="code in bulkPreview.slice(0, 20)"
              :key="code"
              class="rounded-md bg-slate-900 px-2 py-1 text-xs font-mono text-slate-300"
            >
              {{ code }}
            </span>
            <span v-if="bulkPreview.length > 20" class="self-center text-xs text-slate-500">
              +{{ bulkPreview.length - 20 }} mais
            </span>
          </div>
        </div>

        <div v-if="bulkProgress.total > 0" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="font-medium text-slate-700">Criando lockers...</span>
            <span class="font-bold text-brand-400">{{ bulkProgress.done }}/{{ bulkProgress.total }}</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div
              class="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out"
              :style="{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }"
            />
          </div>
          <p v-if="bulkProgress.errors.length" class="mt-2 text-xs text-red-300">
            {{ bulkProgress.errors.slice(0, 2).join(' | ') }}
          </p>
        </div>

        <div v-if="bulkError" class="rounded-lg border border-red-800 bg-red-950/60 px-3.5 py-3 text-sm text-red-300">
          {{ bulkError }}
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          @click="showBulkModal = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isCreatingBulk || !bulkForm.prefix || !bulkForm.size"
          @click="createBulk"
        >
          <span v-if="isCreatingBulk" class="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isCreatingBulk ? `Criando ${bulkProgress.done}/${bulkProgress.total}...` : `Criar ${bulkForm.count} lockers` }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showDeleteModal"
      title="Excluir locker?"
      :description="deleteDescription"
      confirm-label="Excluir locker"
      :loading="!!deletingId"
      :details="deleteDetails"
      @confirm="confirmLockerDelete"
    />
  </PartnerLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'
import { api } from '@/composables/useApi'
import { useOrganization } from '@/composables/useOrganization'
import { useToast } from '@/composables/useToast'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const orgId = route.params.orgId
const { canAdmin, fetchOrganization, setCurrentOrganization } = useOrganization()
const { success, error: toastError } = useToast()

/** @type {import('vue').Ref<any[]>} */
const lockers = ref([])
/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const isLoading = ref(true)
const updatingId = ref('')
const deletingId = ref('')
const showDeleteModal = ref(false)
const lockerPendingDelete = ref(null)
const activeFilter = ref('all')
const activeLocationFilter = ref('all')

const showLockerModal = ref(false)
const editingLockerId = ref('')
const isSavingLocker = ref(false)
const lockerError = ref('')
const lockerForm = ref({
  code: '',
  size: '',
  location_id: ''
})

const showBulkModal = ref(false)
const isCreatingBulk = ref(false)
const bulkError = ref('')
const bulkForm = ref({
  prefix: 'LCK',
  startAt: 1,
  count: 5,
  size: '',
  location_id: ''
})
const bulkProgress = ref({
  total: 0,
  done: 0,
  errors: []
})

const sizes = [
  { value: 'P', label: 'Pequeno' },
  { value: 'M', label: 'Médio' },
  { value: 'G', label: 'Grande' }
]

const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Livres', value: 'free' },
  { label: 'Ocupados', value: 'occupied' },
  { label: 'Manutenção', value: 'maintenance' }
]

const LOCKERS_FETCH_LIMIT = 100

const filteredLockers = computed(() => {
  const byStatus = activeFilter.value === 'all'
    ? lockers.value
    : lockers.value.filter((locker) => locker.status === activeFilter.value)

  if (activeLocationFilter.value === 'all') {
    return byStatus
  }

  if (activeLocationFilter.value === 'unassigned') {
    return byStatus.filter((locker) => !locker.location_id)
  }

  return byStatus.filter((locker) => locker.location_id === activeLocationFilter.value)
})

const assignedLockersCount = computed(() =>
  lockers.value.filter((locker) => !!locker.location_id).length
)

const unassignedLockersCount = computed(() =>
  lockers.value.filter((locker) => !locker.location_id).length
)

const bulkPreview = computed(() => {
  if (!bulkForm.value.prefix || !bulkForm.value.count) {
    return []
  }

  const start = bulkForm.value.startAt || 1
  return Array.from({ length: bulkForm.value.count }, (_, index) =>
    `${bulkForm.value.prefix}-${String(start + index).padStart(3, '0')}`
  )
})

const deleteDescription = computed(() => {
  if (!lockerPendingDelete.value) {
    return 'Esta acao remove o locker de forma permanente.'
  }

  return `O locker ${lockerPendingDelete.value.code} sera removido de forma permanente.`
})

const deleteDetails = computed(() => {
  if (!lockerPendingDelete.value) {
    return []
  }

  return [
    `Locker ${lockerPendingDelete.value.code}`,
    `Status atual: ${statusLabel(lockerPendingDelete.value.status)}`,
    `Localizacao: ${locationLabel(lockerPendingDelete.value.location_id)}`
  ]
})

onMounted(async () => {
  isLoading.value = true

  try {
    const org = await fetchOrganization(orgId)

    if (org) {
      setCurrentOrganization(org)
    }

    await Promise.all([fetchLocations(), fetchLockers()])
  } catch (error) {
    toastError('Nao foi possivel carregar os dados de lockers.')
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

async function fetchLockers() {
  const response = await api.get(`/organizations/${orgId}/lockers?limit=${LOCKERS_FETCH_LIMIT}`)
  lockers.value = Array.isArray(response) ? response : (response?.data || [])
}

async function fetchLocations() {
  const response = await api.get(`/organizations/${orgId}/locations?limit=200`)
  locations.value = Array.isArray(response) ? response : (response?.data || [])
}

function openCreateModal() {
  editingLockerId.value = ''
  lockerForm.value = {
    code: '',
    size: '',
    location_id: ''
  }
  lockerError.value = ''
  showLockerModal.value = true
}

/** @param {any} locker */
function openEditModal(locker) {
  editingLockerId.value = locker.id
  lockerForm.value = {
    code: locker.code,
    size: locker.size,
    location_id: locker.location_id || ''
  }
  lockerError.value = ''
  showLockerModal.value = true
}

function resetLockerForm() {
  if (!showLockerModal.value) {
    editingLockerId.value = ''
  }

  lockerForm.value = {
    code: '',
    size: '',
    location_id: ''
  }
  lockerError.value = ''
}

function openBulkModal() {
  bulkForm.value = {
    prefix: 'LCK',
    startAt: lockers.value.length + 1,
    count: 5,
    size: '',
    location_id: ''
  }
  bulkProgress.value = { total: 0, done: 0, errors: [] }
  bulkError.value = ''
  showBulkModal.value = true
}

function resetBulkForm() {
  bulkProgress.value = { total: 0, done: 0, errors: [] }
  bulkError.value = ''
}

async function saveLocker() {
  isSavingLocker.value = true
  lockerError.value = ''

  const payload = {
    code: lockerForm.value.code.trim(),
    size: lockerForm.value.size,
    location_id: lockerForm.value.location_id || null
  }

  try {
    if (editingLockerId.value) {
      const updatedLocker = await api.patch(`/organizations/${orgId}/lockers/${editingLockerId.value}`, payload)
      const targetIndex = lockers.value.findIndex((locker) => locker.id === updatedLocker.id)

      if (targetIndex !== -1) {
        lockers.value[targetIndex] = updatedLocker
      }

      success('Locker atualizado.')
    } else {
      const createdLocker = await api.post(`/organizations/${orgId}/lockers`, payload)
      lockers.value.push(createdLocker)
      success(`Locker ${createdLocker.code} criado.`)
    }

    showLockerModal.value = false
    resetLockerForm()
  } catch (error) {
    lockerError.value = getApiErrorMessage(error, 'Nao foi possivel salvar o locker.')
  } finally {
    isSavingLocker.value = false
  }
}

async function createBulk() {
  if (!bulkForm.value.prefix || !bulkForm.value.size) {
    return
  }

  isCreatingBulk.value = true
  bulkError.value = ''
  bulkProgress.value = {
    total: bulkPreview.value.length,
    done: 0,
    errors: []
  }

  /** @type {any[]} */
  const createdLockers = []

  for (const code of bulkPreview.value) {
    try {
      const createdLocker = await api.post(`/organizations/${orgId}/lockers`, {
        code,
        size: bulkForm.value.size,
        location_id: bulkForm.value.location_id || null
      })

      createdLockers.push(createdLocker)
    } catch (error) {
      bulkProgress.value.errors.push(
        `${code}: ${getApiErrorMessage(error, 'erro ao criar')}`
      )
    } finally {
      bulkProgress.value.done += 1
    }
  }

  lockers.value.push(...createdLockers)

  if (!bulkProgress.value.errors.length) {
    showBulkModal.value = false
  }

  if (createdLockers.length) {
    success(`${createdLockers.length} locker${createdLockers.length > 1 ? 's' : ''} criado${createdLockers.length > 1 ? 's' : ''}.`)
  }

  if (!createdLockers.length) {
    bulkError.value = 'Nenhum locker foi criado. Revise o prefixo e os códigos.'
  }

  isCreatingBulk.value = false
}

/**
 * @param {string} lockerId
 * @param {string} status
 */
async function patchStatus(lockerId, status) {
  updatingId.value = lockerId

  try {
    const updatedLocker = await api.patch(`/organizations/${orgId}/lockers/${lockerId}`, { status })
    const targetIndex = lockers.value.findIndex((locker) => locker.id === lockerId)

    if (targetIndex !== -1) {
      lockers.value[targetIndex] = updatedLocker
    }

    success('Status atualizado.')
  } catch (error) {
    toastError(getApiErrorMessage(error, 'Falha ao atualizar o locker.'))
    console.error(error)
  } finally {
    updatingId.value = ''
  }
}

/**
 * @param {any} locker
 */
async function removeLocker(locker) {
  lockerPendingDelete.value = locker
  showDeleteModal.value = true
}

async function confirmLockerDelete() {
  if (!lockerPendingDelete.value) {
    return
  }

  deletingId.value = lockerPendingDelete.value.id

  try {
    await api.delete(`/organizations/${orgId}/lockers/${lockerPendingDelete.value.id}`)
    lockers.value = lockers.value.filter((item) => item.id !== lockerPendingDelete.value.id)
    success(`Locker ${lockerPendingDelete.value.code} excluido.`)
    showDeleteModal.value = false
    lockerPendingDelete.value = null
  } catch (error) {
    toastError(getApiErrorMessage(error, 'Nao foi possivel excluir o locker.'))
  } finally {
    deletingId.value = ''
  }
}

/**
 * @param {'all'|'free'|'occupied'|'maintenance'} filterValue
 * @returns {number}
 */
function filterCount(filterValue) {
  if (filterValue === 'all') {
    return lockers.value.length
  }

  return lockers.value.filter((locker) => locker.status === filterValue).length
}

/**
 * @param {string} filterValue
 * @returns {number}
 */
function locationFilterCount(filterValue) {
  if (filterValue === 'all') {
    return lockers.value.length
  }

  if (filterValue === 'unassigned') {
    return lockers.value.filter((locker) => !locker.location_id).length
  }

  return lockers.value.filter((locker) => locker.location_id === filterValue).length
}

/**
 * @param {string|null} locationId
 * @returns {string}
 */
function locationLabel(locationId) {
  if (!locationId) {
    return 'Sem localização'
  }

  return locations.value.find((location) => location.id === locationId)?.name || 'Localização'
}

/**
 * @param {string} status
 * @returns {string}
 */
function statusColor(status) {
  return {
    free: '#16a34a',
    occupied: '#d97706',
    maintenance: '#dc2626'
  }[status] || '#64748b'
}

/**
 * @param {string} status
 * @returns {string}
 */
function statusLabel(status) {
  return {
    free: 'Livre',
    occupied: 'Ocupado',
    maintenance: 'Manutenção'
  }[status] || status
}

/**
 * @param {string} status
 * @returns {string}
 */
function statusBorder(status) {
  return {
    free: 'border-emerald-200',
    occupied: 'border-amber-200',
    maintenance: 'border-red-200'
  }[status] || 'border-slate-200'
}
</script>
