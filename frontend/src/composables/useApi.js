/**
 * @fileoverview Axios API client with Supabase Bearer token injection.
 * Uses VITE_API_BASE_URL from environment.
 */

import axios from 'axios'
import { supabase } from '@/lib/supabase'
import { runtimeApiBaseUrl } from '@/lib/runtime-config'

const baseURL = runtimeApiBaseUrl
let accessToken = null

/**
 * Keep an in-memory token so requests do not block on getSession locks.
 * @param {string|null|undefined} nextToken
 */
export function setApiAccessToken(nextToken) {
  accessToken = nextToken || null
}

if (supabase) {
  void supabase.auth.getSession().then(({ data }) => {
    setApiAccessToken(data.session?.access_token)
  }).catch((err) => {
    console.warn('[API] Unable to prime access token from session.', err)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    setApiAccessToken(session?.access_token)
  })
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Bearer token from in-memory auth state.
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Unwrap response data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || error.message
    console.error('[API Error]:', msg)
    return Promise.reject(error)
  }
)
