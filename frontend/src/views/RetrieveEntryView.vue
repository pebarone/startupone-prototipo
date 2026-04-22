<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Retirada inteligente</p>
            <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Buscar armarios vinculados</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Use sua biometria para localizar os armarios ativos. Os resultados aparecem agrupados por localização.</p>
          </div>

          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !webauthnSupported"
            @click="startRetrievalLookup"
          >
            <BaseSpinner v-if="loading" size="sm" color="white" />
            <span>{{ loading ? 'Buscando armarios...' : 'Buscar armarios' }}</span>
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
          <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{{ lookupHint }}</span>
          <span v-if="groupedLockerLocations.length" class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">{{ groupedLockerLocations.length }} local{{ groupedLockerLocations.length > 1 ? 'es' : '' }} encontrado{{ groupedLockerLocations.length > 1 ? 's' : '' }}</span>
        </div>

        <div v-if="!webauthnSupported" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ webauthnSupportHint }}
        </div>

        <div v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
      </section>

      <section v-if="groupedLockerLocations.length" class="mt-6 space-y-5">
        <article
          v-for="group in groupedLockerLocations"
          :key="group.key"
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Localização</p>
              <h2 class="mt-1 text-xl font-black tracking-tight text-slate-900">{{ group.locationName }}</h2>
              <p v-if="group.locationAddress" class="mt-1 text-xs text-slate-500">{{ group.locationAddress }}</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{{ group.lockers.length }} armário{{ group.lockers.length > 1 ? 's' : '' }}</span>
          </div>

          <LockerGrid
            :lockers="group.lockers"
            :selected-locker-id="selectedLockerId"
            :interactive="true"
            :require-available="false"
            :animate-all="true"
            :global-animation-state="lockerAnimationState"
            empty-message="Nenhum armário ativo neste local."
            @select="openRentalLocker"
          />

          <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Toque em um armário para abrir os detalhes da retirada.</p>
        </article>
      </section>

      <section v-else-if="hasSearched" class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
        Nenhum armário ativo foi localizado para esta biometria agora.
      </section>

      <section v-else class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
        Clique em Buscar armarios para localizar seus alugueis ativos.
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import LockerGrid from '@/components/lockers/LockerGrid.vue'
import { api } from '@/composables/useApi'
import { authenticatePasskey, getWebAuthnErrorMessage, getWebAuthnSupportHint, getWebAuthnSupportState } from '@/composables/useWebAuthn'
import { getApiErrorMessage } from '@/lib/api-errors'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const hasSearched = ref(false)
const lookupState = ref('idle')
const selectedLockerId = ref('')
const lockerAnimationState = ref('idle')

const activeRentals = ref([])
const groupedLockerLocations = ref([])

const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()

const lookupHint = computed(() => {
  if (lookupState.value === 'scanning') return 'Buscando armarios vinculados...'
  if (lookupState.value === 'success') return 'Armarios encontrados'
  return 'Pronto para buscar'
})

onMounted(() => {
  loadRentalsFromStorage()
})

function loadRentalsFromStorage() {
  try {
    const stored = window.localStorage.getItem('fastlock.active_rentals')
    activeRentals.value = stored ? JSON.parse(stored) : []
  } catch (requestError) {
    activeRentals.value = []
  }
}

async function startRetrievalLookup() {
  loading.value = true
  error.value = ''
  lookupState.value = 'scanning'
  hasSearched.value = true
  selectedLockerId.value = ''

  try {
    const options = await api.post('/retrievals/webauthn/authentication-options')
    const credential = await authenticatePasskey(options)
    const result = await api.post('/retrievals/webauthn/retrieve', { credential })

    appendRentalToLocalStorage(result?.rental)
    loadRentalsFromStorage()

    await hydrateGroupedLockers()

    if (groupedLockerLocations.value.length === 0 && result?.rental?.id) {
      await router.replace({ name: 'retrieve', params: { rentalId: result.rental.id } })
      return
    }

    lockerAnimationState.value = 'opening'
    window.setTimeout(() => {
      lockerAnimationState.value = 'open'
    }, 360)

    lookupState.value = 'success'
  } catch (requestError) {
    lookupState.value = 'idle'
    lockerAnimationState.value = 'idle'
    error.value = isProbablyWebAuthnError(requestError)
      ? getWebAuthnErrorMessage(requestError, 'Falha ao localizar os armarios desta biometria.')
      : getApiErrorMessage(requestError, 'Falha ao localizar os armarios desta biometria.')
  } finally {
    loading.value = false
  }
}

/**
 * @param {any} rental
 */
function appendRentalToLocalStorage(rental) {
  if (!rental?.id) {
    return
  }

  try {
    const activeRentalsLocal = JSON.parse(window.localStorage.getItem('fastlock.active_rentals') || '[]')

    if (!activeRentalsLocal.find((entry) => entry.id === rental.id)) {
      activeRentalsLocal.push({
        id: rental.id,
        lockerCode: rental?.locker?.code || 'LOCKER',
        size: rental?.locker?.size || 'M',
        locationName: rental?.location_name || 'Local nao identificado',
        startedAt: rental?.unlocked_at || rental?.started_at || new Date().toISOString()
      })
      window.localStorage.setItem('fastlock.active_rentals', JSON.stringify(activeRentalsLocal))
    }
  } catch (requestError) {}
}

async function hydrateGroupedLockers() {
  const entries = await Promise.all(activeRentals.value.map((entry) => buildLockerEntry(entry)))
  const validEntries = entries.filter(Boolean)

  /** @type {Map<string, { key: string, locationName: string, locationAddress: string, lockers: any[] }>} */
  const groupMap = new Map()

  for (const entry of validEntries) {
    const key = `${entry.locationName}::${entry.locationAddress}`

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        locationName: entry.locationName,
        locationAddress: entry.locationAddress,
        lockers: []
      })
    }

    groupMap.get(key).lockers.push(entry.locker)
  }

  groupedLockerLocations.value = Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      lockers: group.lockers.sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }))
    .sort((a, b) => a.locationName.localeCompare(b.locationName))
}

/**
 * @param {{ id: string, lockerCode?: string, size?: string, locationName?: string, startedAt?: string }} rentalEntry
 * @returns {Promise<{ locationName: string, locationAddress: string, locker: any }|null>}
 */
async function buildLockerEntry(rentalEntry) {
  try {
    const rental = await api.get(`/rentals/${rentalEntry.id}`)

    if (!rental || ['finished', 'cancelled'].includes(rental.status)) {
      return null
    }

    let locationName = rentalEntry.locationName || 'Local nao identificado'
    let locationAddress = ''

    if (rental?.locker?.id) {
      try {
        const context = await api.get(`/lockers/${rental.locker.id}/public-context`)
        locationName = context?.location_name || locationName
        locationAddress = context?.location_address || ''
      } catch (requestError) {}
    }

    const lockerVisual = mapRentalStatusToLockerVisual(rental.status)

    return {
      locationName,
      locationAddress,
      locker: {
        id: rental?.locker?.id || `locker-${rentalEntry.id}`,
        code: rental?.locker?.code || rentalEntry.lockerCode || 'LOCKER',
        size: rental?.locker?.size || rentalEntry.size || 'M',
        status: lockerVisual.status,
        status_label: lockerVisual.label,
        rentalId: rentalEntry.id
      }
    }
  } catch (requestError) {
    return null
  }
}

/**
 * @param {'pending_registration'|'pending_activation_payment'|'active'|'storing'|'pending_retrieval_payment'|'finished'|'cancelled'|string} status
 * @returns {{ status: 'free'|'occupied'|'maintenance', label: string }}
 */
function mapRentalStatusToLockerVisual(status) {
  if (status === 'storing') {
    return { status: 'free', label: 'Seu locker' }
  }

  if (status === 'pending_retrieval_payment') {
    return { status: 'free', label: 'Pagamento' }
  }

  if (status === 'pending_registration') {
    return { status: 'maintenance', label: 'Biometria' }
  }

  if (status === 'pending_activation_payment') {
    return { status: 'maintenance', label: 'PIX inicial' }
  }

  if (status === 'active') {
    return { status: 'occupied', label: 'Reservado' }
  }

  if (status === 'finished') {
    return { status: 'free', label: 'Finalizado' }
  }

  if (status === 'cancelled') {
    return { status: 'maintenance', label: 'Cancelado' }
  }

  return { status: 'occupied', label: 'Ocupado' }
}

/**
 * @param {{ rentalId?: string, id?: string }} locker
 */
function openRentalLocker(locker) {
  const rentalId = locker?.rentalId

  if (!rentalId) {
    return
  }

  selectedLockerId.value = locker.id || ''
  router.push({ name: 'retrieve', params: { rentalId } })
}

function isProbablyWebAuthnError(requestError) {
  return !!requestError?.name && !requestError?.response
}
</script>
