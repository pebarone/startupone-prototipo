import { createRouter, createWebHistory } from 'vue-router'

// Views
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import AccountView from './views/AccountView.vue'
import AuthCallbackView from './views/AuthCallbackView.vue'
import UseView from './views/UseView.vue'
import RetrieveView from './views/RetrieveView.vue'

// Partner views (lazy loaded)
const PartnerDashboardView = () => import('./views/partner/PartnerDashboardView.vue')
const PartnerLockersView = () => import('./views/partner/PartnerLockersView.vue')
const PartnerLocationsView = () => import('./views/partner/PartnerLocationsView.vue')
const PartnerMembersView = () => import('./views/partner/PartnerMembersView.vue')
const PartnerAuditView = () => import('./views/partner/PartnerAuditView.vue')

const routes = [
  // --- Public routes ---
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/use',
    name: 'use',
    component: UseView
  },
  {
    path: '/retrieve/:rentalId',
    name: 'retrieve',
    component: RetrieveView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { hideForAuth: true }
  },

  // --- Auth callbacks ---
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackView
  },
  {
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: AuthCallbackView
  },

  // --- Authenticated routes ---
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    meta: { requiresAuth: true }
  },

  // --- Partner routes (org-scoped) ---
  {
    path: '/partner',
    redirect: '/account'
  },
  {
    path: '/partner/:orgId/dashboard',
    name: 'partner-dashboard',
    component: PartnerDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/partner/:orgId/lockers',
    name: 'partner-lockers',
    component: PartnerLockersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/partner/:orgId/locations',
    name: 'partner-locations',
    component: PartnerLocationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/partner/:orgId/members',
    name: 'partner-members',
    component: PartnerMembersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/partner/:orgId/audit',
    name: 'partner-audit',
    component: PartnerAuditView,
    meta: { requiresAuth: true }
  },

  // --- Catch-all ---
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

// Route guards
router.beforeEach(async (to) => {
  const { supabase } = await import('./lib/supabase.js')
  if (!supabase) return true

  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Redirect authenticated users away from /login
  if (to.meta.hideForAuth && isAuthenticated) {
    return { name: 'account' }
  }

  // Redirect unauthenticated users away from protected routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
