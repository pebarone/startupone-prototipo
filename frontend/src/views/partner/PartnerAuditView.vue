<template>
  <PartnerLayout :org-id="orgId" page-title="Auditoria">
    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="h-7 w-7 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
        <p class="text-sm text-slate-400">Carregando historico...</p>
      </div>
    </div>

    <template v-else>
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Historico</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Auditoria de alugueis</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consulte o historico da organizacao, filtre por localizacao, limpe registros encerrados e execute liberacao operacional quando um aluguel travar.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="deletableFilteredIds.length"
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            @click="toggleSelectAllFiltered"
          >
            {{ allFilteredSelected ? 'Limpar selecao' : 'Selecionar encerrados' }}
          </button>

          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!selectedRentalIds.length"
            @click="requestBulkDelete"
          >
            Excluir selecionados
            <span class="rounded-full bg-white/15 px-2 py-0.5 text-xs">{{ selectedRentalIds.length }}</span>
          </button>

          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
            @click="fetchHistory"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div class="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end">
        <div class="flex-1">
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Filtrar por localizacao
          </label>
          <select
            v-model="selectedLocationId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            @change="page = 1; clearSelection(); fetchHistory()"
          >
            <option value="">Todas as localizacoes</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>

        <div class="flex flex-wrap gap-2">
          <div class="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              :class="statusFilter === filter.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              @click="statusFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loadWarning" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {{ loadWarning }}
      </div>

      <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="item in stats" :key="item.label" class="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{{ item.label }}</p>
          <p class="mt-1.5 text-2xl font-black tracking-tight" :class="item.color || 'text-slate-900'">{{ item.value }}</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <label class="flex items-center justify-center">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              :checked="allPageSelected"
              :indeterminate.prop="pageHasPartialSelection"
              :disabled="!pagedDeletableIds.length"
              @change="toggleSelectPage"
            />
          </label>
          <span>Locker / Localizacao</span>
          <span class="hidden sm:block">Status</span>
          <span class="hidden md:block">Inicio</span>
          <span>Total</span>
          <span></span>
        </div>

        <div v-if="!filteredRentals.length" class="flex flex-col items-center gap-3 py-16 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-600">Nenhum aluguel encontrado</p>
          <p class="text-xs text-slate-400">Ajuste os filtros ou troque a localizacao.</p>
        </div>

        <div v-else>
          <div
            v-for="(rental, index) in pagedRentals"
            :key="rental.id"
            :class="[
              'grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3.5 transition-colors',
              index < pagedRentals.length - 1 ? 'border-b border-slate-100' : '',
              selectedRentalIds.includes(rental.id) ? 'bg-brand-50/40' : 'hover:bg-slate-50/70'
            ]"
          >
            <label class="flex items-center justify-center">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                :checked="selectedRentalIds.includes(rental.id)"
                :disabled="!canDelete(rental.status)"
                @change="toggleRentalSelection(rental.id)"
              />
            </label>

            <div class="min-w-0">
              <p class="font-mono text-sm font-black text-slate-900">{{ rental.locker_code }}</p>
              <p class="mt-0.5 truncate text-xs text-slate-400">
                {{ rental.location_name || 'Sem localizacao' }} · {{ sizeLabel(rental.locker_size) }}
              </p>
            </div>

            <span :class="statusPill(rental.status)" class="hidden sm:inline-flex">
              {{ statusText(rental.status) }}
            </span>

            <span class="hidden whitespace-nowrap text-xs text-slate-400 md:block">
              {{ formatDate(rental.started_at) }}
            </span>

            <span class="whitespace-nowrap text-sm font-bold text-slate-900">
              {{ formatCents(rental.total_cents) }}
            </span>

            <div class="flex items-center justify-end gap-2">
              <button
                v-if="canOverride(rental.status)"
                type="button"
                class="inline-flex h-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 transition-colors hover:bg-amber-100"
                :title="`Liberar operacionalmente ${rental.locker_code}`"
                @click="requestOverride(rental)"
              >
                Liberar
              </button>

              <button
                v-if="canDelete(rental.status)"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-300 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                :title="`Excluir aluguel ${rental.locker_code}`"
                @click="requestDelete([rental])"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <span v-if="!canDelete(rental.status) && !canOverride(rental.status)" class="w-8 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                —
              </span>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p class="text-xs text-slate-400">
              {{ (page - 1) * PAGE_SIZE + 1 }}–{{ Math.min(page * PAGE_SIZE, filteredRentals.length) }}
              de {{ filteredRentals.length }}
            </p>

            <div class="flex gap-1.5">
              <button
                type="button"
                :disabled="page === 1"
                class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                @click="page--"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                v-for="pageNumber in pageNumbers"
                :key="pageNumber"
                type="button"
                :class="[
                  'h-7 min-w-[28px] rounded-lg border px-2 text-xs font-semibold transition-colors',
                  pageNumber === page
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                ]"
                @click="page = pageNumber"
              >
                {{ pageNumber }}
              </button>

              <button
                type="button"
                :disabled="page === totalPages"
                class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                @click="page++"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BaseModal v-model="showDeleteModal" max-width="sm">
      <div class="p-6">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 class="mb-2 text-center text-lg font-black text-slate-900">{{ deleteTitle }}</h3>
        <p class="text-center text-sm leading-6 text-slate-500">{{ deleteDescription }}</p>

        <div v-if="deletePreviewLines.length" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <ul class="space-y-1 text-sm text-slate-600">
            <li v-for="line in deletePreviewLines" :key="line">{{ line }}</li>
          </ul>
        </div>

        <div v-if="deleteError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ deleteError }}
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            @click="closeDeleteModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
            @click="confirmDelete"
          >
            <span v-if="isDeleting" class="flex items-center justify-center gap-2">
              <span class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Excluindo...
            </span>
            <span v-else>{{ deleteConfirmLabel }}</span>
          </button>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model="showOverrideModal" max-width="sm">
      <div class="p-6">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 class="text-center text-lg font-black text-slate-900">Liberacao operacional</h3>
        <p class="mt-2 text-center text-sm leading-6 text-slate-500">
          Esta acao cancela o aluguel em andamento, libera o locker e grava a justificativa na auditoria.
        </p>

        <div v-if="overrideTarget" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p class="font-mono font-black text-slate-900">{{ overrideTarget.locker_code }}</p>
          <p class="mt-1">{{ statusText(overrideTarget.status) }} · {{ overrideTarget.location_name || 'Sem localizacao' }}</p>
        </div>

        <label class="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" for="override-reason">
          Motivo obrigatorio
        </label>
        <textarea
          id="override-reason"
          v-model="overrideReason"
          rows="4"
          class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="Ex.: celular perdido, falha de WebAuthn, atendimento presencial confirmado."
        />

        <div v-if="overrideError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ overrideError }}
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            @click="closeOverrideModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="isOverriding"
            class="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-60"
            @click="confirmOverride"
          >
            <span v-if="isOverriding" class="flex items-center justify-center gap-2">
              <span class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Liberando...
            </span>
            <span v-else>Liberar locker</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </PartnerLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { api } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const { success, error: toastError, warning } = useToast()
const orgId = route.params.orgId

/** @type {import('vue').Ref<any[]>} */
const rentals = ref([])
/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const isLoading = ref(true)
const loadWarning = ref('')
const selectedLocationId = ref('')
const statusFilter = ref('all')
const page = ref(1)
const PAGE_SIZE = 20

const selectedRentalIds = ref([])
const showDeleteModal = ref(false)
/** @type {import('vue').Ref<any[]>} */
const deleteTargets = ref([])
const isDeleting = ref(false)
const deleteError = ref('')
const showOverrideModal = ref(false)
/** @type {import('vue').Ref<any>} */
const overrideTarget = ref(null)
const overrideReason = ref('')
const isOverriding = ref(false)
const overrideError = ref('')

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'storing', label: 'Em uso' },
  { value: 'pending_retrieval_payment', label: 'Aguard. pag.' },
  { value: 'active', label: 'Pendentes' },
  { value: 'cancelled', label: 'Cancelados' }
]

const filteredRentals = computed(() => {
  if (statusFilter.value === 'all') {
    return rentals.value
  }

  return rentals.value.filter((rental) => rental.status === statusFilter.value)
})

const totalPages = computed(() => Math.ceil(filteredRentals.value.length / PAGE_SIZE) || 1)

const pagedRentals = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRentals.value.slice(start, start + PAGE_SIZE)
})

const deletableFilteredIds = computed(() =>
  filteredRentals.value.filter((rental) => canDelete(rental.status)).map((rental) => rental.id)
)

const pagedDeletableIds = computed(() =>
  pagedRentals.value.filter((rental) => canDelete(rental.status)).map((rental) => rental.id)
)

const allFilteredSelected = computed(() =>
  deletableFilteredIds.value.length > 0 &&
  deletableFilteredIds.value.every((id) => selectedRentalIds.value.includes(id))
)

const allPageSelected = computed(() =>
  pagedDeletableIds.value.length > 0 &&
  pagedDeletableIds.value.every((id) => selectedRentalIds.value.includes(id))
)

const pageHasPartialSelection = computed(() =>
  pagedDeletableIds.value.some((id) => selectedRentalIds.value.includes(id)) && !allPageSelected.value
)

const pageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const current = page.value
  const pages = new Set([1, total, current, current - 1, current + 1].filter((item) => item >= 1 && item <= total))
  return [...pages].sort((left, right) => left - right)
})

const stats = computed(() => {
  const finished = rentals.value.filter((rental) => rental.status === 'finished').length
  const active = rentals.value.filter((rental) => canOverride(rental.status)).length
  const revenue = rentals.value.reduce((sum, rental) => sum + (rental.status === 'finished' ? rental.total_cents || 0 : 0), 0)

  return [
    { label: 'Total de registros', value: rentals.value.length },
    { label: 'Finalizados', value: finished, color: 'text-emerald-600' },
    { label: 'Em andamento', value: active, color: 'text-amber-600' },
    { label: 'Receita total', value: formatCents(revenue), color: 'text-brand-700' }
  ]
})

const deleteTitle = computed(() =>
  deleteTargets.value.length > 1 ? `Excluir ${deleteTargets.value.length} registros?` : 'Excluir registro?'
)

const deleteDescription = computed(() => {
  if (!deleteTargets.value.length) {
    return 'Esta acao e irreversivel.'
  }

  if (deleteTargets.value.length === 1) {
    return 'O registro sera removido junto com eventos relacionados de desbloqueio e auditoria.'
  }

  return 'Os registros selecionados serao removidos em lote junto com os eventos relacionados.'
})

const deleteConfirmLabel = computed(() =>
  deleteTargets.value.length > 1 ? `Excluir ${deleteTargets.value.length}` : 'Sim, excluir'
)

const deletePreviewLines = computed(() =>
  deleteTargets.value.slice(0, 4).map((rental) => `${rental.locker_code} · ${statusText(rental.status)}`)
)

watch(filteredRentals, () => {
  selectedRentalIds.value = selectedRentalIds.value.filter((id) =>
    filteredRentals.value.some((rental) => rental.id === id)
  )

  if (page.value > totalPages.value) {
    page.value = totalPages.value
  }
})

onMounted(async () => {
  await Promise.all([fetchLocations(), fetchHistory()])
})

async function fetchLocations() {
  try {
    const data = await api.get(`/organizations/${orgId}/locations?limit=200`)
    locations.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (error) {
    console.error(error)
  }
}

async function fetchHistory() {
  isLoading.value = true
  loadWarning.value = ''

  try {
    let url = `/org/${orgId}/audit?limit=500`
    if (selectedLocationId.value) {
      url += `&location_id=${selectedLocationId.value}`
    }

    const data = await api.get(url)
    rentals.value = Array.isArray(data) ? data : (data?.data || [])
    clearSelection()

    const liveCount = rentals.value.filter((rental) => canOverride(rental.status)).length
    if (liveCount > 0) {
      loadWarning.value = `${liveCount} registro(s) seguem em andamento. Use a liberacao operacional apenas quando a operacao tiver confirmado o atendimento presencial.`
    }
  } catch (error) {
    toastError(getApiErrorMessage(error, 'Falha ao carregar historico de alugueis.'))
  } finally {
    isLoading.value = false
  }
}

function clearSelection() {
  selectedRentalIds.value = []
}

/**
 * @param {string} rentalId
 */
function toggleRentalSelection(rentalId) {
  if (selectedRentalIds.value.includes(rentalId)) {
    selectedRentalIds.value = selectedRentalIds.value.filter((id) => id !== rentalId)
    return
  }

  selectedRentalIds.value = [...selectedRentalIds.value, rentalId]
}

function toggleSelectPage() {
  if (allPageSelected.value) {
    selectedRentalIds.value = selectedRentalIds.value.filter((id) => !pagedDeletableIds.value.includes(id))
    return
  }

  selectedRentalIds.value = [...new Set([...selectedRentalIds.value, ...pagedDeletableIds.value])]
}

function toggleSelectAllFiltered() {
  if (allFilteredSelected.value) {
    selectedRentalIds.value = selectedRentalIds.value.filter((id) => !deletableFilteredIds.value.includes(id))
    return
  }

  selectedRentalIds.value = [...new Set([...selectedRentalIds.value, ...deletableFilteredIds.value])]
}

/**
 * @param {any[]} rentalsToDelete
 */
function requestDelete(rentalsToDelete) {
  deleteTargets.value = rentalsToDelete
  deleteError.value = ''
  showDeleteModal.value = true
}

function requestBulkDelete() {
  const selectedRentals = rentals.value.filter((rental) => selectedRentalIds.value.includes(rental.id))

  if (!selectedRentals.length) {
    warning('Selecione pelo menos um registro encerrado para excluir.')
    return
  }

  requestDelete(selectedRentals)
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTargets.value = []
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deleteTargets.value.length) return

  isDeleting.value = true
  deleteError.value = ''

  const targetIds = deleteTargets.value.map((rental) => rental.id)

  try {
    if (targetIds.length === 1) {
      await api.delete(`/org/${orgId}/rentals/${targetIds[0]}`)
    } else {
      await api.post(`/org/${orgId}/rentals/bulk-delete`, { rental_ids: targetIds })
    }

    rentals.value = rentals.value.filter((rental) => !targetIds.includes(rental.id))
    selectedRentalIds.value = selectedRentalIds.value.filter((id) => !targetIds.includes(id))
    success(
      targetIds.length === 1
        ? `Aluguel do locker ${deleteTargets.value[0].locker_code} excluido.`
        : `${targetIds.length} registros excluidos.`
    )
    closeDeleteModal()
  } catch (error) {
    deleteError.value = getApiErrorMessage(error, 'Nao foi possivel excluir os registros selecionados.')
  } finally {
    isDeleting.value = false
  }
}

/**
 * @param {any} rental
 */
function requestOverride(rental) {
  overrideTarget.value = rental
  overrideReason.value = ''
  overrideError.value = ''
  showOverrideModal.value = true
}

function closeOverrideModal() {
  showOverrideModal.value = false
  overrideTarget.value = null
  overrideReason.value = ''
  overrideError.value = ''
}

async function confirmOverride() {
  if (!overrideTarget.value) return

  const reason = overrideReason.value.trim()

  if (reason.length < 8) {
    overrideError.value = 'Informe um motivo com pelo menos 8 caracteres.'
    return
  }

  isOverriding.value = true
  overrideError.value = ''

  try {
    const updated = await api.post(`/organizations/${orgId}/rentals/${overrideTarget.value.id}/override-release`, { reason })

    rentals.value = rentals.value.map((rental) =>
      rental.id === overrideTarget.value.id
        ? {
            ...rental,
            status: updated.status,
            finished_at: updated.finished_at,
            updated_at: updated.updated_at
          }
        : rental
    )

    selectedRentalIds.value = selectedRentalIds.value.filter((id) => id !== overrideTarget.value.id)
    success(`Locker ${overrideTarget.value.locker_code} liberado operacionalmente.`)
    closeOverrideModal()
  } catch (error) {
    overrideError.value = getApiErrorMessage(error, 'Nao foi possivel concluir a liberacao operacional.')
  } finally {
    isOverriding.value = false
  }
}

/**
 * @param {string} status
 */
function canDelete(status) {
  return ['finished', 'cancelled'].includes(status)
}

/**
 * @param {string} status
 */
function canOverride(status) {
  return ['active', 'storing', 'pending_retrieval_payment'].includes(status)
}

/**
 * @param {string} size
 */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[size] || size
}

/**
 * @param {number} cents
 */
function formatCents(cents) {
  if (!cents && cents !== 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/**
 * @param {string|Date} date
 */
function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

/**
 * @param {string} status
 */
function statusText(status) {
  return {
    active: 'Pendente',
    storing: 'Em uso',
    pending_retrieval_payment: 'Aguard. pag.',
    finished: 'Finalizado',
    cancelled: 'Cancelado'
  }[status] || status
}

/**
 * @param {string} status
 */
function statusPill(status) {
  const base = 'items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] border '
  return {
    active: base + 'bg-blue-50 text-blue-700 border-blue-200',
    storing: base + 'bg-amber-50 text-amber-700 border-amber-200',
    pending_retrieval_payment: base + 'bg-brand-50 text-brand-700 border-brand-200',
    finished: base + 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: base + 'bg-slate-100 text-slate-500 border-slate-200'
  }[status] || base + 'bg-slate-100 text-slate-500 border-slate-200'
}
</script>
