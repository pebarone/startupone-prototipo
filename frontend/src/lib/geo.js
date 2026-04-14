/**
 * @fileoverview Geolocation helpers for map experiences.
 */

const EARTH_RADIUS_METERS = 6371000
const COMPASS_LABELS = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste']

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
}

/**
 * @param {number} value
 * @returns {number}
 */
function toRadians(value) {
  return (value * Math.PI) / 180
}

/**
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @returns {number}
 */
export function haversineDistanceMeters(from, to) {
  const fromLat = toRadians(Number(from.lat))
  const toLat = toRadians(Number(to.lat))
  const deltaLat = toRadians(Number(to.lat) - Number(from.lat))
  const deltaLng = toRadians(Number(to.lng) - Number(from.lng))

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @returns {number}
 */
export function calculateBearing(from, to) {
  const fromLat = toRadians(Number(from.lat))
  const toLat = toRadians(Number(to.lat))
  const deltaLng = toRadians(Number(to.lng) - Number(from.lng))

  const y = Math.sin(deltaLng) * Math.cos(toLat)
  const x = Math.cos(fromLat) * Math.sin(toLat)
    - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng)

  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

/**
 * @param {number} distanceMeters
 * @returns {string}
 */
export function formatDistance(distanceMeters) {
  const distance = Number(distanceMeters) || 0

  if (distance < 1000) {
    return `${Math.round(distance)} m`
  }

  if (distance < 10000) {
    return `${(distance / 1000).toFixed(1).replace('.', ',')} km`
  }

  return `${Math.round(distance / 1000)} km`
}

/**
 * @param {number} bearing
 * @returns {string}
 */
export function bearingToCompassLabel(bearing) {
  const normalized = ((Number(bearing) || 0) % 360 + 360) % 360
  const index = Math.round(normalized / 45) % COMPASS_LABELS.length
  return COMPASS_LABELS[index]
}

/**
 * @param {{ lat: number, lng: number } | null | undefined} userLocation
 * @param {Array<any>} locations
 * @returns {any | null}
 */
export function findNearestLocation(userLocation, locations) {
  if (!userLocation || !isValidCoordinate(userLocation.lat, userLocation.lng)) {
    return null
  }

  let nearest = null

  for (const location of locations) {
    if (!isValidCoordinate(location?.latitude, location?.longitude)) {
      continue
    }

    const distanceMeters = haversineDistanceMeters(userLocation, {
      lat: Number(location.latitude),
      lng: Number(location.longitude)
    })

    if (!nearest || distanceMeters < nearest.distance_meters) {
      nearest = {
        ...location,
        distance_meters: distanceMeters,
        bearing: calculateBearing(userLocation, {
          lat: Number(location.latitude),
          lng: Number(location.longitude)
        })
      }
    }
  }

  return nearest
}
