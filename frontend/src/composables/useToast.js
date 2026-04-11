import { ref } from 'vue'

/**
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 * @typedef {{ id: number, type: ToastType, message: string }} Toast
 */

/** @type {import('vue').Ref<Toast[]>} */
const toasts = ref([])
let nextId = 0

/**
 * Show a toast notification
 * @param {string} message
 * @param {ToastType} [type='info']
 * @param {number} [duration=4000]
 */
export function toast(message, type = 'info', duration = 4000) {
  const id = ++nextId
  toasts.value.push({ id, type, message })
  setTimeout(() => dismiss(id), duration)
}

/** @param {number} id */
export function dismiss(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

export function useToast() {
  return {
    toasts,
    toast,
    dismiss,
    success: (msg) => toast(msg, 'success'),
    error: (msg) => toast(msg, 'error'),
    warning: (msg) => toast(msg, 'warning'),
    info: (msg) => toast(msg, 'info')
  }
}
