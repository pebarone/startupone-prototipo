/**
 * @fileoverview Organization context composable — manages the currently active org.
 */

import { ref, computed } from 'vue'
import { api } from '@/composables/useApi'

/**
 * @typedef {Object} Organization
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {'active'|'inactive'} status
 * @property {{ id: string, role: string, status: string }|null} current_membership
 */

const STORAGE_KEY = 'fastlock:activeOrgId'

/** @type {import('vue').Ref<Organization|null>} */
const currentOrganization = ref(null)
/** @type {import('vue').Ref<boolean>} */
const isLoadingOrg = ref(false)

/**
 * @returns {{
 *   currentOrganization: import('vue').Ref<Organization|null>,
 *   isLoadingOrg: import('vue').Ref<boolean>,
 *   currentOrgId: import('vue').ComputedRef<string|null>,
 *   currentRole: import('vue').ComputedRef<string|null>,
 *   canAdmin: import('vue').ComputedRef<boolean>,
 *   fetchOrganization: (orgId: string) => Promise<Organization|null>,
 *   setCurrentOrganization: (org: Organization) => void,
 *   clearCurrentOrganization: () => void,
 *   restoreFromStorage: () => string|null
 * }}
 */
export function useOrganization() {
  const currentOrgId = computed(() => currentOrganization.value?.id ?? null)
  const currentRole = computed(() => currentOrganization.value?.current_membership?.role ?? null)
  const canAdmin = computed(() => {
    const role = currentRole.value
    return role === 'owner' || role === 'admin'
  })

  /**
   * Fetch organization details from the API
   * @param {string} orgId
   * @returns {Promise<Organization|null>}
   */
  async function fetchOrganization(orgId) {
    isLoadingOrg.value = true
    try {
      const data = await api.get(`/organizations/${orgId}`)
      return data
    } catch (err) {
      console.error('[useOrganization] fetchOrganization failed:', err)
      return null
    } finally {
      isLoadingOrg.value = false
    }
  }

  /**
   * Set the active organization and persist to localStorage
   * @param {Organization} org
   */
  function setCurrentOrganization(org) {
    currentOrganization.value = org
    localStorage.setItem(STORAGE_KEY, org.id)
  }

  /** Clear active org */
  function clearCurrentOrganization() {
    currentOrganization.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Try to restore saved org id from localStorage
   * @returns {string|null}
   */
  function restoreFromStorage() {
    return localStorage.getItem(STORAGE_KEY)
  }

  return {
    currentOrganization,
    isLoadingOrg,
    currentOrgId,
    currentRole,
    canAdmin,
    fetchOrganization,
    setCurrentOrganization,
    clearCurrentOrganization,
    restoreFromStorage
  }
}
