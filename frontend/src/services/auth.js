import { supabase } from '@/lib/supabase'
import { runtimeSupabaseOAuthProvider } from '@/lib/runtime-config'

const defaultProvider = runtimeSupabaseOAuthProvider

export async function signInWithOAuth(provider = defaultProvider) {
  assertSupabaseConfigured()

  const redirectTo = `${window.location.origin}/oauth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo
    }
  })

  if (error) {
    throw error
  }

  return data
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    callback(null)
    return {
      data: {
        subscription: {
          unsubscribe() {}
        }
      }
    }
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

export async function getCurrentSession() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export async function getAccessToken() {
  const session = await getCurrentSession()
  return session?.access_token
}

export async function signOut() {
  assertSupabaseConfigured()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

function assertSupabaseConfigured() {
  if (!supabase) {
    throw new Error('Supabase Auth is not configured.')
  }
}
