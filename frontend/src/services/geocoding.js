/**
 * @fileoverview Nominatim helpers for address search.
 */

import { formatNominatimAddress, formatNominatimName } from '@/lib/address'

/**
 * @typedef {Object} GeocodingResult
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

/**
 * Search addresses using Nominatim.
 * @param {string} query
 * @returns {Promise<GeocodingResult[]>}
 */
export async function searchAddresses(query) {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 4) {
    return []
  }

  const url = new URL('/search', NOMINATIM_BASE_URL)
  url.searchParams.set('q', normalizedQuery)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'br')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'pt-BR')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar o endereco agora.')
  }

  /** @type {Array<any>} */
  const payload = await response.json()

  return payload.map((item) => ({
    id: String(item.place_id),
    name: formatNominatimName(item.address, item.display_name),
    address: formatNominatimAddress(item.address, item.display_name),
    latitude: Number(item.lat),
    longitude: Number(item.lon)
  }))
}
