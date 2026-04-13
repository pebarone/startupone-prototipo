/**
 * Extract a readable API error message from Axios/Fastify problem responses.
 * @param {any} error
 * @param {string} fallback
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = 'Ocorreu um erro inesperado.') {
  const data = error?.response?.data

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail.trim()
  }

  if (Array.isArray(data?.errors) && data.errors.length) {
    const firstMessage = data.errors.find((item) => typeof item?.message === 'string')?.message
    if (firstMessage) {
      return firstMessage
    }
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim()
  }

  if (typeof error?.message === 'string' && error.message.trim() && error.message !== 'Network Error') {
    return error.message.trim()
  }

  return fallback
}
