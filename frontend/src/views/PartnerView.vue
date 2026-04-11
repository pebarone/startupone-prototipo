<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import gsap from 'gsap'

const apiBase = 'http://localhost:3333/api'

/** @type {import('vue').Ref<any>} */
const metrics = ref(null)

/** @type {import('vue').Ref<any[]>} */
const lockers = ref([])

/** @type {import('vue').Ref<boolean>} */
const isLoading = ref(true)

/** @type {import('vue').Ref<string | null>} */
const error = ref(null)

async function fetchDashboard() {
  try {
    isLoading.value = true
    error.value = null
    // Use admin key for demo MVP
    const headers = { 'x-admin-api-key': 'dev-admin-token-change-me' }
    
    const [metricsRes, lockersRes] = await Promise.all([
      axios.get(`${apiBase}/dashboard`, { headers }),
      axios.get(`${apiBase}/lockers`, { headers })
    ])
    metrics.value = metricsRes.data
    lockers.value = lockersRes.data.data || []
    animateDashboard()
  } catch (err) {
    error.value = 'Failed to load dashboard data.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function animateDashboard() {
  setTimeout(() => {
    gsap.from('.metric-card', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power2.out' })
    gsap.from('.locker-row', { opacity: 0, x: -10, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 })
  }, 50)
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-300 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight">Partner Dashboard</h1>
          <p class="text-slate-400 mt-2">Real-time metrics and locker controls.</p>
        </div>
        <button 
          @click="fetchDashboard" 
          class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
        >
          <svg v-if="isLoading" class="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh
        </button>
      </div>

      <div v-if="error" class="text-red-300 bg-red-900/30 border border-red-800 p-4 rounded-xl mb-8 font-medium">
        {{ error }}
      </div>

      <!-- Metrics Grid -->
      <div v-if="metrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="metric-card bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
          <div class="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Lockers</div>
          <div class="text-4xl font-black text-white">{{ metrics.total_lockers }}</div>
        </div>
        <div class="metric-card bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
          <div class="relative">
            <div class="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-2">Free Lockers</div>
            <div class="text-4xl font-black text-white">{{ metrics.free_lockers }}</div>
          </div>
        </div>
        <div class="metric-card bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
          <div class="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Rentals</div>
          <div class="text-4xl font-black text-white">{{ metrics.active_rentals }}</div>
        </div>
        <div class="metric-card bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
          <div class="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Successful Unlocks</div>
          <div class="text-4xl font-black text-white">{{ metrics.successful_unlocks }}</div>
        </div>
      </div>

      <!-- Lockers List -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-700/50 bg-slate-800/80">
          <h3 class="text-lg font-bold text-white">Locker Status</h3>
        </div>
        <div class="divide-y divide-slate-700/50">
          <div v-if="lockers.length === 0" class="p-8 text-center text-slate-500">
            No lockers found in the system.
          </div>
          <div 
            v-for="locker in lockers" 
            :key="locker.id" 
            class="locker-row px-6 py-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-lg text-white">
                {{ locker.code.split('-')[1] || locker.code }}
              </div>
              <div>
                <div class="font-bold text-white tracking-wide">{{ locker.code }}</div>
                <div class="text-xs text-slate-400 uppercase">Size: {{ locker.size }}</div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div 
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                :class="{
                  'bg-emerald-900/40 text-emerald-400 border-emerald-800': locker.status === 'free',
                  'bg-amber-900/40 text-amber-400 border-amber-800': locker.status === 'occupied',
                  'bg-red-900/40 text-red-400 border-red-800': locker.status === 'maintenance'
                }"
              >
                {{ locker.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>