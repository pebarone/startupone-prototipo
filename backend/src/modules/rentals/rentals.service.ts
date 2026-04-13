import { randomInt } from "node:crypto";
import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { conflictError, internalError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import {
  deleteAuditEventsByRentalIds,
  deleteRentalHistoryByIds,
  deleteUnlockEventsByRentalIds,
  findLockerForRentalUpdate,
  findLocationPricing,
  findRentalById,
  findRentalHistoryDeleteCandidatesForUpdate,
  findStoringRentalByIdForUpdate,
  finishRentalById,
  insertActiveRental,
  markLockerFreeById,
  markLockerOccupied,
  registerBiometricOnRental,
  setRentalRetrievalCharges
} from "./rentals.repository";
import type { Rental, RentalWithLocker, RetrievalResult } from "./rentals.schemas";

const ACCESS_CODE_ATTEMPTS = 10;
const RENTAL_HISTORY_DELETABLE_STATUSES = new Set(["finished", "cancelled"]);

// Default hourly rates (centavos) when no location is set
const DEFAULT_RATES: Record<string, number> = {
  P: 500,
  M: 1000,
  G: 1500
};

export async function createRentalService(lockerId: string, context: RequestContext): Promise<Rental> {
  return withTransaction(async (client) => {
    const locker = await findLockerForRentalUpdate(lockerId, client);

    if (!locker) {
      throw notFoundError("Locker not found.");
    }

    if (locker.status !== "free") {
      throw conflictError("Locker is not available.");
    }

    // Snapshot pricing from location (or defaults)
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
      rental = await insertActiveRental(
        locker.organization_id,
        lockerId,
        generateAccessCode(),
        initialFeeCents,
        hourlyRateCents,
        client
      );

      if (rental) {
        break;
      }
    }

    if (!rental) {
      throw internalError("Could not generate a unique access code.");
    }

    await markLockerOccupied(lockerId, client);
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

export async function registerBiometricService(
  rentalId: string,
  biometricToken: string,
  context: RequestContext
): Promise<Rental> {
  return withTransaction(async (client) => {
    const updated = await registerBiometricOnRental(rentalId, biometricToken, client);

    if (!updated) {
      throw validationError("Rental not found or is not in 'active' status.");
    }

    await recordAuditEvent(
      {
        ...context,
        organization_id: updated.organization_id,
        action: "rental.biometric_registered",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: { locker_id: updated.locker_id }
      },
      client
    );

    return updated;
  });
}

export async function retrieveLockerService(
  rentalId: string,
  biometricToken: string,
  context: RequestContext
): Promise<RetrievalResult> {
  return withTransaction(async (client) => {
    const rental = await findStoringRentalByIdForUpdate(rentalId, client);

    if (!rental) {
      throw notFoundError("Active rental not found.");
    }

    if (rental.biometric_token !== biometricToken) {
      throw validationError("Biometric verification failed.");
    }

    const unlockedAt = new Date(rental.unlocked_at);
    const now = new Date();
    const minutesUsed = Math.max(1, Math.ceil((now.getTime() - unlockedAt.getTime()) / 60000));
    const hoursUsed = Math.ceil(minutesUsed / 60); // charge by started hour
    const extraChargeCents = hoursUsed * rental.hourly_rate_cents;
    const totalCents = rental.initial_fee_cents + extraChargeCents;
    const paymentRequired = extraChargeCents > 0;

    await setRentalRetrievalCharges(rentalId, extraChargeCents, totalCents, client);

    await recordAuditEvent(
      {
        ...context,
        organization_id: rental.organization_id,
        action: "rental.retrieved",
        resource_type: "rental",
        resource_id: rentalId,
        metadata: { locker_id: rental.locker_id, minutes_used: minutesUsed, extra_charge_cents: extraChargeCents }
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
      throw notFoundError(
        `Some rental records could not be found: ${missingIds.join(", ")}.`
      );
    }

    const blockedRentals = rentals.filter((rental) => !RENTAL_HISTORY_DELETABLE_STATUSES.has(rental.status));

    if (blockedRentals.length) {
      const blockedCodes = blockedRentals.map((rental) => `${rental.locker_code} (${rental.status})`);
      throw conflictError(
        `Only finished or cancelled rentals can be deleted. Blocked records: ${blockedCodes.join(", ")}.`
      );
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

function generateAccessCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
