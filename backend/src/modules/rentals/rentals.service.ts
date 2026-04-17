import { randomInt } from "node:crypto";
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/server";
import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { conflictError, internalError, isPgError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import {
  cancelLiveRentalById,
  clearPendingWebAuthnChallenges,
  confirmRentalInitialPaymentById,
  deleteAuditEventsByRentalIds,
  deleteRentalHistoryByIds,
  deleteUnlockEventsByRentalIds,
  findOpenWebAuthnLookupChallengeByChallengeForUpdate,
  findLockerForRentalUpdate,
  findLocationPricing,
  findOpenWebAuthnChallengeForUpdate,
  findPendingActivationPaymentRentalByIdForUpdate,
  findRentalById,
  findRentalForRegistrationByIdForUpdate,
  findRentalRecordById,
  findRentalHistoryDeleteCandidatesForUpdate,
  findRentalWebAuthnCredentialByRentalId,
  findRetrievableCredentialByCredentialIdForUpdate,
  findStoringRentalByIdForUpdate,
  finishRentalById,
  insertRentalWithStatus,
  insertWebAuthnChallenge,
  insertWebAuthnLookupChallenge,
  listRentalsByOrg,
  listRetrievableWebAuthnCredentials,
  markRentalPendingActivationPaymentById,
  markLockerFreeById,
  markLockerOccupied,
  markWebAuthnChallengeUsed,
  markWebAuthnLookupChallengeUsed,
  setRentalRetrievalCharges,
  startRentalStoringById,
  updateRentalWebAuthnCounter,
  upsertRentalWebAuthnCredential
} from "./rentals.repository";
import type {
  Rental,
  RentalWithLocker,
  RetrievalResult
} from "./rentals.schemas";
import {
  buildAuthenticationOptions,
  buildRegistrationOptions,
  extractAuthenticationChallenge,
  getWebAuthnChallengeExpiry,
  verifyRentalAuthentication,
  verifyRentalRegistration
} from "./rentals.webauthn";

const ACCESS_CODE_ATTEMPTS = 10;
const RENTAL_HISTORY_DELETABLE_STATUSES = new Set(["finished", "cancelled"]);

const DEFAULT_RATES: Record<string, number> = {
  P: 500,
  M: 1000,
  G: 1500
};

export async function createRentalService(
  lockerId: string,
  paymentConfirmed: boolean,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const locker = await findLockerForRentalUpdate(lockerId, client);

    if (!locker) {
      throw notFoundError("Locker not found.");
    }

    if (locker.status !== "free") {
      throw conflictError("Locker is not available.");
    }

    let initialFeeCents = 500;
    let hourlyRateCents = DEFAULT_RATES[locker.size] ?? 500;

    if (locker.location_id) {
      const pricing = await findLocationPricing(locker.location_id, client);
      if (pricing) {
        initialFeeCents = pricing.initial_fee_cents;
        const rateMap: Record<string, number> = {
          P: pricing.hourly_rate_small,
          M: pricing.hourly_rate_medium,
          G: pricing.hourly_rate_large
        };
        hourlyRateCents = rateMap[locker.size] ?? hourlyRateCents;
      }
    }

    let rental: Rental | null = null;

    for (let attempt = 0; attempt < ACCESS_CODE_ATTEMPTS; attempt += 1) {
      rental = await insertRentalWithStatus(
        locker.organization_id,
        lockerId,
        generateAccessCode(),
        initialFeeCents,
        hourlyRateCents,
        paymentConfirmed ? "active" : "pending_registration",
        client
      );

      if (rental) {
        break;
      }
    }

    if (!rental) {
      throw internalError("Could not create a live rental for this locker.");
    }

    if (paymentConfirmed) {
      await markLockerOccupied(lockerId, client);
    }

    await recordAuditEvent(
      {
        ...context,
        organization_id: locker.organization_id,
        action: "rental.created",
        resource_type: "rental",
        resource_id: rental.id,
        metadata: {
          locker_id: lockerId,
          status: rental.status,
          payment_confirmed: paymentConfirmed,
          initial_fee_cents: rental.initial_fee_cents,
          hourly_rate_cents: rental.hourly_rate_cents
        }
      },
      client
    );

    return rental;
  });
}

export async function getRentalByIdService(id: string): Promise<RentalWithLocker> {
  const rental = await findRentalById(id);

  if (!rental) {
    throw notFoundError("Rental not found.");
  }

  return rental;
}

export async function createRegistrationOptionsService(
  rentalId: string,
  context: RequestContext
) {
  return withTransaction(async (client) => {
    const rental = await findRentalForRegistrationByIdForUpdate(rentalId, client);

    if (!rental) {
      throw validationError("Rental not found or is not waiting for WebAuthn registration.");
    }

    const existingCredential = await findRentalWebAuthnCredentialByRentalId(rentalId, client);
    const options = await buildRegistrationOptions(
      rentalId,
      existingCredential
        ? [{ id: existingCredential.credential_id, transports: existingCredential.transports }]
        : []
    );

    await clearPendingWebAuthnChallenges(rentalId, "registration", client);
    await insertWebAuthnChallenge(
      {
        rental_id: rentalId,
        purpose: "registration",
        challenge: options.challenge,
        expires_at: getWebAuthnChallengeExpiry(),
        ip_address: context.ip_address,
        user_agent: context.user_agent
      },
      client
    );

    return options;
  });
}

export async function completeRegistrationService(
  rentalId: string,
  credential: RegistrationResponseJSON,
  context: RequestContext
): Promise<Rental> {
  try {
    return await withTransaction(async (client) => {
      const rental = await findRentalForRegistrationByIdForUpdate(rentalId, client);

      if (!rental) {
        throw validationError("Rental not found or is not waiting for WebAuthn registration.");
      }

      const challenge = await findOpenWebAuthnChallengeForUpdate(rentalId, "registration", client);

      if (!challenge || challenge.expires_at.getTime() <= Date.now()) {
        throw validationError("The WebAuthn registration challenge has expired. Generate a new challenge.");
      }

      const verified = await verifyRentalRegistration(credential, challenge.challenge);

      if (!verified) {
        throw validationError("The WebAuthn registration response could not be verified.");
      }

      await upsertRentalWebAuthnCredential(
        {
          rental_id: rentalId,
          organization_id: rental.organization_id,
          locker_id: rental.locker_id,
          credential_id: verified.credential_id,
          public_key: verified.public_key,
          counter: verified.counter,
          transports: verified.transports ?? [],
          device_type: verified.device_type,
          backed_up: verified.backed_up
        },
        client
      );

      await markWebAuthnChallengeUsed(challenge.id, client);

      const updated = rental.status === "pending_registration"
        ? await markRentalPendingActivationPaymentById(rentalId, client)
        : await findRentalRecordById(rentalId, client);

      if (!updated) {
        throw validationError("Rental could not be loaded after WebAuthn registration.");
      }

      await recordAuditEvent(
        {
          ...context,
          organization_id: updated.organization_id,
          action: "webauthn.registered",
          resource_type: "rental",
          resource_id: rentalId,
          metadata: {
            locker_id: updated.locker_id,
            credential_device_type: verified.device_type,
            credential_backed_up: verified.backed_up
          }
        },
        client
      );

      return updated;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("This WebAuthn credential is already registered for another rental.");
    }

    throw normalizeWebAuthnError(error, "Could not complete WebAuthn registration.");
  }
}

export async function confirmInitialPaymentService(
  rentalId: string,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const rental = await findPendingActivationPaymentRentalByIdForUpdate(rentalId, client);

    if (!rental) {
      throw validationError("Rental is not waiting for the initial payment confirmation.");
    }

    const credential = await findRentalWebAuthnCredentialByRentalId(rentalId, client);

    if (!credential) {
      throw validationError("Register WebAuthn before confirming the initial payment.");
    }

    const locker = await findLockerForRentalUpdate(rental.locker_id, client);

    if (!locker) {
      throw notFoundError("Locker not found.");
    }

    if (locker.status !== "free") {
      throw conflictError("Locker is no longer available for activation.");
    }

    let updated: Rental | null = null;

    for (let attempt = 0; attempt < ACCESS_CODE_ATTEMPTS; attempt += 1) {
      try {
        updated = await confirmRentalInitialPaymentById(rentalId, generateAccessCode(), client);
      } catch (error) {
        if (isPgError(error, "23505")) {
          continue;
        }

        throw error;
      }

      if (updated) {
        break;
      }
    }

    if (!updated) {
      throw internalError("Rental could not be activated after the initial payment.");
    }

    await markLockerOccupied(rental.locker_id, client);
    await recordAuditEvent(
      {
        ...context,
        organization_id: updated.organization_id,
        action: "rental.initial_payment_confirmed",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: {
          locker_id: updated.locker_id,
          status: updated.status
        }
      },
      client
    );

    return updated;
  });
}

export async function startStoringService(
  rentalId: string,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const rental = await findRentalRecordById(rentalId, client);

    if (!rental || rental.status !== "active") {
      throw validationError("Rental is not ready to start storing.");
    }

    const credential = await findRentalWebAuthnCredentialByRentalId(rentalId, client);

    if (!credential) {
      throw validationError("Register WebAuthn before starting the locker timer.");
    }

    const updated = await startRentalStoringById(rentalId, client);

    if (!updated) {
      throw validationError("Rental could not enter storing mode.");
    }

    await recordAuditEvent(
      {
        ...context,
        organization_id: updated.organization_id,
        action: "rental.storage_started",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: {
          locker_id: updated.locker_id
        }
      },
      client
    );

    return updated;
  });
}

export async function createRetrievalAuthenticationOptionsService(context: RequestContext) {
  return withTransaction(async (client) => {
    const credentials = await listRetrievableWebAuthnCredentials(client);

    if (!credentials.length) {
      throw validationError("No rental is ready for biometric retrieval right now.");
    }

    const options = await buildAuthenticationOptions(credentials);

    await insertWebAuthnLookupChallenge(
      {
        challenge: options.challenge,
        expires_at: getWebAuthnChallengeExpiry(),
        ip_address: context.ip_address,
        user_agent: context.user_agent
      },
      client
    );

    return options;
  });
}

export async function retrieveByCredentialService(
  credential: AuthenticationResponseJSON,
  context: RequestContext
): Promise<{ rental: RentalWithLocker; retrieval: RetrievalResult }> {
  return withTransaction(async (client) => {
    const expectedChallenge = extractAuthenticationChallenge(credential);

    if (!expectedChallenge) {
      throw validationError("The WebAuthn authentication challenge is invalid.");
    }

    const challenge = await findOpenWebAuthnLookupChallengeByChallengeForUpdate(expectedChallenge, client);

    if (!challenge || challenge.expires_at.getTime() <= Date.now()) {
      throw validationError("The WebAuthn authentication challenge has expired. Generate a new challenge.");
    }

    const storedCredential = await findRetrievableCredentialByCredentialIdForUpdate(credential.id, client);

    if (!storedCredential) {
      await markWebAuthnLookupChallengeUsed(challenge.id, client);
      throw validationError("No live rental is linked to this biometric credential.");
    }

    let verified;

    try {
      verified = await verifyRentalAuthentication(credential, challenge.challenge, {
        id: storedCredential.credential_id,
        public_key: storedCredential.public_key,
        counter: storedCredential.counter,
        transports: storedCredential.transports
      });
    } catch (error) {
      await recordAuthenticationFailure(
        {
          id: storedCredential.rental_id,
          organization_id: storedCredential.organization_id,
          locker_id: storedCredential.locker_id
        },
        context,
        "lookup_verification_error",
        client
      );
      throw normalizeWebAuthnError(error, "WebAuthn authentication failed.");
    }

    if (!verified) {
      await recordAuthenticationFailure(
        {
          id: storedCredential.rental_id,
          organization_id: storedCredential.organization_id,
          locker_id: storedCredential.locker_id
        },
        context,
        "lookup_verification_failed",
        client
      );
      throw validationError("WebAuthn authentication failed.");
    }

    await markWebAuthnLookupChallengeUsed(challenge.id, client);
    await updateRentalWebAuthnCounter(storedCredential.rental_id, verified.new_counter, client);

    let retrieval: RetrievalResult;

    if (storedCredential.rental_status === "storing") {
      const minutesUsed = Math.max(
        1,
        Math.ceil((Date.now() - storedCredential.unlocked_at.getTime()) / 60000)
      );
      const { extraChargeCents, totalCents, paymentRequired } = calculateRetrievalCharges(
        minutesUsed,
        storedCredential.initial_fee_cents,
        storedCredential.hourly_rate_cents
      );

      const updated = await setRentalRetrievalCharges(
        storedCredential.rental_id,
        extraChargeCents,
        totalCents,
        client
      );

      if (!updated) {
        throw validationError("Rental could not enter retrieval payment mode.");
      }

      await recordAuditEvent(
        {
          ...context,
          organization_id: storedCredential.organization_id,
          action: "rental.retrieved",
          resource_type: "rental",
          resource_id: storedCredential.rental_id,
          metadata: {
            locker_id: storedCredential.locker_id,
            minutes_used: minutesUsed,
            extra_charge_cents: extraChargeCents,
            credential_device_type: verified.device_type,
            credential_backed_up: verified.backed_up,
            source: "generic_retrieval"
          }
        },
        client
      );

      retrieval = {
        rental_id: storedCredential.rental_id,
        locker_id: storedCredential.locker_id,
        minutes_used: minutesUsed,
        extra_charge_cents: extraChargeCents,
        total_cents: totalCents,
        payment_required: paymentRequired
      };
    } else {
      retrieval = {
        rental_id: storedCredential.rental_id,
        locker_id: storedCredential.locker_id,
        minutes_used: deriveMinutesUsed(storedCredential.unlocked_at, storedCredential.retrieved_at),
        extra_charge_cents: storedCredential.extra_charge_cents,
        total_cents: storedCredential.total_cents,
        payment_required: storedCredential.extra_charge_cents > 0
      };
    }

    const rental = await findRentalById(storedCredential.rental_id, client);

    if (!rental) {
      throw notFoundError("Rental not found.");
    }

    return { rental, retrieval };
  });
}

export async function createAuthenticationOptionsService(
  rentalId: string,
  context: RequestContext
) {
  return withTransaction(async (client) => {
    const rental = await findStoringRentalByIdForUpdate(rentalId, client);

    if (!rental) {
      throw validationError("Rental is not ready for WebAuthn authentication.");
    }

    const credential = await findRentalWebAuthnCredentialByRentalId(rentalId, client);

    if (!credential) {
      throw validationError("No WebAuthn credential is registered for this rental.");
    }

    const options = await buildAuthenticationOptions([
      {
        id: credential.credential_id,
        transports: credential.transports
      }
    ]);

    await clearPendingWebAuthnChallenges(rentalId, "authentication", client);
    await insertWebAuthnChallenge(
      {
        rental_id: rentalId,
        purpose: "authentication",
        challenge: options.challenge,
        expires_at: getWebAuthnChallengeExpiry(),
        ip_address: context.ip_address,
        user_agent: context.user_agent
      },
      client
    );

    return options;
  });
}

export async function retrieveLockerService(
  rentalId: string,
  credential: AuthenticationResponseJSON,
  context: RequestContext
): Promise<RetrievalResult> {
  return withTransaction(async (client) => {
    const rental = await findStoringRentalByIdForUpdate(rentalId, client);

    if (!rental) {
      throw notFoundError("Active rental not found.");
    }

    const storedCredential = await findRentalWebAuthnCredentialByRentalId(rentalId, client);
    const challenge = await findOpenWebAuthnChallengeForUpdate(rentalId, "authentication", client);

    if (!storedCredential || !challenge || challenge.expires_at.getTime() <= Date.now()) {
      await recordAuthenticationFailure(rental, context, "challenge_missing_or_expired", client);
      throw validationError("The WebAuthn authentication challenge has expired. Generate a new challenge.");
    }

    let verified;

    try {
      verified = await verifyRentalAuthentication(credential, challenge.challenge, {
        id: storedCredential.credential_id,
        public_key: storedCredential.public_key,
        counter: storedCredential.counter,
        transports: storedCredential.transports
      });
    } catch (error) {
      await recordAuthenticationFailure(rental, context, "verification_error", client);
      throw normalizeWebAuthnError(error, "WebAuthn authentication failed.");
    }

    if (!verified) {
      await recordAuthenticationFailure(rental, context, "verification_failed", client);
      throw validationError("WebAuthn authentication failed.");
    }

    await markWebAuthnChallengeUsed(challenge.id, client);
    await updateRentalWebAuthnCounter(rentalId, verified.new_counter, client);

    const unlockedAt = new Date(rental.unlocked_at);
    const now = new Date();
    const minutesUsed = Math.max(1, Math.ceil((now.getTime() - unlockedAt.getTime()) / 60000));
    const { extraChargeCents, totalCents, paymentRequired } = calculateRetrievalCharges(
      minutesUsed,
      rental.initial_fee_cents,
      rental.hourly_rate_cents
    );

    await setRentalRetrievalCharges(rentalId, extraChargeCents, totalCents, client);

    await recordAuditEvent(
      {
        ...context,
        organization_id: rental.organization_id,
        action: "rental.retrieved",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: {
          locker_id: rental.locker_id,
          minutes_used: minutesUsed,
          extra_charge_cents: extraChargeCents,
          credential_device_type: verified.device_type,
          credential_backed_up: verified.backed_up
        }
      },
      client
    );

    return {
      rental_id: rentalId,
      locker_id: rental.locker_id,
      minutes_used: minutesUsed,
      extra_charge_cents: extraChargeCents,
      total_cents: totalCents,
      payment_required: paymentRequired
    };
  });
}

export async function confirmRetrievalPaymentService(
  rentalId: string,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const finished = await finishRentalById(rentalId, client);

    if (!finished) {
      throw notFoundError("Rental not found or cannot be finished.");
    }

    await markLockerFreeById(finished.locker_id, client);

    await recordAuditEvent(
      {
        ...context,
        organization_id: finished.organization_id,
        action: "rental.finished",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: { locker_id: finished.locker_id, total_cents: finished.total_cents }
      },
      client
    );

    return finished;
  });
}

export async function overrideReleaseService(
  rentalId: string,
  organizationId: string,
  reason: string,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const cancelled = await cancelLiveRentalById(rentalId, organizationId, client);

    if (!cancelled) {
      throw notFoundError("Rental not found or cannot be override-released.");
    }

    await markLockerFreeById(cancelled.locker_id, client);

    await recordAuditEvent(
      {
        ...context,
        organization_id: organizationId,
        action: "rental.override_released",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: {
          locker_id: cancelled.locker_id,
          previous_status: "live",
          reason: reason.trim()
        }
      },
      client
    );

    return cancelled;
  });
}

export async function deleteRentalHistoryService(
  rentalId: string,
  organizationId: string,
  context: RequestContext
): Promise<{ deleted_count: number; deleted_ids: string[] }> {
  return deleteRentalHistoryBatchService([rentalId], organizationId, context);
}

export async function deleteRentalHistoryBatchService(
  rentalIds: string[],
  organizationId: string,
  context: RequestContext
): Promise<{ deleted_count: number; deleted_ids: string[] }> {
  const uniqueRentalIds = [...new Set(rentalIds.map((value) => value.trim()).filter(Boolean))];

  if (!uniqueRentalIds.length) {
    throw validationError("Select at least one rental to delete.");
  }

  return withTransaction(async (client) => {
    const rentals = await findRentalHistoryDeleteCandidatesForUpdate(organizationId, uniqueRentalIds, client);

    if (!rentals.length) {
      throw notFoundError("No matching rental records were found for this organization.");
    }

    if (rentals.length !== uniqueRentalIds.length) {
      const foundIds = new Set(rentals.map((rental) => rental.id));
      const missingIds = uniqueRentalIds.filter((rentalId) => !foundIds.has(rentalId));
      throw notFoundError(`Some rental records could not be found: ${missingIds.join(", ")}.`);
    }

    const blockedRentals = rentals.filter((rental) => !RENTAL_HISTORY_DELETABLE_STATUSES.has(rental.status));

    if (blockedRentals.length) {
      const blockedCodes = blockedRentals.map((rental) => `${rental.locker_code} (${rental.status})`);
      throw conflictError(`Only finished or cancelled rentals can be deleted. Blocked records: ${blockedCodes.join(", ")}.`);
    }

    await deleteUnlockEventsByRentalIds(organizationId, uniqueRentalIds, client);
    await deleteAuditEventsByRentalIds(organizationId, uniqueRentalIds, client);

    const deletedCount = await deleteRentalHistoryByIds(organizationId, uniqueRentalIds, client);

    if (deletedCount !== uniqueRentalIds.length) {
      throw internalError("Could not delete all requested rental records.");
    }

    await recordAuditEvent(
      {
        ...context,
        organization_id: organizationId,
        action: uniqueRentalIds.length === 1 ? "rental_history.deleted" : "rental_history.bulk_deleted",
        resource_type: "rental_history",
        metadata: {
          rental_ids: uniqueRentalIds,
          rental_count: deletedCount,
          locker_codes: rentals.map((rental) => rental.locker_code)
        }
      },
      client
    );

    return {
      deleted_count: deletedCount,
      deleted_ids: uniqueRentalIds
    };
  });
}

export { listRentalsByOrg };

function deriveMinutesUsed(unlockedAt: Date, retrievedAt?: Date | null) {
  const endTime = retrievedAt?.getTime() ?? Date.now();
  return Math.max(1, Math.ceil((endTime - unlockedAt.getTime()) / 60000));
}

function calculateRetrievalCharges(
  minutesUsed: number,
  initialFeeCents: number,
  hourlyRateCents: number
) {
  const billableHours = Math.floor(Math.max(0, minutesUsed) / 60);
  const extraChargeCents = billableHours * hourlyRateCents;

  return {
    extraChargeCents,
    totalCents: initialFeeCents + extraChargeCents,
    paymentRequired: extraChargeCents > 0
  };
}

async function recordAuthenticationFailure(
  rental: { id: string; organization_id: string; locker_id: string },
  context: RequestContext,
  reason: string,
  client: Parameters<typeof recordAuditEvent>[1]
) {
  await recordAuditEvent(
    {
      ...context,
      organization_id: rental.organization_id,
      action: "webauthn.authentication_failed",
      resource_type: "rental",
      resource_id: rental.id,
      metadata: {
        locker_id: rental.locker_id,
        reason
      }
    },
    client
  );
}

function normalizeWebAuthnError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return validationError(error.message);
  }

  if (isPgError(error, "23505")) {
    return conflictError(fallbackMessage);
  }

  return error;
}

function generateAccessCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
