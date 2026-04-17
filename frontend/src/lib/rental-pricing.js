/**
 * @param {string|number|Date|null|undefined} timestamp
 * @returns {number|null}
 */
export function normalizeTimestampToNow(timestamp) {
  if (!timestamp) {
    return null
  }

  const parsed = new Date(timestamp).getTime()

  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.min(parsed, Date.now())
}

/**
 * @param {number|null|undefined} elapsedSeconds
 * @returns {number}
 */
export function deriveMinutesFromElapsedSeconds(elapsedSeconds) {
  const normalizedSeconds = Math.max(0, Number(elapsedSeconds) || 0)

  if (!normalizedSeconds) {
    return 0
  }

  return Math.max(1, Math.ceil(normalizedSeconds / 60))
}

/**
 * @param {string|number|Date|null|undefined} unlockedAt
 * @param {string|number|Date|null|undefined} [finishedAt]
 * @returns {number}
 */
export function deriveMinutesUsed(unlockedAt, finishedAt) {
  const startedAt = normalizeTimestampToNow(unlockedAt)

  if (!startedAt) {
    return 0
  }

  const rawFinishedAt = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const resolvedFinishedAt = Number.isFinite(rawFinishedAt)
    ? Math.max(startedAt, Math.min(rawFinishedAt, Date.now()))
    : Date.now()

  return Math.max(1, Math.ceil((resolvedFinishedAt - startedAt) / 60000))
}

/**
 * Mirrors the backend rule: extra charge only accrues after each completed hour.
 * @param {number|null|undefined} minutesUsed
 * @param {number|null|undefined} hourlyRateCents
 * @returns {number}
 */
export function estimateExtraChargeCents(minutesUsed, hourlyRateCents) {
  const normalizedMinutes = Math.max(0, Number(minutesUsed) || 0)
  const billableHours = Math.floor(normalizedMinutes / 60)

  return billableHours * (Number(hourlyRateCents) || 0)
}

/**
 * @param {number|null|undefined} elapsedSeconds
 * @param {number|null|undefined} hourlyRateCents
 * @returns {number}
 */
export function estimateExtraChargeCentsFromElapsedSeconds(elapsedSeconds, hourlyRateCents) {
  return estimateExtraChargeCents(deriveMinutesFromElapsedSeconds(elapsedSeconds), hourlyRateCents)
}
