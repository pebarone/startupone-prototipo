<template>
  <PartnerLayout :org-id="orgId" page-title="Localizações">
    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="h-7 w-7 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
        <p class="text-sm text-slate-400">Carregando localizações...</p>
      </div>
    </div>

    <template v-else>
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Mapa operacional</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Localizações dos lockers</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Cadastre os pontos do parceiro com endereço e coordenadas. O mapa público usa esses locais para mostrar os lockers livres.
          </p>
        </div>

        <button
          v-if="canAdmin"
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md active:scale-[0.98]"
          @click="openCreateModal"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova localização
        </button>
      </div>

      <div v-if="locations.length" class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pontos cadastrados</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ locations.length }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lockers vinculados</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ totalLinkedLockers }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lockers livres</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ totalFreeLockers }}</p>
        </div>
      </div>

      <div v-if="!locations.length" class="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0zM15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        </div>
        <h2 class="mt-5 text-xl font-black tracking-tight text-slate-900">Nenhuma localização cadastrada ainda.</h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Crie o primeiro ponto do parceiro para organizar lockers por endereço e liberar o mapa público.
        </p>
        <button
          v-if="canAdmin"
          type="button"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md active:scale-[0.98]"
          @click="openCreateModal"
        >
          Criar primeira localização
        </button>
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lista de pontos</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">Selecione um local para destacar o pin no mapa e revisar a ocupacao daquele ponto.</p>
          </div>

          <article
            v-for="location in locations"
            :key="location.id"
            class="rounded-lg border bg-white p-4 shadow-sm transition-[border-color,transform,box-shadow] duration-200 ease-out"
            :class="location.id === selectedLocationId ? 'border-brand-300 shadow-[0_18px_34px_rgba(22,163,74,0.12)]' : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'"
          >
            <button type="button" class="block w-full text-left" @click="selectLocation(location)">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="truncate text-lg font-black tracking-tight text-slate-900">{{ location.name }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-500">{{ location.address }}</p>
                </div>

                <div class="flex flex-shrink-0 items-center gap-2">
                  <span class="inline-flex h-9 min-w-[56px] items-center justify-center rounded-full bg-brand-50 px-3 text-sm font-black text-brand-700">
                    {{ location.free_lockers }}
                  </span>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Livres</p>
                  <p class="mt-1 text-lg font-black text-slate-900">{{ location.free_lockers }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
                  <p class="mt-1 text-lg font-black text-slate-900">{{ location.total_lockers }}</p>
                </div>
              </div>
            </button>

            <div v-if="canAdmin" class="mt-4 flex gap-2">
              <button
                type="button"
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-[border-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 active:scale-[0.98]"
                @click="openEditModal(location)"
              >
                Editar
              </button>
              <button
                type="button"
                class="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]"
                @click="removeLocation(location)"
              >
                Excluir
              </button>
            </div>
          </article>
        </aside>

        <section class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mapa</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">Confira a distribuicao dos pontos e use a selecao lateral para revisar um local especifico.</p>
          </div>

          <LockerMap
            :locations="locations"
            :selected-location-id="selectedLocationId"
            height="560px"
            @select-location="selectLocation"
          />

          <div v-if="selectedLocation" class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Local selecionado</p>
                <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">{{ selectedLocation.name }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-500">{{ selectedLocation.address }}</p>
              </div>

              <div class="grid grid-cols-2 gap-2 lg:min-w-[220px]">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Livres</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.free_lockers }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
                  <p class="mt-1 text-2xl font-black text-slate-900">{{ selectedLocation.total_lockers }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <BaseModal
      :model-value="showModal"
      :title="editingLocationId ? 'Editar localização' : 'Nova localização'"
      max-width="2xl"
      @update:model-value="showModal = $event"
      @close="resetForm"
    >
      <div class="space-y-5">
        <div class="grid gap-4 lg:grid-cols-2">
          <div>
            <label for="location-name" class="mb-1.5 block text-sm font-medium text-slate-700">Nome do ponto <span aria-label="obrigatório">*</span></label>
            <input
              id="location-name"
              v-model="form.name"
              type="text"
              name="location_name"
              autocomplete="organization"
              placeholder="Ex.: Estação da Sé"
              aria-required="true"
              class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label for="location-address" class="mb-1.5 block text-sm font-medium text-slate-700">Endereço <span aria-label="obrigatório">*</span></label>
            <div class="flex gap-2">
              <input
                id="location-address"
                v-model="form.address"
                type="text"
                name="location_address"
                autocomplete="street-address"
                placeholder="Rua, número, bairro, cidade…"
                aria-required="true"
                aria-describedby="location-address-hint"
                class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                @keyup.enter="searchLocation"
              />
              <button
                type="button"
                class="inline-flex h-[42px] items-center justify-center rounded-lg border border-slate-300 px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-600"
                @click="searchLocation"
              >
                {{ isSearching ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
            <p id="location-address-hint" class="mt-1 text-xs text-slate-400">Use o endereço mais completo possível para posicionar o pin.</p>
          </div>
        </div>

        <div v-if="searchResults.length" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Resultados</p>
          <div class="mt-3 space-y-2">
            <button
              v-for="result in searchResults"
              :key="result.id"
              type="button"
              class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
              @click="applySearchResult(result)"
            >
              <p class="text-sm font-semibold text-slate-900">{{ result.name }}</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">{{ result.address }}</p>
            </button>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <LockerMap
            :locations="previewLocations"
            :interactive="false"
            :fit-to-locations="true"
            :selected-location-id="previewLocations[0]?.id || ''"
            height="260px"
            empty-label="Busque um endereço para visualizar o ponto no mapa."
          />

          <div class="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Latitude</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formattedLatitude }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Longitude</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formattedLongitude }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
              <p class="mt-1 text-sm text-slate-600">
                {{ hasCoordinates ? 'Posicionado no mapa' : 'Aguardando busca de endereço' }}
              </p>
            </div>
          </div>
        </div>

                <!-- Pricing fields -->
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 mb-4">Tabela de Pre&#231;os</p>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Taxa de ativa&#231;&#227;o (R$)</label>
              <input v-model.number="form.initial_fee_reais" type="number" name="initial_fee_reais" min="0" step="0.5" inputmode="decimal" placeholder="Ex.: 5,00…"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Locker P &#160;R$/h</label>
              <input v-model.number="form.hourly_rate_small_reais" type="number" name="hourly_rate_small_reais" min="0" step="0.5" inputmode="decimal" placeholder="Ex.: 5,00…"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Locker M &#160;R$/h</label>
              <input v-model.number="form.hourly_rate_medium_reais" type="number" name="hourly_rate_medium_reais" min="0" step="0.5" inputmode="decimal" placeholder="Ex.: 10,00…"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Locker G &#160;R$/h</label>
              <input v-model.number="form.hourly_rate_large_reais" type="number" name="hourly_rate_large_reais" min="0" step="0.5" inputmode="decimal" placeholder="Ex.: 15,00…"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
          </div>
          <p class="mt-2 text-xs text-slate-400">Valores em reais (R$). Cobran&#231;a por hora cheia usada pelo cliente.</p>
        </div>

        <div v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {{ formError }}
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          @click="showModal = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isSaving || !form.name.trim() || !form.address.trim() || !hasCoordinates"
          @click="saveLocation"
        >
          <span v-if="isSaving" class="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isSaving ? 'Salvando...' : editingLocationId ? 'Salvar localização' : 'Criar localização' }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showDeleteModal"
      title="Excluir localização?"
      :description="deleteDescription"
      confirm-label="Excluir localização"
      :loading="isDeletingLocation"
      :details="deleteDetails"
      @confirm="confirmLocationDelete"
    />
  </PartnerLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LockerMap from '@/components/map/LockerMap.vue'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { api } from '@/composables/useApi'
import { useOrganization } from '@/composables/useOrganization'
import { useToast } from '@/composables/useToast'
import { summarizeAddress } from '@/lib/address'
import { searchAddresses } from '@/services/geocoding'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const orgId = route.params.orgId
const { canAdmin, fetchOrganization, setCurrentOrganization } = useOrganization()
const { success, error: toastError } = useToast()

/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const isSaving = ref(false)
const isSearching = ref(false)
const showDeleteModal = ref(false)
const isDeletingLocation = ref(false)
const selectedLocationId = ref('')
const editingLocationId = ref('')
const searchResults = ref([])
const formError = ref('')
const locationPendingDelete = ref(null)

const form = ref({
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  initial_fee_reais: 5,
  hourly_rate_small_reais: 5,
  hourly_rate_medium_reais: 10,
  hourly_rate_large_reais: 15
})

const selectedLocation = computed(() =>
  locations.value.find((location) => location.id === selectedLocationId.value) || null
)

const totalLinkedLockers = computed(() =>
  locations.value.reduce((sum, location) => sum + Number(location.total_lockers || 0), 0)
)

const totalFreeLockers = computed(() =>
  locations.value.reduce((sum, location) => sum + Number(location.free_lockers || 0), 0)
)

const hasCoordinates = computed(() =>
  Number.isFinite(Number(form.value.latitude)) && Number.isFinite(Number(form.value.longitude))
)

const previewLocations = computed(() => {
  if (!hasCoordinates.value) {
    return []
  }

  return [
    {
      id: 'draft-location',
      name: form.value.name.trim() || 'Nova localização',
      address: summarizeAddress(form.value.address.trim() || 'Endereco em definicao'),
      latitude: Number(form.value.latitude),
      longitude: Number(form.value.longitude),
      total_lockers: 0,
      free_lockers: 0,
      available_lockers: []
    }
  ]
})

const formattedLatitude = computed(() =>
  hasCoordinates.value ? Number(form.value.latitude).toFixed(6) : '---'
)

const formattedLongitude = computed(() =>
  hasCoordinates.value ? Number(form.value.longitude).toFixed(6) : '---'
)

const deleteDescription = computed(() => {
  if (!locationPendingDelete.value) {
    return 'Esta ação remove a localização de forma permanente.'
  }

  return `A localização ${locationPendingDelete.value.name} será removida permanentemente.`
})

const deleteDetails = computed(() => {
  if (!locationPendingDelete.value) {
    return []
  }

  return [
    summarizeAddress(locationPendingDelete.value.address),
    `${locationPendingDelete.value.free_lockers || 0} locker(s) livres no ponto`,
    `${locationPendingDelete.value.total_lockers || 0} locker(s) vinculados`
  ]
})

onMounted(async () => {
  const org = await fetchOrganization(orgId)

  if (org) {
    setCurrentOrganization(org)
  }

  await fetchLocations()
})

async function fetchLocations() {
  isLoading.value = true

  try {
    const response = await api.get(`/organizations/${orgId}/locations?limit=200`)
    locations.value = (Array.isArray(response) ? response : (response?.data || [])).map(mapLocationRecord)

    if (!locations.value.length) {
      selectedLocationId.value = ''
      return
    }

    if (!locations.value.some(({ id }) => id === selectedLocationId.value)) {
      selectedLocationId.value = locations.value[0].id
    }
  } catch (error) {
    toastError('Falha ao carregar localizacoes.')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

/**
 * @param {any} location
 * @returns {any}
 */
function mapLocationRecord(location) {
  return {
    ...location,
    address: summarizeAddress(location?.address || '')
  }
}

function openCreateModal() {
  editingLocationId.value = ''
  showModal.value = true
  resetForm()
}

/** @param {any} location */
function openEditModal(location) {
  editingLocationId.value = location.id
  form.value = {
    name: location.name,
    address: summarizeAddress(location.address),
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    initial_fee_reais: (location.initial_fee_cents ?? 500) / 100,
    hourly_rate_small_reais: (location.hourly_rate_small ?? 500) / 100,
    hourly_rate_medium_reais: (location.hourly_rate_medium ?? 1000) / 100,
    hourly_rate_large_reais: (location.hourly_rate_large ?? 1500) / 100
  }
  formError.value = ''
  searchResults.value = []
  showModal.value = true
}

function resetForm() {
  if (!showModal.value) {
    editingLocationId.value = ''
  }

  form.value = {
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    initial_fee_reais: 5,
    hourly_rate_small_reais: 5,
    hourly_rate_medium_reais: 10,
    hourly_rate_large_reais: 15
  }
  formError.value = ''
  searchResults.value = []
  isSearching.value = false
}

/**
 * @param {any} location
 * @returns {void}
 */
function selectLocation(location) {
  selectedLocationId.value = location.id
}

async function searchLocation() {
  formError.value = ''

  if (form.value.address.trim().length < 4) {
    formError.value = 'Digite um endereço mais completo para buscar no mapa.'
    return
  }

  isSearching.value = true

  try {
    const results = await searchAddresses(form.value.address)
    searchResults.value = results

    if (!results.length) {
      formError.value = 'Nenhum endereço encontrado. Tente detalhar melhor o local.'
    }
  } catch (error) {
    formError.value = error?.message || 'Não foi possível buscar o endereço agora.'
  } finally {
    isSearching.value = false
  }
}

/**
 * @param {{ name: string, address: string, latitude: number, longitude: number }} result
 */
function applySearchResult(result) {
  form.value.address = result.address
  form.value.latitude = result.latitude
  form.value.longitude = result.longitude

  if (!form.value.name.trim()) {
    form.value.name = result.name
  }

  searchResults.value = []
  formError.value = ''
}

async function saveLocation() {
  isSaving.value = true
  formError.value = ''

  const payload = {
    name: form.value.name.trim(),
    address: summarizeAddress(form.value.address.trim()),
    latitude: Number(form.value.latitude),
    longitude: Number(form.value.longitude),
    initial_fee_cents: Math.round((form.value.initial_fee_reais || 5) * 100),
    hourly_rate_small: Math.round((form.value.hourly_rate_small_reais || 5) * 100),
    hourly_rate_medium: Math.round((form.value.hourly_rate_medium_reais || 10) * 100),
    hourly_rate_large: Math.round((form.value.hourly_rate_large_reais || 15) * 100)
  }

  try {
    let savedLocationId = editingLocationId.value

    if (editingLocationId.value) {
      const updatedLocation = await api.patch(`/organizations/${orgId}/locations/${editingLocationId.value}`, payload)
      savedLocationId = updatedLocation?.id || editingLocationId.value
      success('Localização atualizada.')
    } else {
      const createdLocation = await api.post(`/organizations/${orgId}/locations`, payload)
      savedLocationId = createdLocation?.id || ''
      success('Localização criada.')
    }

    showModal.value = false
    resetForm()
    await fetchLocations()

    if (savedLocationId && locations.value.some(({ id }) => id === savedLocationId)) {
      selectedLocationId.value = savedLocationId
    }
  } catch (error) {
    formError.value = getApiErrorMessage(error, 'Nao foi possivel salvar a localização.')
  } finally {
    isSaving.value = false
  }
}

/**
 * @param {any} location
 */
async function removeLocation(location) {
  locationPendingDelete.value = location
  showDeleteModal.value = true
}

async function confirmLocationDelete() {
  if (!locationPendingDelete.value) {
    return
  }

  isDeletingLocation.value = true

  try {
    await api.delete(`/organizations/${orgId}/locations/${locationPendingDelete.value.id}`)
    success('Localização removida.')

    if (selectedLocationId.value === locationPendingDelete.value.id) {
      selectedLocationId.value = ''
    }

    showDeleteModal.value = false
    locationPendingDelete.value = null
    await fetchLocations()
  } catch (error) {
    toastError(getApiErrorMessage(error, 'Nao foi possivel excluir a localização.'))
  } finally {
    isDeletingLocation.value = false
  }
}
</script>
