<template>
  <PartnerLayout :org-id="orgId" page-title="Dashboard">

    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="flex flex-col items-center gap-3">
        <div class="w-7 h-7 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
        <p class="text-slate-400 text-sm">Carregando…</p>
      </div>
    </div>

    <div v-else-if="loadError" class="max-w-xl">
      <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <p class="text-base font-bold text-slate-900 mb-2">Nao foi possivel carregar o dashboard</p>
        <p class="text-sm text-slate-500 mb-4">{{ loadError }}</p>
        <button
          @click="initializeDashboard"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <div v-else>

      <!-- Page header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Bom dia, {{ firstName }}
          </h1>
          <p class="text-slate-400 text-sm mt-1">{{ currentOrganization?.name }} · última atualização agora</p>
        </div>
        <button
          id="btn-refresh"
          @click="fetchAll(true)"
          :disabled="isRefreshing"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-slate-300 hover:text-slate-900 transition-all duration-150 active:scale-[0.97] shadow-sm"
        >
          <svg :class="['w-4 h-4', isRefreshing && 'animate-spin']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Atualizar
        </button>
      </div>

      <!-- KPI row — 4 cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Total de Lockers" :value="m.total_lockers ?? 0" delta="+0%" icon-color="#0ea5e9" :icon-path="icons.grid" />
        <MetricCard label="Lockers Livres" :value="m.free_lockers ?? 0" :delta="`${freeRate}% livre`" icon-color="#16a34a" :icon-path="icons.unlock" accent />
        <MetricCard label="Lockers Ocupados" :value="m.occupied_lockers ?? 0" :delta="`${occupiedRate}% ocupação`" icon-color="#d97706" :icon-path="icons.lock" />
        <MetricCard label="Aluguéis Ativos" :value="m.active_rentals ?? 0" delta="em andamento" icon-color="#7c3aed" :icon-path="icons.activity" />
      </div>

      <!-- Secondary KPIs — 5 cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SmallKpi label="Total de Aluguéis" :value="m.total_rentals ?? 0" />
        <SmallKpi label="Em Uso Agora" :value="(m.storing_rentals ?? 0)" color="text-brand-600" />
        <SmallKpi label="Aluguéis Finalizados" :value="m.finished_rentals ?? 0" color="text-emerald-600" />
        <SmallKpi label="Receita Total" :value="formatCentsDisplay(m.total_revenue_cents ?? 0)" color="text-brand-700" />
        <SmallKpi label="Tempo Médio" :value="formatAvgMinutes(m.avg_usage_minutes ?? 0)" color="text-slate-700" />
      </div>

      <!-- Middle row: occupancy + success rate -->
      <div class="grid lg:grid-cols-2 gap-4 mb-6">

        <!-- Occupancy bars -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <p class="text-sm font-bold text-slate-800">Ocupação dos Lockers</p>
            <span class="text-xs text-slate-400">Total: {{ m.total_lockers ?? 0 }}</span>
          </div>
          <div class="space-y-4">
            <OccBar label="Livres" color="#16a34a" :n="m.free_lockers ?? 0" :total="m.total_lockers || 1" />
            <OccBar label="Ocupados" color="#d97706" :n="m.occupied_lockers ?? 0" :total="m.total_lockers || 1" />
            <OccBar label="Manutenção" color="#ef4444" :n="m.maintenance_lockers ?? 0" :total="m.total_lockers || 1" />
          </div>
        </div>

        <!-- Unlock success ring -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <p class="text-sm font-bold text-slate-800 mb-5">Taxa de Abertura com Sucesso</p>
          <div class="flex-1 flex items-center justify-center gap-8">
            <!-- Ring -->
            <div class="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                <circle
                  cx="50" cy="50" r="38"
                  fill="none"
                  stroke="#16a34a"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="`${unlockPct * 238.76} 238.76`"
                  style="transition: stroke-dasharray 1.2s cubic-bezier(0.23, 1, 0.32, 1)"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-slate-900 leading-none">{{ Math.round(unlockPct * 100) }}<span class="text-sm font-bold">%</span></span>
                <span class="text-[10px] text-slate-400 font-medium mt-0.5">êxito</span>
              </div>
            </div>
            <!-- Legend -->
            <div class="space-y-3">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p class="text-xs text-slate-500">Sucesso</p>
                  <p class="text-lg font-black text-slate-900 leading-none">{{ m.successful_unlocks ?? 0 }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                <div>
                  <p class="text-xs text-slate-500">Falha</p>
                  <p class="text-lg font-black text-slate-900 leading-none">{{ m.failed_unlocks ?? 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lockers list preview -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <p class="text-sm font-bold text-slate-800">Status dos Lockers</p>
          <router-link :to="`/partner/${orgId}/lockers`" class="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors">
            Ver todos →
          </router-link>
        </div>

        <div v-if="isLockersLoading" class="px-6 py-10 text-center">
          <div class="inline-flex items-center gap-2 text-slate-400 text-sm">
            <span class="w-4 h-4 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin" />
            Carregando lockers...
          </div>
        </div>

        <div v-else-if="lockers.length === 0" class="px-6 py-10 text-center">
          <p class="text-slate-400 text-sm">Nenhum locker cadastrado ainda.</p>
          <router-link :to="`/partner/${orgId}/lockers`" class="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block">
            Adicionar agora →
          </router-link>
        </div>

        <div v-else class="divide-y divide-slate-50">
          <div
            v-for="locker in lockers.slice(0, 8)"
            :key="locker.id"
            class="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors"
          >
            <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-900 font-mono">{{ locker.code }}</p>
              <p class="text-xs text-slate-400">Tamanho {{ locker.size }}</p>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              :style="statusStyle(locker.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ background: statusDotColor(locker.status) }" />
              {{ statusLabel(locker.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </PartnerLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineComponent, h, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'
import { useOrganization } from '@/composables/useOrganization'
import { useToast } from '@/composables/useToast'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'

const route = useRoute()
const orgId = route.params.orgId
const { user, memberships, isInitializing, isAuthenticated, fetchMe } = useAuth()
const { fetchOrganization, setCurrentOrganization, currentOrganization } = useOrganization()
const { error: toastError } = useToast()

const m = ref({})
const lockers = ref([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const isLockersLoading = ref(false)
const isFetchingDashboard = ref(false)
const lastAutoRefreshAt = ref(0)
const loadError = ref('')

const AUTO_REFRESH_COOLDOWN_MS = 30000

const firstName = computed(() => {
  const name = user.value?.full_name || user.value?.email || 'Gestor'
  return name.split(' ')[0]
})

const freeRate = computed(() => {
  const t = m.value.total_lockers || 0
  if (!t) return 0
  return Math.round(((m.value.free_lockers || 0) / t) * 100)
})

const occupiedRate = computed(() => {
  const t = m.value.total_lockers || 0
  if (!t) return 0
  return Math.round(((m.value.occupied_lockers || 0) / t) * 100)
})

const unlockPct = computed(() => {
  const total = (m.value.successful_unlocks ?? 0) + (m.value.failed_unlocks ?? 0)
  if (!total) return 1
  return (m.value.successful_unlocks ?? 0) / total
})

/** @param {boolean} [quiet] */
async function fetchAll(quiet = false) {
  if (isFetchingDashboard.value || (quiet && isRefreshing.value)) {
    return
  }

  isFetchingDashboard.value = true

  if (quiet) isRefreshing.value = true
  else isLoading.value = true

  isLockersLoading.value = true
  if (!quiet) {
    loadError.value = ''
  }

  try {
    const dashboard = await api.get(`/organizations/${orgId}/dashboard`)
    m.value = dashboard
    lockers.value = dashboard.lockers_preview || []
    lastAutoRefreshAt.value = Date.now()
  } catch (err) {
    loadError.value = err.response?.data?.detail || 'Verifique sua permissao nesta organizacao e tente novamente.'
    toastError('Erro ao carregar dados do dashboard.')
    console.error(err)
  } finally {
    isFetchingDashboard.value = false
    isLockersLoading.value = false
    isRefreshing.value = false
    if (!quiet) {
      isLoading.value = false
    }
  }
}

function syncCurrentOrganization() {
  if (currentOrganization.value?.id === orgId) {
    return Promise.resolve()
  }

  const activeMembership = memberships.value.find((membership) =>
    membership.organization_id === orgId &&
    membership.status === 'active' &&
    membership.organization
  )

  if (activeMembership?.organization) {
    setCurrentOrganization({
      ...activeMembership.organization,
      current_membership: {
        id: activeMembership.id,
        role: activeMembership.role,
        status: activeMembership.status
      }
    })

    return Promise.resolve()
  }

  return fetchOrganization(orgId)
    .then((org) => {
      if (org) {
        setCurrentOrganization(org)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

function waitForAuthReady() {
  if (!isInitializing.value) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const stop = watch(isInitializing, (value) => {
      if (!value) {
        stop()
        resolve()
      }
    })
  })
}

async function initializeDashboard() {
  isLoading.value = true
  loadError.value = ''

  await waitForAuthReady()

  if (!isAuthenticated.value) {
    isLoading.value = false
    loadError.value = 'Sua sessao nao esta autenticada.'
    return
  }

  if (memberships.value.length === 0) {
    await fetchMe()
  }

  await syncCurrentOrganization()
  await fetchAll()
}

const statusColors = {
  free:        { text: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  occupied:    { text: '#b45309', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  maintenance: { text: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' }
}
/** @param {string} s */
function statusStyle(s) {
  const c = statusColors[s] || { text: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
  return { color: c.text, background: c.bg, borderColor: c.border }
}
/** @param {string} s */
function statusDotColor(s) { return (statusColors[s] || { dot: '#94a3b8' }).dot }
/** @param {string} s */
function statusLabel(s) { return { free: 'Livre', occupied: 'Ocupado', maintenance: 'Manutenção' }[s] || s }

const icons = {
  grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  unlock: 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  activity: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
}


/** @param {number} cents */
function formatCentsDisplay(cents) {
  if (!cents && cents !== 0) return 'R$ 0'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/** @param {number} minutes */
function formatAvgMinutes(minutes) {
  if (!minutes || minutes < 1) return 'u2014'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return $ + '{m}min'
  return m === 0 ? $ + '{h}h' : $ + '{h}h ' + $ + '{m}min'
}
onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  await initializeDashboard()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && shouldAutoRefresh()) {
    void fetchAll(true)
  }
}

function shouldAutoRefresh() {
  const now = Date.now()
  return now - lastAutoRefreshAt.value >= AUTO_REFRESH_COOLDOWN_MS
}

// ─── MetricCard (large KPI) ───────────────────────────────
const MetricCard = defineComponent({
  props: {
    label: String,
    value: [Number, String],
    delta: String,
    iconPath: String,
    iconColor: { type: String, default: '#64748b' },
    accent: Boolean
  },
  setup(p) {
    return () => h('div', {
      class: `bg-white rounded-2xl border ${p.accent ? 'border-brand-100 ring-1 ring-brand-100' : 'border-slate-100'} p-5 shadow-sm flex flex-col gap-3`
    }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('p', { class: 'text-xs font-semibold text-slate-500 leading-none' }, p.label),
        h('div', {
          class: 'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          style: { background: p.iconColor + '15' }
        }, [
          h('svg', { class: 'w-4 h-4', fill: 'none', stroke: p.iconColor, viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: p.iconPath })
          ])
        ])
      ]),
      h('p', { class: 'text-4xl font-black text-slate-900 tabular-nums leading-none' }, String(p.value ?? '—')),
      p.delta
        ? h('p', {
            class: `text-xs font-medium leading-none ${p.accent ? 'text-brand-600' : 'text-slate-400'}`
          }, p.delta)
        : null
    ])
  }
})

// ─── SmallKpi ─────────────────────────────────────────────
const SmallKpi = defineComponent({
  props: { label: String, value: [Number, String], color: { type: String, default: 'text-slate-900' } },
  setup(p) {
    return () => h('div', { class: 'bg-white rounded-2xl border border-slate-100 p-4 shadow-sm' }, [
      h('p', { class: 'text-xs font-semibold text-slate-400 mb-2' }, p.label),
      h('p', { class: `text-3xl font-black tabular-nums ${p.color}` }, String(p.value ?? '—'))
    ])
  }
})

// ─── OccBar ───────────────────────────────────────────────
const OccBar = defineComponent({
  props: { label: String, n: Number, total: Number, color: String },
  setup(p) {
    const pct = computed(() => Math.min(100, Math.round(((p.n ?? 0) / (p.total || 1)) * 100)))
    return () => h('div', {}, [
      h('div', { class: 'flex items-center justify-between text-xs mb-1.5' }, [
        h('span', { class: 'font-medium text-slate-600' }, p.label),
        h('span', { class: 'text-slate-400 tabular-nums font-medium' }, `${p.n ?? 0} · ${pct.value}%`)
      ]),
      h('div', { class: 'h-2 rounded-full bg-slate-100 overflow-hidden' }, [
        h('div', {
          style: {
            width: `${pct.value}%`,
            height: '100%',
            background: p.color,
            borderRadius: '9999px',
            transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)'
          }
        })
      ])
    ])
  }
})
</script>
