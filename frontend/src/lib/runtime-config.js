function readRuntimeConfig() {
  if (typeof window === 'undefined') {
    return {}
  }

  return window.__APP_CONFIG__ || {}
}

const runtimeConfig = readRuntimeConfig()

export const runtimeApiBaseUrl = runtimeConfig.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '/api'
export const runtimeSupabaseUrl = runtimeConfig.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || ''
export const runtimeSupabasePublishableKey =
  runtimeConfig.supabasePublishableKey || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
export const runtimeSupabaseOAuthProvider =
  runtimeConfig.supabaseOAuthProvider || import.meta.env.VITE_SUPABASE_OAUTH_PROVIDER || 'google'
