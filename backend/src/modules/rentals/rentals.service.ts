import { randomInt } from "node:crypto";
import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { conflictError, internalError, notFoundError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import {
  findLockerForRentalUpdate,
  findRentalById,
  insertActiveRental,
  markLockerOccupied
} from "./rentals.repository";
import type { Rental, RentalWithLocker } from "./rentals.schemas";

const ACCESS_CODE_ATTEMPTS = 10;

export async function createRentalService(lockerId: string, context: RequestContext): Promise<Rental> {
  return withTransaction(async (client) => {
    const locker = await findLockerForRentalUpdate(lockerId, client);

    if (!locker) {
      throw notFoundError("Locker not found.");
    }

    if (locker.status !== "free") {
      throw conflictError("Locker is not available.");
    }

    let rental: Rental | null = null;

    for (let attempt = 0; attempt < ACCESS_CODE_ATTEMPTS; attempt += 1) {
      rental = await insertActiveRental(locker.organization_id, lockerId, generateAccessCode(), client);

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
        metadata: { locker_id: lockerId, status: rental.status }
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

function generateAccessCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
