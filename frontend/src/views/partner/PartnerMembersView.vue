<template>
  <PartnerLayout :org-id="orgId" page-title="Membros">
    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <BaseSpinner size="xl" color="brand" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
        <h1 class="text-2xl font-black text-slate-900">Membros da Equipe</h1>
          <p class="text-slate-400 text-sm mt-1">{{ members.length }} membro{{ members.length !== 1 ? 's' : '' }}</p>
        </div>
        <button
          id="btn-invite-member"
          @click="showInviteModal = true"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 transform duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          Convidar Membro
        </button>
      </div>

        <!-- Members table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100">
              <th class="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Membro</th>
              <th class="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Papel</th>
              <th class="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="members.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-400">Nenhum membro encontrado.</td>
              </tr>
              <tr
                v-for="member in members"
                :key="member.id"
                class="hover:bg-slate-50/60 transition-colors"
              >
                <!-- User -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
                    {{ memberInitial(member) }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ member.user?.full_name || '—' }}</p>
                    <p class="text-xs text-slate-400">{{ member.invite_email || member.user?.email || '—' }}</p>
                    </div>
                  </div>
                </td>
                <!-- Role -->
                <td class="px-6 py-4">
                  <BaseBadge :variant="roleVariant(member.role)">{{ roleLabel(member.role) }}</BaseBadge>
                </td>
                <!-- Status -->
                <td class="px-6 py-4">
                  <BaseBadge :variant="member.status === 'active' ? 'success' : member.status === 'invited' ? 'warning' : 'neutral'" dot>
                    {{ memberStatusLabel(member.status) }}
                  </BaseBadge>
                </td>
                <!-- Actions -->
                <td class="px-6 py-4 text-right">
                  <button
                    v-if="member.role !== 'owner'"
                    @click="openEditModal(member)"
                    class="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Invite Modal -->
    <BaseModal v-model="showInviteModal" title="Convidar Membro" max-width="sm">
      <div class="space-y-4">
            <div>
              <label for="invite-email" class="block text-sm font-medium text-slate-700 mb-2">E-mail *</label>
              <input
                id="invite-email"
                v-model="inviteForm.email"
                type="email"
                placeholder="colega@empresa.com"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-colors text-sm"
              />
        </div>
        <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Papel *</label>
          <div class="space-y-2">
            <button
              v-for="r in inviteRoles"
              :key="r.value"
              @click="inviteForm.role = r.value"
                :class="[
                'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors',
                inviteForm.role === r.value
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              ]"
            >
              <div :class="['w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5', inviteForm.role === r.value ? 'border-brand-500 bg-brand-500' : 'border-slate-300']" />
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ r.label }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ r.description }}</p>
              </div>
            </button>
          </div>
        </div>
            <div v-if="inviteError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ inviteError }}
            </div>
      </div>
      <template #footer>
        <button @click="showInviteModal = false" class="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
        <button
          id="btn-send-invite"
          @click="sendInvite"
          :disabled="!inviteForm.email || !inviteForm.role || isSending"
          class="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40"
        >
          <BaseSpinner v-if="isSending" size="xs" color="white" />
          {{ isSending ? 'Enviando...' : 'Enviar Convite' }}
        </button>
      </template>
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal v-model="showEditModal" title="Editar Membro" max-width="sm">
      <div v-if="editMember" class="space-y-4">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-100">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            {{ memberInitial(editMember) }}
          </div>
          <div>
            <p class="text-sm font-medium text-white">{{ editMember.user?.full_name || editMember.invite_email }}</p>
            <p class="text-xs text-slate-400">{{ editMember.invite_email || editMember.user?.email }}</p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Papel</label>
          <select
            v-model="editForm.role"
            class="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm"
          >
            <option value="admin">Administrador</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Status</label>
          <select
            v-model="editForm.status"
            class="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm"
          >
            <option value="active">Ativo</option>
            <option value="disabled">Desabilitado</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button @click="showEditModal = false" class="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        <button
          id="btn-save-member"
          @click="saveMember"
          :disabled="isUpdating"
          class="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors disabled:opacity-40"
        >
          <BaseSpinner v-if="isUpdating" size="xs" color="white" />
          {{ isUpdating ? 'Salvando...' : 'Salvar' }}
        </button>
      </template>
    </BaseModal>
  </PartnerLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  { value: 'viewer', label: 'Visualizador', description: 'Apenas visualização do dashboard e status de lockers' }
]

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
    const idx = members.value.findIndex(m => m.id === editMember.value.id)
    if (idx !== -1) members.value[idx] = result
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
  return { owner: 'Proprietário', admin: 'Administrador', viewer: 'Visualizador' }[role] || role
}

/** @param {string} status */
function memberStatusLabel(status) {
  return { active: 'Ativo', invited: 'Convidado', disabled: 'Desabilitado' }[status] || status
}

onMounted(async () => {
  const org = await fetchOrganization(orgId)
  if (org) setCurrentOrganization(org)
  await fetchMembers()
})
</script>
