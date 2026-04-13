import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type RegistrationResponseJSON,
  type WebAuthnCredential
} from "@simplewebauthn/server";
import { env, parseWebAuthnAllowedOrigins } from "../../config/env";
import { internalError } from "../../errors";

const CEREMONY_TIMEOUT_MS = 60_000;
const CHALLENGE_TTL_MS = 5 * 60_000;

function getExpectedOrigins(): string[] {
  const origins = parseWebAuthnAllowedOrigins();

  if (!origins.length) {
    throw internalError("WebAuthn allowed origins are not configured.");
  }

  return origins;
}

export function getWebAuthnChallengeExpiry(): Date {
  return new Date(Date.now() + CHALLENGE_TTL_MS);
}

export async function buildRegistrationOptions(
  rentalId: string,
  excludeCredentials: { id: string; transports?: string[] }[]
) {
  const options = await generateRegistrationOptions({
    rpName: env.WEBAUTHN_RP_NAME,
    rpID: env.WEBAUTHN_RP_ID,
    userName: `rental-${rentalId}`,
    userDisplayName: `Rental ${rentalId.slice(0, 8)}`,
    userID: Buffer.from(`rental:${rentalId}`, "utf8"),
    timeout: CEREMONY_TIMEOUT_MS,
    attestationType: "none",
    excludeCredentials: excludeCredentials.map((credential) => ({
      id: credential.id,
      transports: normalizeTransports(credential.transports)
    })),
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "discouraged",
      userVerification: "required"
    },
    preferredAuthenticatorType: "localDevice"
  });

  return options;
}

export async function buildAuthenticationOptions(credential: {
  id: string;
  transports?: string[];
}) {
  const options = await generateAuthenticationOptions({
    rpID: env.WEBAUTHN_RP_ID,
    timeout: CEREMONY_TIMEOUT_MS,
    userVerification: "required",
    allowCredentials: [
      {
        id: credential.id,
        transports: normalizeTransports(credential.transports)
      }
    ]
  });

  return options;
}

export async function verifyRentalRegistration(
  credential: RegistrationResponseJSON,
  expectedChallenge: string
) {
  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: getExpectedOrigins(),
    expectedRPID: env.WEBAUTHN_RP_ID,
    requireUserVerification: true
  });

  if (!verification.verified) {
    return null;
  }

  return {
    credential_id: verification.registrationInfo.credential.id,
    public_key: Buffer.from(verification.registrationInfo.credential.publicKey),
    counter: verification.registrationInfo.credential.counter,
    transports: normalizeTransports(credential.response.transports),
    device_type: verification.registrationInfo.credentialDeviceType,
    backed_up: verification.registrationInfo.credentialBackedUp
  };
}

export async function verifyRentalAuthentication(
  credential: AuthenticationResponseJSON,
  expectedChallenge: string,
  storedCredential: {
    id: string;
    public_key: Buffer;
    counter: number;
    transports?: string[];
  }
) {
  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: getExpectedOrigins(),
    expectedRPID: env.WEBAUTHN_RP_ID,
    requireUserVerification: true,
    credential: toStoredCredential(storedCredential)
  });

  if (!verification.verified) {
    return null;
  }

  return {
    new_counter: verification.authenticationInfo.newCounter,
    device_type: verification.authenticationInfo.credentialDeviceType,
    backed_up: verification.authenticationInfo.credentialBackedUp
  };
}

function toStoredCredential(input: {
  id: string;
  public_key: Buffer;
  counter: number;
  transports?: string[];
}): WebAuthnCredential {
  return {
    id: input.id,
    publicKey: new Uint8Array(input.public_key),
    counter: input.counter,
    transports: normalizeTransports(input.transports)
  };
}

function normalizeTransports(transports?: string[]): AuthenticatorTransportFuture[] | undefined {
  if (!transports?.length) {
    return undefined;
  }

  return transports.filter(Boolean) as AuthenticatorTransportFuture[];
}
