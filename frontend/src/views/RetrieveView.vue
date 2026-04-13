<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner size="xl" color="brand" />
          <p class="text-sm text-slate-500">Redirecionando para o locker...</p>
        </div>
      </div>

      <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {{ loadError }}
      </div>

      <div v-else-if="rental" class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="mt-5 text-2xl font-black tracking-tight text-slate-900">Este aluguel ja terminou</h1>
        <p class="mt-3 text-sm leading-6 text-slate-500">
          Locker <span class="font-mono font-black text-slate-900">{{ rental.locker?.code }}</span>. Use o QR fixo do locker ou volte ao mapa para iniciar um novo aluguel.
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="/use" class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-900">
            Escolher outro locker
          </a>
          <a
            :href="`/locker/${rental.locker?.id}`"
            class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Abrir pagina do locker
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { getApiErrorMessage } from '@/lib/api-errors'

const route = useRoute()
const router = useRouter()

/** @type {import('vue').Ref<any>} */
const rental = ref(null)
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  await loadRental()
})

async function loadRental() {
  isLoading.value = true
  loadError.value = ''

  try {
    const data = await api.get(`/rentals/${route.params.rentalId}`)

    if (data?.locker?.id && !['finished', 'cancelled'].includes(data.status)) {
      await router.replace({ name: 'locker-flow', params: { lockerId: data.locker.id } })
      return
    }

    rental.value = data
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'Nao foi possivel localizar este aluguel legado.')
  } finally {
    isLoading.value = false
  }
}
</script>
