import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

/**
 * @returns {boolean}
 */
export function isWebAuthnSupported() {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined'
}

/**
 * @param {any} optionsJSON
 * @returns {Promise<any>}
 */
export async function registerPasskey(optionsJSON) {
  assertWebAuthnSupported()
  return startRegistration({ optionsJSON })
}

/**
 * @param {any} optionsJSON
 * @returns {Promise<any>}
 */
export async function authenticatePasskey(optionsJSON) {
  assertWebAuthnSupported()
  return startAuthentication({ optionsJSON })
}

/**
 * @param {any} error
 * @param {string} fallback
 * @returns {string}
 */
export function getWebAuthnErrorMessage(error, fallback = 'Falha ao validar a biometria deste aparelho.') {
  const message = String(error?.message || '').trim()
  const name = String(error?.name || '').trim()

  if (!isWebAuthnSupported()) {
    return 'Este navegador nao suporta WebAuthn. Use um navegador atualizado no celular.'
  }

  if (name === 'NotAllowedError') {
    return 'A verificacao biometrica foi cancelada ou expirou. Tente novamente.'
  }

  if (name === 'InvalidStateError') {
    return 'Esta credencial ja esta registrada neste aparelho.'
  }

  if (name === 'NotSupportedError') {
    return 'O aparelho nao oferece um autenticador compativel com biometria para este fluxo.'
  }

  if (name === 'SecurityError') {
    return 'WebAuthn exige acesso seguro por HTTPS ou localhost.'
  }

  if (message) {
    return message
  }

  return fallback
}

function assertWebAuthnSupported() {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn nao esta disponivel neste navegador.')
  }
}
