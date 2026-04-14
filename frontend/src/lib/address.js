/**
 * @fileoverview Helpers to keep Brazilian addresses compact and readable.
 */

const POSTCODE_PATTERN = /\b\d{5}-?\d{3}\b/
const HOUSE_NUMBER_PATTERN = /^\s*(?:n(?:u|u?m)?\.?\s*)?(\d+[a-zA-Z-]*)\s*$/
const ROAD_PART_PATTERN = /\b(rua|r\.|avenida|av\.|travessa|alameda|estrada|rodovia|praca|largo|via|servidao)\b/i
const IGNORE_PART_PATTERN = /\b(brasil|brazil|regiao|metropolitana|imediata|geografica|intermediaria)\b/i

const BRAZIL_STATE_TO_UF = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO'
}

const ROAD_KEYS = ['road', 'pedestrian', 'footway', 'street', 'street_name', 'residential', 'cycleway', 'path']
const NAME_KEYS = ['shop', 'amenity', 'building', 'tourism', 'leisure', 'road', 'suburb', 'neighbourhood', 'city', 'town']
const CITY_KEYS = ['city', 'town', 'municipality', 'village', 'city_district']

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function normalizeSpaces(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function stripAccents(value) {
  return normalizeSpaces(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function normalizePostcode(value) {
  const match = normalizeSpaces(value).match(POSTCODE_PATTERN)
  return match ? match[0].replace(/^(\d{5})(\d{3})$/, '$1-$2') : ''
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function normalizeState(value) {
  const normalized = normalizeSpaces(value)

  if (!normalized) {
    return ''
  }

  if (/^[a-z]{2}$/i.test(normalized)) {
    return normalized.toUpperCase()
  }

  return BRAZIL_STATE_TO_UF[stripAccents(normalized)] || normalized
}

/**
 * @param {string[]} parts
 * @returns {string[]}
 */
function dedupeParts(parts) {
  /** @type {Set<string>} */
  const seen = new Set()

  return parts.filter((part) => {
    const key = stripAccents(part)
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * @param {string} part
 * @returns {boolean}
 */
function isHouseNumber(part) {
  return HOUSE_NUMBER_PATTERN.test(part)
}

/**
 * @param {string} part
 * @returns {string}
 */
function normalizeHouseNumber(part) {
  const match = normalizeSpaces(part).match(HOUSE_NUMBER_PATTERN)
  return match?.[1] ? match[1].toUpperCase() : ''
}

/**
 * @param {string} part
 * @returns {boolean}
 */
function isIgnorableAddressPart(part) {
  return !part || IGNORE_PART_PATTERN.test(stripAccents(part))
}

/**
 * @param {string[]} parts
 * @param {number} startIndex
 * @returns {string}
 */
function findMeaningfulCity(parts, startIndex) {
  for (let index = startIndex; index >= 0; index -= 1) {
    const part = parts[index]

    if (!part || isIgnorableAddressPart(part) || isHouseNumber(part) || ROAD_PART_PATTERN.test(part) || POSTCODE_PATTERN.test(part)) {
      continue
    }

    return part
  }

  return ''
}

/**
 * @param {string[]} parts
 * @param {number} roadIndex
 * @returns {string}
 */
function findClosestHouseNumber(parts, roadIndex) {
  const indexes = [roadIndex + 1, roadIndex - 1, 1, 0, 2, 3]

  for (const index of indexes) {
    const part = parts[index]
    if (part && isHouseNumber(part)) {
      return normalizeHouseNumber(part)
    }
  }

  return ''
}

/**
 * @param {Record<string, any> | null | undefined} address
 * @param {string[]} keys
 * @returns {string}
 */
function pickAddressField(address, keys) {
  for (const key of keys) {
    const value = normalizeSpaces(address?.[key])
    if (value) {
      return value
    }
  }

  return ''
}

/**
 * @param {{ road?: string, houseNumber?: string, city?: string, state?: string, postcode?: string }} input
 * @returns {string}
 */
function buildCompactAddress(input) {
  const road = normalizeSpaces(input.road)
  const houseNumber = normalizeHouseNumber(input.houseNumber)
  const city = normalizeSpaces(input.city)
  const state = normalizeState(input.state)
  const postcode = normalizePostcode(input.postcode)

  const streetLine = [road, houseNumber].filter(Boolean).join(', ')
  const cityLine = [city, state].filter(Boolean).join(' - ')

  return [streetLine, cityLine, postcode].filter(Boolean).join(' | ')
}

/**
 * @param {string | null | undefined} value
 * @param {string} [fallback='Endereco indisponivel']
 * @returns {string}
 */
export function summarizeAddress(value, fallback = 'Endereco indisponivel') {
  const normalized = normalizeSpaces(value)

  if (!normalized) {
    return fallback
  }

  if (normalized.includes(' | ')) {
    return normalized
  }

  const parts = dedupeParts(
    normalized
      .split(',')
      .map((part) => normalizeSpaces(part))
      .filter(Boolean)
  )

  if (!parts.length) {
    return fallback
  }

  const postcode = normalizePostcode(normalized)
  let stateIndex = -1

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    if (normalizeState(parts[index])) {
      stateIndex = index
      break
    }
  }

  const state = stateIndex >= 0 ? normalizeState(parts[stateIndex]) : ''
  const city = findMeaningfulCity(parts, stateIndex >= 0 ? stateIndex - 1 : parts.length - 1)
  const roadIndex = parts.findIndex((part) => ROAD_PART_PATTERN.test(part))
  const road = roadIndex >= 0 ? parts[roadIndex] : parts.find((part) => !isIgnorableAddressPart(part) && !isHouseNumber(part)) || parts[0]
  const houseNumber = roadIndex >= 0 ? findClosestHouseNumber(parts, roadIndex) : ''
  const compact = buildCompactAddress({ road, houseNumber, city, state, postcode })

  return compact || parts.slice(0, 3).join(', ')
}

/**
 * @param {Record<string, any> | null | undefined} address
 * @param {string | null | undefined} [displayName]
 * @returns {string}
 */
export function formatNominatimAddress(address, displayName = '') {
  const compact = buildCompactAddress({
    road: pickAddressField(address, ROAD_KEYS),
    houseNumber: normalizeSpaces(address?.house_number),
    city: pickAddressField(address, CITY_KEYS),
    state: normalizeSpaces(address?.state_code || address?.state),
    postcode: normalizeSpaces(address?.postcode)
  })

  return compact || summarizeAddress(displayName)
}

/**
 * @param {Record<string, any> | null | undefined} address
 * @param {string | null | undefined} [displayName]
 * @returns {string}
 */
export function formatNominatimName(address, displayName = '') {
  const explicitName = pickAddressField(address, NAME_KEYS)

  if (explicitName) {
    return explicitName
  }

  const summary = formatNominatimAddress(address, displayName)
  return summary.split(' | ')[0]?.split(',')[0]?.trim() || 'Localizacao'
}
