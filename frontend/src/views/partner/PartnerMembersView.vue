<template>
  <PartnerLayout :org-id="orgId" page-title="Membros">
    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <BaseSpinner size="xl" color="brand" />
    </div>

    <template v-else>
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Equipe</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Membros da equipe</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Convide colaboradores, revise papeis e acompanhe quem ainda precisa aceitar o acesso da organizacao.
          </p>
        </div>

        <button
          id="btn-invite-member"
          type="button"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-md sm:w-auto"
          @click="showInviteModal = true"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Convidar membro
        </button>
      </div>

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ members.length }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ativos</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ activeMembersCount }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Convites pendentes</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">{{ invitedMembersCount }}</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-4 sm:px-6">
          <p class="text-sm font-bold text-slate-800">Acessos da organizacao</p>
          <p class="mt-1 text-xs leading-5 text-slate-400">O convite continua visivel ate que o membro aceite ou seja desativado.</p>
        </div>

        <div v-if="members.length === 0" class="px-6 py-12 text-center">
          <p class="text-sm font-semibold text-slate-600">Nenhum membro encontrado.</p>
          <p class="mt-1 text-sm text-slate-400">Envie um convite para iniciar a equipe desta organizacao.</p>
        </div>

        <template v-else>
          <div class="divide-y divide-slate-100 sm:hidden">
            <article
              v-for="member in members"
              :key="member.id"
              class="space-y-4 px-4 py-4"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {{ memberInitial(member) }}
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ member.user?.full_name || '—' }}</p>
                  <p class="mt-1 truncate text-xs text-slate-400">{{ member.invite_email || member.user?.email || '—' }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <BaseBadge :variant="roleVariant(member.role)">{{ roleLabel(member.role) }}</BaseBadge>
                <BaseBadge :variant="member.status === 'active' ? 'success' : member.status === 'invited' ? 'warning' : 'neutral'" dot>
                  {{ memberStatusLabel(member.status) }}
                </BaseBadge>
              </div>

              <button
                v-if="member.role !== 'owner'"
                type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                @click="openEditModal(member)"
              >
                Editar membro
              </button>
            </article>
          </div>

          <div class="hidden overflow-x-auto sm:block">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Membro</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Papel</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Acoes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="member in members"
                  :key="member.id"
                  class="transition-colors hover:bg-slate-50/60"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {{ memberInitial(member) }}
                      </div>
                      <div class="min-w-0">
                        <p class="truncate font-medium text-slate-900">{{ member.user?.full_name || '—' }}</p>
                        <p class="truncate text-xs text-slate-400">{{ member.invite_email || member.user?.email || '—' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <BaseBadge :variant="roleVariant(member.role)">{{ roleLabel(member.role) }}</BaseBadge>
                  </td>
                  <td class="px-6 py-4">
                    <BaseBadge :variant="member.status === 'active' ? 'success' : member.status === 'invited' ? 'warning' : 'neutral'" dot>
                      {{ memberStatusLabel(member.status) }}
                    </BaseBadge>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      v-if="member.role !== 'owner'"
                      type="button"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      @click="openEditModal(member)"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </template>

    <BaseModal v-model="showInviteModal" title="Convidar membro" max-width="sm">
      <div class="space-y-4">
        <div>
          <label for="invite-email" class="mb-2 block text-sm font-medium text-slate-700">E-mail *</label>
          <input
            id="invite-email"
            v-model="inviteForm.email"
            type="email"
            name="invite_email"
            autocomplete="email"
            spellcheck="false"
            placeholder="colega@empresa.com"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Papel *</label>
          <div class="space-y-2">
            <button
              v-for="role in inviteRoles"
              :key="role.value"
              type="button"
              class="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors"
              :class="inviteForm.role === role.value ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="inviteForm.role = role.value"
            >
              <div :class="['mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2', inviteForm.role === role.value ? 'border-brand-500 bg-brand-500' : 'border-slate-300']" />
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ role.label }}</p>
                <p class="mt-0.5 text-xs text-slate-500">{{ role.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <div v-if="inviteError" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {{ inviteError }}
        </div>
      </div>

      <template #footer>
        <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600" @click="showInviteModal = false">
          Cancelar
        </button>
        <button
          id="btn-send-invite"
          type="button"
          class="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-40"
          :disabled="!inviteForm.email || !inviteForm.role || isSending"
          @click="sendInvite"
        >
          <BaseSpinner v-if="isSending" size="xs" color="white" />
          {{ isSending ? 'Enviando...' : 'Enviar convite' }}
        </button>
      </template>
    </BaseModal>

    <BaseModal v-model="showEditModal" title="Editar membro" max-width="sm">
      <div v-if="editMember" class="space-y-4">
        <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {{ memberInitial(editMember) }}
          </div>
          <div>
            <p class="text-sm font-medium text-slate-900">{{ editMember.user?.full_name || editMember.invite_email }}</p>
            <p class="text-xs text-slate-500">{{ editMember.invite_email || editMember.user?.email }}</p>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Papel</label>
          <select
            v-model="editForm.role"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="admin">Administrador</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            v-model="editForm.status"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="active">Ativo</option>
            <option value="disabled">Desabilitado</option>
          </select>
        </div>
      </div>

      <template #footer>
        <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700" @click="showEditModal = false">
          Cancelar
        </button>
        <button
          id="btn-save-member"
          type="button"
          class="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-40"
          :disabled="isUpdating"
          @click="saveMember"
        >
          <BaseSpinner v-if="isUpdating" size="xs" color="white" />
          {{ isUpdating ? 'Salvando...' : 'Salvar' }}
        </button>
      </template>
    </BaseModal>
  </PartnerLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/composables/useApi'
import { useOrganization } from '@/composables/useOrganization'
import { useToast } from '@/composables/useToast'
import PartnerLayout from '@/components/layout/PartnerLayout.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const route = useRoute()
const orgId = route.params.orgId
const { fetchOrganization, setCurrentOrganization } = useOrganization()
const { success, error: toastError } = useToast()

/** @type {import('vue').Ref<any[]>} */
const members = ref([])
const isLoading = ref(true)
const showInviteModal = ref(false)
const showEditModal = ref(false)
const isSending = ref(false)
const isUpdating = ref(false)
const inviteError = ref('')
const inviteForm = ref({ email: '', role: 'viewer' })
/** @type {import('vue').Ref<any|null>} */
const editMember = ref(null)
const editForm = ref({ role: '', status: '' })

const inviteRoles = [
  { value: 'admin', label: 'Administrador', description: 'Pode gerenciar lockers, ver dashboard e convidar membros' },
  { value: 'viewer', label: 'Visualizador', description: 'Apenas visualizacao do dashboard e status de lockers' }
]

const activeMembersCount = computed(() =>
  members.value.filter((member) => member.status === 'active').length
)

const invitedMembersCount = computed(() =>
  members.value.filter((member) => member.status === 'invited').length
)

async function fetchMembers() {
  isLoading.value = true

  try {
    const res = await api.get(`/organizations/${orgId}/memberships`)
    members.value = res.data || []
  } catch (err) {
    toastError('Falha ao carregar membros.')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function sendInvite() {
  isSending.value = true
  inviteError.value = ''

  try {
    const result = await api.post(`/organizations/${orgId}/memberships`, {
      email: inviteForm.value.email.trim().toLowerCase(),
      role: inviteForm.value.role
    })

    members.value.push(result)
    showInviteModal.value = false
    success('Convite enviado com sucesso!')
    inviteForm.value = { email: '', role: 'viewer' }
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    inviteError.value = msg || 'Erro ao enviar convite.'
  } finally {
    isSending.value = false
  }
}

/** @param {any} member */
function openEditModal(member) {
  editMember.value = member
  editForm.value = { role: member.role, status: member.status }
  showEditModal.value = true
}

async function saveMember() {
  if (!editMember.value) return

  isUpdating.value = true

  try {
    const result = await api.patch(`/organizations/${orgId}/memberships/${editMember.value.id}`, {
      role: editForm.value.role,
      status: editForm.value.status
    })

    const index = members.value.findIndex((member) => member.id === editMember.value.id)
    if (index !== -1) {
      members.value[index] = result
    }

    showEditModal.value = false
    success('Membro atualizado com sucesso!')
  } catch (err) {
    toastError('Falha ao atualizar membro.')
    console.error(err)
  } finally {
    isUpdating.value = false
  }
}

/** @param {any} member */
function memberInitial(member) {
  const name = member.user?.full_name || member.invite_email || '?'
  return name[0].toUpperCase()
}

/** @param {string} role */
function roleVariant(role) {
  return { owner: 'brand', admin: 'info', viewer: 'neutral' }[role] || 'neutral'
}

/** @param {string} role */
function roleLabel(role) {
  return { owner: 'Proprietario', admin: 'Administrador', viewer: 'Visualizador' }[role] || role
}

/** @param {string} status */
function memberStatusLabel(status) {
  return { active: 'Ativo', invited: 'Convidado', disabled: 'Desabilitado' }[status] || status
}

function closeTransientUi() {
  showInviteModal.value = false
  showEditModal.value = false
  inviteError.value = ''
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    closeTransientUi()
  }
}

function handleWindowFocus() {
  closeTransientUi()
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)

  const org = await fetchOrganization(orgId)
  if (org) {
    setCurrentOrganization(org)
  }

  await fetchMembers()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>
