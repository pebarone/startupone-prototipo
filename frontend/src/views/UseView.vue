<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Escolha um locker</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Mapa publico de lockers</h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Encontre um ponto disponivel ou escaneie o QR fixo do locker para abrir diretamente o fluxo WebAuthn no celular.
        </p>
      </div>

      <div v-if="isLoading" class="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner size="xl" color="brand" />
          <p class="text-sm text-slate-500">Carregando localizacoes...</p>
        </div>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {{ error }}
      </div>

      <div v-else class="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  Lockers livres
                </span>
                <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  QR fixo = fluxo no celular
                </span>
              </div>

              <span
                v-if="geoLabel"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  geoStatus === 'granted'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-500'
                ]"
              >
                <span :class="['h-1.5 w-1.5 rounded-full', geoStatus === 'granted' ? 'bg-emerald-500' : 'bg-slate-400']" />
                {{ geoLabel }}
              </span>
            </div>

            <LockerMap
              :locations="locations"
              :selected-location-id="selectedLocationId"
              :center="mapCenter"
              :fit-to-locations="false"
              height="560px"
              @select-location="selectLocation"
            />
          </div>
        </div>

        <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <template v-if="selectedLocation">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Local selecionado</p>
            <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">{{ selectedLocation.name }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ selectedLocation.address }}</p>

            <div class="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">Preco base</p>
              <div class="mt-3 flex items-center justify-between text-sm text-brand-900">
                <span>Ativacao</span>
                <strong>{{ formatCents(selectedLocation.initial_fee_cents ?? 500) }}</strong>
              </div>
            </div>

            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Lockers livres</p>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{{ availableLockers.length }}</span>
              </div>

              <div v-if="availableLockers.length" class="space-y-3">
                <button
                  v-for="locker in availableLockers"
                  :key="locker.id"
                  type="button"
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                  @click="openLockerFlow(locker.id)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-mono text-lg font-black text-slate-900">{{ locker.code }}</p>
                      <p class="mt-1 text-sm text-slate-500">{{ sizeLabel(locker.size) }}</p>
                    </div>
                    <span class="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
                      Abrir no celular
                    </span>
                  </div>
                </button>
              </div>

              <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                Sem lockers livres neste ponto.
              </div>
            </div>
          </template>

          <template v-else>
            <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 class="mt-5 text-lg font-black tracking-tight text-slate-900">Selecione um ponto no mapa</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Ao escolher um locker, o app navega para a rota publica do QR fixo e o desbloqueio passa a usar WebAuthn no celular.
              </p>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LockerMap from '@/components/map/LockerMap.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { getApiErrorMessage } from '@/lib/api-errors'

const router = useRouter()

/** @type {import('vue').Ref<any[]>} */
const locations = ref([])
const selectedLocationId = ref('')
const isLoading = ref(true)
const error = ref('')
const geoStatus = ref('pending')
const geoLabel = ref('')
const mapCenter = ref({ lat: -23.55052, lng: -46.633308, zoom: 12 })

const selectedLocation = computed(() =>
  locations.value.find((item) => item.id === selectedLocationId.value) || null
)

const availableLockers = computed(() => selectedLocation.value?.available_lockers || [])

onMounted(async () => {
  resolveUserLocation()
  await fetchLocations()
})

async function fetchLocations() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await api.get('/locations?limit=200')
    locations.value = response.data || []

    if (locations.value.length && !selectedLocationId.value) {
      selectedLocationId.value = locations.value[0].id
    }
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, 'Falha ao carregar o mapa de lockers.')
  } finally {
    isLoading.value = false
  }
}

function resolveUserLocation() {
  if (!navigator.geolocation) {
    geoStatus.value = 'unavailable'
    geoLabel.value = 'Localizacao indisponivel'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      geoStatus.value = 'granted'
      geoLabel.value = 'Mapa centrado em voce'
      mapCenter.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 13
      }
    },
    () => {
      geoStatus.value = 'fallback'
      geoLabel.value = 'Usando centro padrao'
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000
    }
  )
}

/**
 * @param {any} location
 */
function selectLocation(location) {
  selectedLocationId.value = location.id
}

/**
 * @param {string} lockerId
 */
function openLockerFlow(lockerId) {
  router.push({ name: 'locker-flow', params: { lockerId } })
}

/**
 * @param {string} size
 * @returns {string}
 */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[size] || size
}

/**
 * @param {number} cents
 * @returns {string}
 */
function formatCents(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100)
}
</script>
