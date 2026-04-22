import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

/**
 * @returns {{ supported: boolean, hasPublicKeyCredential: boolean, secureContext: boolean, origin: string }}
 */
export function getWebAuthnSupportState() {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      hasPublicKeyCredential: false,
      secureContext: false,
      origin: ''
    }
  }

  const hasPublicKeyCredential = typeof window.PublicKeyCredential !== 'undefined'
  const secureContext = window.isSecureContext === true

  return {
    supported: hasPublicKeyCredential && secureContext,
    hasPublicKeyCredential,
    secureContext,
    origin: window.location.origin
  }
}

/**
 * @returns {boolean}
 */
export function isWebAuthnSupported() {
  return getWebAuthnSupportState().supported
}

/**
 * @returns {string}
 */
export function getWebAuthnSupportHint() {
  const state = getWebAuthnSupportState()

  if (!state.hasPublicKeyCredential) {
    return 'Este navegador nao oferece a API WebAuthn. Use Chrome, Edge ou outro navegador atualizado.'
  }

  if (!state.secureContext) {
    return `WebAuthn exige HTTPS ou localhost. Origem atual: ${state.origin || 'desconhecida'}.`
  }

  return ''
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
  const supportHint = getWebAuthnSupportHint()

  if (!isWebAuthnSupported()) {
    return supportHint || 'Este navegador nao suporta WebAuthn. Use um navegador atualizado no celular.'
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
    return supportHint || 'WebAuthn exige acesso seguro por HTTPS ou localhost.'
  }

  if (message) {
    return message
  }

  return fallback
}

function assertWebAuthnSupported() {
  if (!isWebAuthnSupported()) {
    throw new Error(getWebAuthnSupportHint() || 'WebAuthn nao esta disponível neste navegador.')
  }
}
