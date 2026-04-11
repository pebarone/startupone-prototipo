import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { notFoundError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import {
  findActiveRentalByAccessCodeForUpdate,
  finishRental,
  markLockerFree,
  recordUnlockEvent
} from "./unlock.repository";

type UnlockSuccess = {
  rental_id: string;
  locker_id: string;
};

export async function unlockWithAccessCodeService(accessCode: string, context: RequestContext): Promise<UnlockSuccess> {
  const result = await withTransaction(async (client) => {
    const activeRental = await findActiveRentalByAccessCodeForUpdate(accessCode, client);

    if (!activeRental) {
      await recordUnlockEvent({ access_code: accessCode, success: false, reason: "invalid_code" }, client);
      await recordAuditEvent(
        {
          ...context,
          action: "unlock.failed",
          resource_type: "unlock_attempt",
          metadata: { reason: "invalid_code" }
        },
        client
      );

      return null;
    }

    await finishRental(activeRental.rental_id, client);
    await markLockerFree(activeRental.locker_id, client);
    await recordUnlockEvent(
      {
        organization_id: activeRental.organization_id,
        access_code: accessCode,
        success: true,
        rental_id: activeRental.rental_id,
        locker_id: activeRental.locker_id
      },
      client
    );
    await recordAuditEvent(
      {
        ...context,
        organization_id: activeRental.organization_id,
        action: "unlock.succeeded",
        resource_type: "rental",
        resource_id: activeRental.rental_id,
        metadata: { locker_id: activeRental.locker_id }
      },
      client
    );

    return activeRental;
  });

  if (!result) {
    throw notFoundError("Access code is invalid or already finished.");
  }

  return result;
}
