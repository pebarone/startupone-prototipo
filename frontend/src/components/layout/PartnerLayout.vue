<template>
  <div class="min-h-screen flex" style="background: #f8faf9;">

    <!-- ─── Sidebar ─── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex flex-col transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
        sidebarOpen ? 'w-60' : 'w-[68px]',
        'bg-white border-r border-slate-100 shadow-sm'
      ]"
    >
      <!-- Logo row -->
      <div class="flex items-center h-[60px] px-4 border-b border-slate-100 flex-shrink-0 gap-3">
        <router-link to="/" class="flex items-center gap-2.5 min-w-0 group">
          <div class="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 transition-colors duration-200">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span v-show="sidebarOpen" class="font-heading font-black text-slate-900 tracking-tight truncate text-[15px]">
            Fast<span class="text-brand-600">Lock</span>
          </span>
        </router-link>

        <button
          v-show="sidebarOpen"
          @click="sidebarOpen = false"
          class="ml-auto p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7"/>
          </svg>
        </button>

        <button
          v-show="!sidebarOpen"
          @click="sidebarOpen = true"
          class="ml-auto p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Org badge -->
      <div v-if="currentOrganization" class="px-3 pt-3 pb-1">
        <div
          :class="[
            'rounded-xl p-2.5 transition-all duration-200',
            sidebarOpen ? 'bg-brand-50 border border-brand-100' : 'flex justify-center'
          ]"
        >
          <div v-if="sidebarOpen">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-brand-500 mb-0.5">Organização</p>
            <p class="text-sm font-bold text-slate-800 truncate">{{ currentOrganization.name }}</p>
            <p v-if="roleLabel" class="text-xs text-brand-600 font-medium mt-0.5">{{ roleLabel }}</p>
          </div>
          <div v-else class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <span class="text-xs font-bold text-brand-700">{{ currentOrganization.name[0].toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <SidebarLink :to="`/partner/${orgId}/dashboard`" :collapsed="!sidebarOpen" icon="chart" label="Dashboard" />
        <SidebarLink :to="`/partner/${orgId}/lockers`" :collapsed="!sidebarOpen" icon="locker" label="Lockers" />
        <SidebarLink v-if="canAdmin" :to="`/partner/${orgId}/members`" :collapsed="!sidebarOpen" icon="users" label="Membros" />
      </nav>

      <!-- Divider -->
      <div class="mx-3 border-t border-slate-100" />

      <!-- User section -->
      <div class="p-3">
        <div
          v-if="user"
          class="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group relative"
          :class="sidebarOpen ? '' : 'justify-center'"
          @click="userMenuOpen = !userMenuOpen"
        >
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-100">
            <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {{ initials }}
            </div>
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ user.full_name || user.email }}</p>
            <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
          </div>
          <svg v-if="sidebarOpen" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
          </svg>

          <!-- Dropdown -->
          <Transition name="dropdown">
            <div
              v-if="userMenuOpen"
              class="absolute bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]"
            >
              <router-link to="/account" @click="userMenuOpen = false" class="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Minha Conta
              </router-link>
              <button @click="handleSignOut" class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sair
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </aside>

    <!-- ─── Main content area ─── -->
    <div :class="['flex-1 flex flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]', sidebarOpen ? 'ml-60' : 'ml-[68px]']">

      <!-- Top header bar -->
      <header class="h-[60px] bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-400 font-medium">{{ currentOrganization?.name }}</span>
          <svg class="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="text-slate-800 font-semibold">{{ pageTitle }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="roleLabel"
            class="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100"
          >
            {{ roleLabel }}
          </span>
          <button
            class="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Page slot -->
      <main class="flex-1 p-6 lg:p-8 max-w-screen-xl mx-auto w-full">
        <slot />
      </main>
    </div>

    <!-- Mobile backdrop -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-30 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOrganization } from '@/composables/useOrganization'

const props = defineProps({
  orgId: { type: String, required: true },
  pageTitle: { type: String, default: '' }
})

const router = useRouter()
const { user, signOut } = useAuth()
const { currentOrganization, canAdmin } = useOrganization()

const sidebarOpen = ref(true)
const userMenuOpen = ref(false)
const isMobile = ref(false)

const initials = computed(() => {
  const name = user.value?.full_name || user.value?.email || '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

const roleLabel = computed(() => {
  const role = currentOrganization.value?.current_membership?.role
  return { owner: 'Proprietário', admin: 'Administrador', viewer: 'Visualizador' }[role] || ''
})

async function handleSignOut() {
  userMenuOpen.value = false
  await signOut()
  router.push('/')
}

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) sidebarOpen.value = false
}

onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })
</script>

<script>
import { defineComponent, h, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const icons = {
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  locker: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
}

export const SidebarLink = defineComponent({
  name: 'SidebarLink',
  props: {
    to: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    collapsed: { type: Boolean, default: false }
  },
  setup(props) {
    const route = useRoute()
    const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + '/'))

    return () => h(RouterLink, {
      to: props.to,
      class: [
        'flex items-center h-9 rounded-xl transition-all duration-150 active:scale-[0.98]',
        props.collapsed ? 'w-9 justify-center mx-auto' : 'gap-3 px-3',
        isActive.value
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
      ].join(' ')
    }, () => [
      h('svg', {
        class: 'flex-shrink-0 w-[18px] h-[18px]',
        fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24'
      }, [h('path', {
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: icons[props.icon] || ''
      })]),
      !props.collapsed ? h('span', { class: 'text-sm font-semibold truncate' }, props.label) : null
    ])
  }
})
</script>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.15s cubic-bezier(0.23, 1, 0.32, 1), transform 0.15s cubic-bezier(0.23, 1, 0.32, 1);
}
.dropdown-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}
</style>
