/**
 * @fileoverview Axios API client with Supabase Bearer token injection.
 * Uses VITE_API_BASE_URL from environment.
 */

import axios from 'axios'
import { supabase } from '@/lib/supabase'
import { runtimeApiBaseUrl } from '@/lib/runtime-config'

const baseURL = runtimeApiBaseUrl

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Bearer Token from Supabase session
api.interceptors.request.use(
  async (config) => {
    if (!supabase) {
      return config
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
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
