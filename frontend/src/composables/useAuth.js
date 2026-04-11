/**
 * @fileoverview Auth composable — singleton session state shared across the app.
 * Uses Supabase PKCE flow. Fetches /api/me to get user profile + org memberships.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { api } from '@/composables/useApi'

/**
 * @typedef {Object} AppUser
 * @property {string} id
 * @property {string|null} email
 * @property {string|null} full_name
 * @property {string|null} avatar_url
 */

/**
 * @typedef {Object} Membership
 * @property {string} id
 * @property {string} organization_id
 * @property {'owner'|'admin'|'viewer'} role
 * @property {'invited'|'active'|'disabled'} status
 * @property {{ id: string, name: string, slug: string }|null} organization
 */

// --- Singleton state (module-level) ---
/** @type {import('vue').Ref<any>} */
const session = ref(null)
/** @type {import('vue').Ref<AppUser|null>} */
const user = ref(null)
/** @type {import('vue').Ref<Membership[]>} */
const memberships = ref([])
/** @type {import('vue').Ref<boolean>} */
const isInitializing = ref(true)
let initialized = false

/**
 * @returns {{
 *   session: import('vue').Ref<any>,
 *   user: import('vue').Ref<AppUser|null>,
 *   memberships: import('vue').Ref<Membership[]>,
 *   isInitializing: import('vue').Ref<boolean>,
 *   isAuthenticated: import('vue').ComputedRef<boolean>,
 *   hasOrganizations: import('vue').ComputedRef<boolean>,
 *   activeOrganizations: import('vue').ComputedRef<Membership[]>,
 *   initializeAuth: () => Promise<void>,
 *   fetchMe: () => Promise<void>,
 *   signInWithGoogle: () => Promise<void>,
 *   signOut: () => Promise<void>
 * }}
 */
export function useAuth() {
  const isAuthenticated = computed(() => !!session.value)
  const activeOrganizations = computed(() =>
    memberships.value.filter(m => m.status === 'active')
  )
  const hasOrganizations = computed(() => activeOrganizations.value.length > 0)

  /**
   * Fetch /api/me and populate user + memberships
   * @returns {Promise<void>}
   */
  async function fetchMe() {
    if (!session.value) return
    try {
      const data = await api.get('/me')
      user.value = data.user || null
      memberships.value = data.memberships || []
    } catch (err) {
      console.error('[useAuth] fetchMe failed:', err)
    }
  }

  /**
   * Initialize auth once — idempotent
   * @returns {Promise<void>}
   */
  async function initializeAuth() {
    if (initialized) return
    initialized = true
    isInitializing.value = true
    try {
      const { data } = await supabase.auth.getSession()
      session.value = data.session
      user.value = data.session?.user ?? null

      if (session.value) {
        await fetchMe()
      }

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        if (newSession) {
          await fetchMe()
        } else {
          memberships.value = []
        }
      })
    } finally {
      isInitializing.value = false
    }
  }

  /** @returns {Promise<void>} */
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  /** @returns {Promise<void>} */
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    session.value = null
    user.value = null
    memberships.value = []
  }

  return {
    session,
    user,
    memberships,
    isInitializing,
    isAuthenticated,
    activeOrganizations,
    hasOrganizations,
    initializeAuth,
    fetchMe,
    signInWithGoogle,
    signOut
  }
}