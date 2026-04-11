<template>
  <div class="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
    <div class="max-w-2xl mx-auto">

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-24">
        <BaseSpinner size="xl" color="brand" />
      </div>

      <template v-else>
        <!-- User Profile Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-10">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-full border-4 border-white/30 overflow-hidden flex-shrink-0 bg-brand-700">
                <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="user?.full_name || 'Avatar'" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {{ initials }}
                </div>
              </div>
              <div>
                <h1 class="text-2xl font-black text-white leading-tight">
                  {{ user?.full_name || 'Usuário' }}
                </h1>
                <p class="text-brand-200 text-sm mt-0.5">{{ user?.email }}</p>
              </div>
            </div>
          </div>

          <div class="px-8 py-5 flex items-center justify-between border-b border-slate-100">
            <span class="text-sm text-slate-500">Conta Google vinculada</span>
            <BaseBadge variant="success-light" dot>Ativa</BaseBadge>
          </div>

          <div class="px-8 py-5 flex justify-end">
            <button
              @click="handleSignOut"
              :disabled="isSigningOut"
              id="btn-signout"
              class="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {{ isSigningOut ? 'Saindo...' : 'Sair da conta' }}
            </button>
          </div>
        </div>

        <!-- Organizations -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900">Minhas Organizações</h2>
            <button
              id="btn-create-org"
              @click="showCreateWizard = true"
              class="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-500 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nova Organização
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="activeOrganizations.length === 0" class="px-8 py-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <p class="text-slate-600 font-medium mb-1">Nenhuma organização ainda</p>
            <p class="text-slate-400 text-sm mb-5">Crie sua primeira organização para gerenciar lockers como parceiro</p>
            <button
              id="btn-create-first-org"
              @click="showCreateWizard = true"
              class="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30 transform duration-200"
            >
              Criar Organização
            </button>
          </div>

          <!-- Org list -->
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="membership in activeOrganizations"
              :key="membership.id"
              class="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {{ (membership.organization?.name || '?')[0].toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 text-sm">{{ membership.organization?.name }}</p>
                  <p class="text-xs text-slate-400">{{ membership.organization?.slug }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <BaseBadge :variant="roleVariant(membership.role)" variant-prefix="light">
                  {{ roleLabel(membership.role) }}
                </BaseBadge>
                <a
                  :href="`/partner/${membership.organization_id}/dashboard`"
                  class="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                >
                  Acessar
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Create org modal -->
    <CreateOrganizationModal v-model="showCreateWizard" @created="onOrgCreated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import CreateOrganizationModal from '@/components/organization/CreateOrganizationModal.vue'

const router = useRouter()
const { user, isAuthenticated, isInitializing, activeOrganizations, signOut } = useAuth()
const { success, error: toastError } = useToast()

const isLoading = ref(true)
const isSigningOut = ref(false)
const showCreateWizard = ref(false)

const initials = computed(() => {
  const name = user.value?.full_name || user.value?.email || '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

onMounted(async () => {
  if (!isInitializing.value) {
    isLoading.value = false
    if (!isAuthenticated.value) {
      router.replace('/login')
    }
  }
  // Wait for auth to initialize
  const unwatch = setInterval(() => {
    if (!isInitializing.value) {
      clearInterval(unwatch)
      isLoading.value = false
      if (!isAuthenticated.value) {
        router.replace('/login')
      }
    }
  }, 50)
})

async function handleSignOut() {
  isSigningOut.value = true
  try {
    await signOut()
    router.push('/')
  } catch (err) {
    toastError('Erro ao sair. Tente novamente.')
    isSigningOut.value = false
  }
}

/** @param {string} orgId */
function onOrgCreated(orgId) {
  showCreateWizard.value = false
  success('Organização criada com sucesso!')
  router.push(`/partner/${orgId}/dashboard`)
}

/** @param {string} role */
function roleVariant(role) {
  return { owner: 'brand-light', admin: 'info-light', viewer: 'neutral-light' }[role] || 'neutral-light'
}

/** @param {string} role */
function roleLabel(role) {
  return { owner: 'Proprietário', admin: 'Administrador', viewer: 'Visualizador' }[role] || role
}
</script>
