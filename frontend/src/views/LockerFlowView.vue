<template>
  <div class="min-h-screen bg-slate-50 pb-16 pt-24">
    <div class="mx-auto max-w-4xl px-4 sm:px-6">
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Locker QR</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Fluxo do locker no seu celular</h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Escaneie o QR fixo do locker, confirme a biometria do seu aparelho e use a mesma pagina para abrir novamente na retirada.
        </p>
      </div>

      <div v-if="isLoading" class="flex min-h-[45vh] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner size="xl" color="brand" />
          <p class="text-sm text-slate-500">Carregando contexto do locker...</p>
        </div>
      </div>

      <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {{ loadError }}
      </div>

      <template v-else-if="lockerContext">
        <div class="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Locker</p>
                <p class="mt-1 font-mono text-3xl font-black text-slate-900">{{ lockerContext.locker.code }}</p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ sizeLabel(lockerContext.locker.size) }}
                  <span v-if="lockerContext.location_name">· {{ lockerContext.location_name }}</span>
                </p>
                <p v-if="lockerContext.location_address" class="mt-1 text-xs text-slate-400">{{ summarizeAddress(lockerContext.location_address) }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Modo atual</p>
                <p class="mt-1 text-lg font-black text-slate-900">{{ modeLabel }}</p>
                <p class="mt-2 text-xs text-slate-500">Taxa inicial: <span class="font-semibold text-slate-700">{{ formatCents(lockerContext.initial_fee_cents) }}</span></p>
                <p class="mt-1 text-xs text-slate-500">Hora: <span class="font-semibold text-slate-700">{{ formatCents(lockerContext.hourly_rate_cents) }}</span></p>
              </div>
            </div>
          </div>

          <div v-if="liveElapsedLabel" class="grid gap-4 px-6 py-5 sm:grid-cols-3">
            <div class="rounded-xl bg-slate-900 px-4 py-4 text-center text-white">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tempo</p>
              <p class="mt-2 font-mono text-2xl font-black">{{ liveElapsedLabel }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hora atual</p>
              <p class="mt-2 text-xl font-black text-slate-900">{{ formatCents(liveHourlyCharge) }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
              <p class="mt-2 text-sm font-black uppercase tracking-[0.12em]" :class="statusColorClass">{{ liveRentalStatusLabel }}</p>
            </div>
          </div>
        </div>

        <div v-if="actionError" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {{ actionError }}
        </div>

        <section v-if="screen === 'maintenance'" class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414 1.414M5.636 5.636l1.414 1.414m10.607 10.607l1.414 1.414M9 12h6m-3-3v6" />
            </svg>
          </div>
          <h2 class="mt-5 text-2xl font-black tracking-tight text-slate-900">Locker indisponivel</h2>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Este locker esta em manutencao ou sem um aluguel recuperavel no momento. Tente outro QR ou fale com a operacao.
          </p>
        </section>

        <section v-else-if="screen === 'rent'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
          <div class="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                Novo aluguel
              </p>
              <h2 class="mt-4 text-3xl font-black tracking-tight">Pague e cadastre a biometria do telefone</h2>
              <p class="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                O desbloqueio fica vinculado a este aparelho por WebAuthn. Na retirada, basta escanear o mesmo QR do locker e confirmar a biometria novamente.
              </p>

              <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-300">Taxa de ativacao</span>
                  <span class="font-black text-white">{{ formatCents(lockerContext.initial_fee_cents) }}</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-sm">
                  <span class="text-slate-300">Taxa por hora</span>
                  <span class="font-black text-white">{{ formatCents(lockerContext.hourly_rate_cents) }}</span>
                </div>
              </div>

              <div v-if="!webauthnSupported" class="mt-5 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {{ webauthnSupportHint || 'Este navegador nao suporta WebAuthn. Abra o QR em um navegador atualizado no celular.' }}
              </div>
            </div>

            <div class="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">Confirmacao</p>
              <h3 class="mt-2 text-xl font-black tracking-tight">Liberar o locker agora</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Depois do cadastro biometrico, o locker entra em uso e este aparelho vira a chave publica autorizada para a retirada.
              </p>

              <button
                type="button"
                class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="actionLoading || !webauthnSupported"
                @click="startRentalRegistration"
              >
                <BaseSpinner v-if="actionLoading" size="sm" color="white" />
                <span>{{ actionLoading ? 'Cadastrando biometria...' : 'Pagar taxa e cadastrar biometria' }}</span>
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="screen === 'busy'" class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="mt-5 text-2xl font-black tracking-tight text-slate-900">Ativacao em andamento</h2>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Este locker ja recebeu a taxa inicial, mas o cadastro WebAuthn ainda nao foi concluido no celular que iniciou o aluguel. Finalize a ativacao naquele aparelho ou acione a operacao.
          </p>
          <button
            type="button"
            class="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            :disabled="actionLoading"
            @click="refreshContext"
          >
            Atualizar status
          </button>
        </section>

        <section v-else-if="screen === 'resume-registration'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="bg-amber-500 px-6 py-8 text-center text-slate-950">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-950/70">Ativacao pendente</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight">Retome o cadastro biometrico neste celular</h2>
            <p class="mt-3 text-sm leading-6 text-amber-950/80">
              A taxa inicial ja foi criada para este locker. Falta concluir a credencial WebAuthn neste aparelho para entrar em uso.
            </p>
          </div>

          <div class="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">Aluguel pendente</p>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                Use o mesmo navegador deste celular para retomar a biometria. Outros aparelhos nao conseguem finalizar este cadastro.
              </p>
            </div>

            <div class="rounded-2xl bg-slate-900 px-5 py-5 text-white">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Proximo passo</p>
              <p class="mt-3 text-sm leading-6 text-slate-300">
                Gere uma nova challenge e confirme a biometria local para vincular a chave publica deste aluguel ao aparelho.
              </p>
              <p v-if="!webauthnSupported" class="mt-3 text-xs leading-5 text-amber-200">
                {{ webauthnSupportHint }}
              </p>
              <button
                type="button"
                class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="actionLoading || !webauthnSupported || !currentRental?.id"
                @click="resumePendingRegistration"
              >
                <BaseSpinner v-if="actionLoading" size="sm" color="white" />
                <span>{{ actionLoading ? 'Retomando cadastro...' : 'Retomar cadastro biometrico' }}</span>
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="screen === 'storing'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="bg-brand-600 px-6 py-8 text-center text-white">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">Locker ativo</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight">Locker aberto e protegido</h2>
            <p class="mt-3 text-sm leading-6 text-brand-100">
              Feche esta pagina se quiser. Na retirada, escaneie o mesmo QR deste locker e confirme a biometria no telefone.
            </p>
          </div>

          <div class="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-900 px-5 py-5 text-center text-white">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tempo em uso</p>
              <p class="mt-3 font-mono text-4xl font-black tracking-widest">{{ liveElapsedLabel || '00:00:00' }}</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Como retirar</p>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                Volte a este locker, escaneie o QR fixo e confirme a biometria neste mesmo aparelho. O backend valida a chave publica registrada neste aluguel.
              </p>
              <button
                type="button"
                class="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                :disabled="actionLoading"
                @click="refreshContext"
              >
                Atualizar pagina
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="screen === 'verify'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10 text-center shadow-2xl">
          <p class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Retirada
          </p>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-white">Confirme a biometria para abrir</h2>
          <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
            Este QR identifica o aluguel em andamento. O desbloqueio so continua se a credencial WebAuthn registrada neste aparelho for validada com biometria local.
          </p>

          <div class="mx-auto mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-sm text-slate-200 sm:max-w-md">
            <div class="flex items-center justify-between">
              <span>Taxa inicial</span>
              <strong class="text-white">{{ formatCents(activeRental.initial_fee_cents) }}</strong>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span>Hora em vigor</span>
              <strong class="text-white">{{ formatCents(activeRental.hourly_rate_cents) }}</strong>
            </div>
          </div>

          <button
            type="button"
            class="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="actionLoading || !webauthnSupported || !activeRental.id"
            @click="verifyAndRetrieve"
          >
            <BaseSpinner v-if="actionLoading" size="sm" color="white" />
            <span>{{ actionLoading ? 'Validando biometria...' : 'Validar biometria e calcular retirada' }}</span>
          </button>

          <p v-if="!webauthnSupported" class="mt-4 text-sm text-amber-200">
            {{ webauthnSupportHint || 'Este navegador nao suporta WebAuthn. Abra o QR em um navegador atualizado no celular cadastrado.' }}
          </p>
        </section>

        <section v-else-if="screen === 'payment'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Pagamento final</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Resumo da retirada</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">A biometria ja foi validada. Confirme o encerramento para liberar o locker.</p>
          </div>

          <div class="grid gap-5 px-6 py-6 lg:grid-cols-[1fr_320px]">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa inicial</span>
                <span class="font-semibold text-emerald-600">{{ formatCents(activeRental.initial_fee_cents) }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between text-sm">
                <span class="text-slate-500">Tempo de uso</span>
                <span class="font-semibold text-slate-900">{{ paymentMinutesLabel }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between text-sm">
                <span class="text-slate-500">Taxa extra</span>
                <span class="font-semibold text-slate-900">{{ formatCents(paymentExtraCharge) }}</span>
              </div>
              <div class="mt-4 border-t border-slate-200 pt-4">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900">Total</span>
                  <span class="text-3xl font-black tracking-tight text-slate-900">{{ formatCents(paymentTotal) }}</span>
                </div>
              </div>
            </div>

            <div class="rounded-2xl bg-slate-900 p-5 text-white">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Encerramento</p>
              <h3 class="mt-2 text-xl font-black tracking-tight">Finalizar retirada</h3>
              <p class="mt-2 text-sm leading-6 text-slate-300">
                O comando abaixo encerra o aluguel, libera o locker no backend e move o registro para o historico operacional.
              </p>
              <button
                type="button"
                class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="actionLoading || !activeRental.id"
                @click="confirmPayment"
              >
                <BaseSpinner v-if="actionLoading" size="sm" color="white" />
                <span>{{ actionLoading ? 'Finalizando...' : 'Confirmar pagamento e liberar locker' }}</span>
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="screen === 'done'" class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(21,128,61,0.28)]">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="mt-6 text-4xl font-black tracking-tight text-white">Tudo certo</h2>
          <p class="mt-3 text-lg text-brand-100">O locker foi liberado e o aluguel terminou neste aparelho.</p>
          <div class="mx-auto mt-6 max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 text-left text-sm text-white/90">
            <div class="flex justify-between"><span>Taxa inicial</span><span class="font-semibold text-white">{{ formatCents(lastCompletedInitialFee) }}</span></div>
            <div class="mt-2 flex justify-between"><span>Taxa extra</span><span class="font-semibold text-white">{{ formatCents(lastCompletedExtraCharge) }}</span></div>
            <div class="mt-3 border-t border-white/20 pt-3 flex justify-between"><span class="font-bold text-white">Total</span><span class="text-xl font-black text-white">{{ formatCents(lastCompletedTotal) }}</span></div>
          </div>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              @click="refreshContext"
            >
              Voltar ao locker
            </button>
            <a href="/use" class="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Escolher outro locker
            </a>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { api } from '@/composables/useApi'
import { summarizeAddress } from '@/lib/address'
import {
  authenticatePasskey,
  getWebAuthnErrorMessage,
  getWebAuthnSupportHint,
  getWebAuthnSupportState,
  registerPasskey
} from '@/composables/useWebAuthn'
import { getApiErrorMessage } from '@/lib/api-errors'
import { deriveMinutesUsed, estimateExtraChargeCents, normalizeTimestampToNow } from '@/lib/rental-pricing'

const route = useRoute()
const lockerId = computed(() => String(route.params.lockerId || ''))

/** @type {import('vue').Ref<any>} */
const lockerContext = ref(null)
/** @type {import('vue').Ref<any>} */
const currentRental = ref(null)
/** @type {import('vue').Ref<any>} */
const retrievalResult = ref(null)
const isLoading = ref(true)
const actionLoading = ref(false)
const loadError = ref('')
const actionError = ref('')
const elapsedSeconds = ref(0)
const webauthnState = getWebAuthnSupportState()
const webauthnSupported = webauthnState.supported
const webauthnSupportHint = getWebAuthnSupportHint()
const pendingActivationRentalId = ref(loadPersistedPendingRentalId())

let timerInterval = null

const activeRental = computed(() => currentRental.value || lockerContext.value?.active_rental || null)

const screen = computed(() => {
  if (!lockerContext.value) return 'maintenance'
  if (currentRental.value?.status === 'pending_registration' && currentRental.value?.id) return 'resume-registration'
  if (currentRental.value?.status === 'pending_activation_payment' && currentRental.value?.id) return 'activation-payment'
  if (currentRental.value?.status === 'active' && currentRental.value?.id) return 'activation-open'
  if (currentRental.value?.status === 'storing') return 'storing'
  if (retrievalResult.value) return 'payment'
  if (currentRental.value?.status === 'finished') return 'done'
  if (lockerContext.value.mode === 'maintenance') return 'maintenance'
  if (lockerContext.value.mode === 'rent') return 'rent'

  const status = activeRental.value?.status
  if (status === 'active') return 'busy'
  if (status === 'storing') return 'verify'
  if (status === 'pending_retrieval_payment') return 'payment'
  return 'maintenance'
})

const modeLabel = computed(() => {
  return {
    rent: 'Pronto para aluguel',
    retrieve: 'Locker ocupado',
    maintenance: 'Indisponivel'
  }[lockerContext.value?.mode] || 'Locker'
})

const liveElapsedLabel = computed(() => {
  if (!activeRental.value?.unlocked_at) return ''
  const total = Math.max(0, elapsedSeconds.value)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const liveHourlyCharge = computed(() => {
  if (!activeRental.value) return lockerContext.value?.hourly_rate_cents ?? 0
  return activeRental.value.hourly_rate_cents || lockerContext.value?.hourly_rate_cents || 0
})

const liveRentalStatusLabel = computed(() => statusLabel(activeRental.value?.status))

const statusColorClass = computed(() => {
  const status = activeRental.value?.status
  if (status === 'pending_retrieval_payment') return 'text-brand-600'
  if (status === 'storing') return 'text-amber-500'
  return 'text-slate-300'
})

const paymentExtraCharge = computed(() => {
  if (retrievalResult.value) return retrievalResult.value.extra_charge_cents || 0
  if (activeRental.value?.status === 'pending_retrieval_payment') {
    return activeRental.value.extra_charge_cents ?? estimateExtraChargeCents(
      deriveMinutesUsed(activeRental.value.unlocked_at, activeRental.value.retrieved_at),
      activeRental.value.hourly_rate_cents
    )
  }
  return 0
})

const paymentTotal = computed(() => {
  if (retrievalResult.value) return retrievalResult.value.total_cents || 0
  if (activeRental.value?.status === 'pending_retrieval_payment') {
    return activeRental.value.total_cents ?? ((activeRental.value.initial_fee_cents || 0) + paymentExtraCharge.value)
  }
  return activeRental.value?.initial_fee_cents || 0
})

const paymentMinutesLabel = computed(() => {
  if (retrievalResult.value?.minutes_used) {
    return formatMinutes(retrievalResult.value.minutes_used)
  }

  if (activeRental.value?.retrieved_at && activeRental.value?.unlocked_at) {
    return formatMinutes(deriveMinutesUsed(activeRental.value.unlocked_at, activeRental.value.retrieved_at))
  }

  return liveElapsedLabel.value || 'Ainda nao calculado'
})

const lastCompletedInitialFee = computed(() => currentRental.value?.initial_fee_cents || activeRental.value?.initial_fee_cents || lockerContext.value?.initial_fee_cents || 0)
const lastCompletedExtraCharge = computed(() => retrievalResult.value?.extra_charge_cents || paymentExtraCharge.value)
const lastCompletedTotal = computed(() => retrievalResult.value?.total_cents || paymentTotal.value)

onMounted(async () => {
  await refreshContext()
})

onUnmounted(() => {
  stopTimer()
})

async function refreshContext({ preserveActionError = false } = {}) {
  isLoading.value = true
  loadError.value = ''
  if (!preserveActionError) {
    actionError.value = ''
  }

  try {
    const data = await api.get(`/lockers/${lockerId.value}/public-context`)
    lockerContext.value = data
    if (!currentRental.value || currentRental.value.locker_id !== data.locker.id) {
      currentRental.value = null
    }

    if (pendingActivationRentalId.value) {
      try {
        const pendingRental = await api.get(`/rentals/${pendingActivationRentalId.value}`)

        if (pendingRental?.locker_id === data.locker.id && !['finished', 'cancelled'].includes(pendingRental.status)) {
          currentRental.value = pendingRental
        } else {
          clearPersistedPendingRentalId()
        }
      } catch (requestError) {
        clearPersistedPendingRentalId()
      }
    }

    if (!currentRental.value && data.active_rental?.status === 'active' && pendingActivationRentalId.value) {
      currentRental.value = {
        id: pendingActivationRentalId.value,
        locker_id: data.locker.id,
        status: 'active',
        initial_fee_cents: data.active_rental.initial_fee_cents,
        hourly_rate_cents: data.active_rental.hourly_rate_cents,
        started_at: data.active_rental.started_at,
        unlocked_at: data.active_rental.unlocked_at,
        retrieved_at: data.active_rental.retrieved_at,
        extra_charge_cents: data.active_rental.extra_charge_cents,
        total_cents: data.active_rental.total_cents
      }
    }

    if (!retrievalResult.value && data.active_rental?.status === 'pending_retrieval_payment') {
      currentRental.value = data.active_rental
    }

    if (['storing', 'pending_retrieval_payment', 'finished', 'cancelled'].includes(currentRental.value?.status || '')) {
      clearPersistedPendingRentalId()
    }

    syncTimer()
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'Nao foi possivel carregar o locker.')
  } finally {
    isLoading.value = false
  }
}

async function startRentalRegistration() {
  actionLoading.value = true
  actionError.value = ''

  try {
    const rental = await api.post('/rentals', {
      locker_id: lockerId.value,
      payment_confirmed: false
    })
    currentRental.value = rental
    persistPendingRentalId(rental.id)
    await completePendingRegistration(rental.id)
  } catch (error) {
    await refreshAfterActionFailure(error, 'Falha ao cadastrar a biometria deste aparelho.')
  } finally {
    actionLoading.value = false
  }
}

async function resumePendingRegistration() {
  if (!currentRental.value?.id) {
    actionError.value = 'Este cadastro biometrico nao pode mais ser retomado neste aparelho.'
    return
  }

  actionLoading.value = true
  actionError.value = ''

  try {
    await completePendingRegistration(currentRental.value.id)
  } catch (error) {
    await refreshAfterActionFailure(error, 'Falha ao retomar o cadastro biometrico deste aparelho.')
  } finally {
    actionLoading.value = false
  }
}

async function confirmInitialPayment() {
  if (!currentRental.value?.id) {
    actionError.value = 'Cadastre a biometria antes de confirmar o pagamento.'
    return
  }

  actionLoading.value = true
  actionError.value = ''

  try {
    const updatedRental = await api.post(`/rentals/${currentRental.value.id}/confirm-initial-payment`, {})
    currentRental.value = updatedRental
    persistPendingRentalId(updatedRental.id)
    lockerContext.value = {
      ...lockerContext.value,
      mode: 'retrieve',
      active_rental: updatedRental,
      locker: {
        ...lockerContext.value.locker,
        status: 'occupied'
      }
    }
  } catch (error) {
    await refreshAfterActionFailure(error, 'Falha ao confirmar o pagamento inicial deste locker.')
  } finally {
    actionLoading.value = false
  }
}

async function startStoring() {
  if (!currentRental.value?.id) {
    actionError.value = 'Este locker ainda nao esta pronto para iniciar a armazenagem.'
    return
  }

  actionLoading.value = true
  actionError.value = ''

  try {
    const updatedRental = await api.post(`/rentals/${currentRental.value.id}/start-storing`, {})
    currentRental.value = updatedRental
    retrievalResult.value = null
    clearPersistedPendingRentalId()
    lockerContext.value = {
      ...lockerContext.value,
      mode: 'retrieve',
      active_rental: updatedRental,
      locker: {
        ...lockerContext.value.locker,
        status: 'occupied'
      }
    }
    syncTimer()
  } catch (error) {
    await refreshAfterActionFailure(error, 'Falha ao iniciar a armazenagem deste locker.')
  } finally {
    actionLoading.value = false
  }
}

async function verifyAndRetrieve() {
  if (!activeRental.value?.id) {
    actionError.value = 'Este aluguel ainda nao esta pronto para autenticacao.'
    return
  }

  actionLoading.value = true
  actionError.value = ''

  try {
    const options = await api.post(`/rentals/${activeRental.value.id}/webauthn/authentication-options`)
    const credential = await authenticatePasskey(options)
    const result = await api.post(`/rentals/${activeRental.value.id}/retrieve`, { credential })

    retrievalResult.value = result
    currentRental.value = {
      ...activeRental.value,
      status: 'pending_retrieval_payment',
      retrieved_at: new Date().toISOString(),
      extra_charge_cents: result.extra_charge_cents,
      total_cents: result.total_cents
    }
    stopTimer()
  } catch (error) {
    await refreshAfterActionFailure(error, 'Falha ao validar a biometria para a retirada.')
  } finally {
    actionLoading.value = false
  }
}

async function confirmPayment() {
  if (!activeRental.value?.id) {
    actionError.value = 'Nao existe uma retirada pendente para este locker.'
    return
  }

  actionLoading.value = true
  actionError.value = ''

  try {
    const finished = await api.post(`/rentals/${activeRental.value.id}/confirm-retrieval`)
    currentRental.value = finished
    clearPersistedPendingRentalId()
    
    try {
      let activeRentals = JSON.parse(window.localStorage.getItem('fastlock.active_rentals') || '[]')
      activeRentals = activeRentals.filter(r => r.id !== activeRental.value.id)
      window.localStorage.setItem('fastlock.active_rentals', JSON.stringify(activeRentals))
    } catch (e) {}

    lockerContext.value = {
      ...lockerContext.value,
      mode: 'rent',
      active_rental: null,
      locker: {
        ...lockerContext.value.locker,
        status: 'free'
      }
    }
  } catch (error) {
    actionError.value = getApiErrorMessage(error, 'Nao foi possivel finalizar a retirada.')
  } finally {
    actionLoading.value = false
  }
}

async function refreshAfterActionFailure(error, fallback) {
  const message = isProbablyWebAuthnError(error)
    ? getWebAuthnErrorMessage(error, fallback)
    : getApiErrorMessage(error, fallback)

  await refreshContext({ preserveActionError: true })
  actionError.value = message
}

async function completePendingRegistration(rentalId) {
  const options = await api.post(`/rentals/${rentalId}/webauthn/registration-options`)
  const credential = await registerPasskey(options)
  const updatedRental = await api.post(`/rentals/${rentalId}/webauthn/registrations`, { credential })

  currentRental.value = updatedRental
  retrievalResult.value = null
  persistPendingRentalId(updatedRental.id)

  if (updatedRental.status === 'active') {
    lockerContext.value = {
      ...lockerContext.value,
      mode: 'retrieve',
      active_rental: updatedRental,
      locker: {
        ...lockerContext.value.locker,
        status: 'occupied'
      }
    }
  }

  syncTimer()
}

function syncTimer() {
  stopTimer()

  const unlockedAt = currentRental.value?.unlocked_at || lockerContext.value?.active_rental?.unlocked_at

  if (!unlockedAt) {
    elapsedSeconds.value = 0
    return
  }

  const startedAt = normalizeTimestampToNow(unlockedAt)

  if (!startedAt) {
    elapsedSeconds.value = 0
    return
  }

  const baseElapsed = Number.isFinite(currentRental.value?.elapsed_seconds)
    ? Number(currentRental.value.elapsed_seconds)
    : Math.max(0, Math.floor((Date.now() - startedAt) / 1000))

  const tick = () => {
    const delta = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
    elapsedSeconds.value = Math.max(baseElapsed, delta)
  }

  tick()
  timerInterval = window.setInterval(tick, 1000)
}

function stopTimer() {
  if (!timerInterval) {
    return
  }

  window.clearInterval(timerInterval)
  timerInterval = null
}

function getPendingRentalStorageKey() {
  return `fastlock.pending-rental.${lockerId.value}`
}

function loadPersistedPendingRentalId() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(getPendingRentalStorageKey()) || ''
}

/**
 * @param {string} rentalId
 */
function persistPendingRentalId(rentalId) {
  pendingActivationRentalId.value = rentalId

  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getPendingRentalStorageKey(), rentalId)
}

function clearPersistedPendingRentalId() {
  pendingActivationRentalId.value = ''

  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getPendingRentalStorageKey())
}

/**
 * @param {string} size
 * @returns {string}
 */
function sizeLabel(size) {
  return { P: 'Pequeno', M: 'Medio', G: 'Grande' }[size] || size
}

/**
 * @param {string | undefined} status
 * @returns {string}
 */
function statusLabel(status) {
  return {
    pending_registration: 'Biometria pendente',
    pending_activation_payment: 'Pagamento inicial',
    active: 'Pronto para fechar',
    storing: 'Em uso',
    pending_retrieval_payment: 'Pagamento pendente',
    finished: 'Finalizado',
    cancelled: 'Cancelado'
  }[status || ''] || 'Sem aluguel'
}

/**
 * @param {number} cents
 * @returns {string}
 */
function formatCents(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100)
}

/**
 * @param {number} minutes
 * @returns {string}
 */
function formatMinutes(minutes) {
  const total = Math.max(0, Number(minutes) || 0)
  if (!total) {
    return '< 1 min'
  }
  if (total < 60) {
    return `${total} min`
  }

  const hours = Math.floor(total / 60)
  const remainder = total % 60
  return remainder ? `${hours}h ${remainder}min` : `${hours}h`
}

/**
 * @param {any} error
 * @returns {boolean}
 */
function isProbablyWebAuthnError(error) {
  return !!error?.name && !error?.response
}
</script>
