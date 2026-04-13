<template>
  <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
    <div ref="mapElement" class="w-full" :style="{ height }" />

    <div
      v-if="!locations.length"
      class="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg border border-white/70 bg-white/90 px-3.5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur"
    >
      {{ emptyLabel }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = {
  lat: -23.55052,
  lng: -46.633308,
  zoom: 12
}

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  interactive: {
    type: Boolean,
    default: true
  },
  selectedLocationId: {
    type: String,
    default: ''
  },
  center: {
    type: Object,
    default: () => ({
      lat: -23.55052,
      lng: -46.633308,
      zoom: 12
    })
  },
  height: {
    type: String,
    default: '440px'
  },
  fitToLocations: {
    type: Boolean,
    default: true
  },
  emptyLabel: {
    type: String,
    default: 'Nenhuma localização cadastrada ainda.'
  }
})

const emit = defineEmits(['select-location'])

const mapElement = ref(null)

/** @type {L.Map | null} */
let map = null
/** @type {L.LayerGroup | null} */
let markersLayer = null
/** @type {Map<string, L.Marker>} */
let markersById = new Map()

onMounted(() => {
  initializeMap()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('resize', handleWindowResize)

  if (map) {
    map.remove()
    map = null
  }

  markersLayer = null
  markersById.clear()
})

watch(
  () => props.locations,
  () => {
    renderMarkers()
  },
  { deep: true }
)

watch(
  () => props.selectedLocationId,
  () => {
    renderMarkers()
  }
)

// Fly to new center when geolocation resolves
watch(
  () => props.center,
  (c) => {
    if (!map || !c) return
    map.flyTo([c.lat, c.lng], c.zoom ?? 12, { duration: 1.2, easeLinearity: 0.3 })
  },
  { deep: true }
)

function initializeMap() {
  if (!mapElement.value || map) {
    return
  }

  map = L.map(mapElement.value, {
    zoomControl: props.interactive,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    tap: props.interactive
  }).setView(
    [props.center.lat ?? DEFAULT_CENTER.lat, props.center.lng ?? DEFAULT_CENTER.lng],
    props.center.zoom ?? DEFAULT_CENTER.zoom
  )

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  renderMarkers()

  window.requestAnimationFrame(() => {
    map?.invalidateSize()
  })
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    scheduleMapRefresh()
  }
}

function handleWindowFocus() {
  scheduleMapRefresh()
}

function handleWindowResize() {
  scheduleMapRefresh(false)
}

/**
 * @param {boolean} [restoreInteraction=true]
 */
function scheduleMapRefresh(restoreInteraction = true) {
  window.setTimeout(() => {
    if (!map) {
      return
    }

    map.stop()
    map?.invalidateSize()

    if (restoreInteraction) {
      restoreInteractionState()
    }
  }, 120)
}

function restoreInteractionState() {
  if (!map || !props.interactive) {
    return
  }

  const container = map.getContainer()

  container.classList.remove('leaflet-drag-target', 'leaflet-grab', 'leaflet-touch-drag', 'leaflet-touch-zoom')
  document.body.classList.remove('leaflet-dragging', 'leaflet-touching')

  // Force a clean rebind of interaction handlers after focus is restored.
  map.dragging.disable()
  map.dragging.enable()

  map.scrollWheelZoom.disable()
  map.scrollWheelZoom.enable()

  map.doubleClickZoom.disable()
  map.doubleClickZoom.enable()

  map.boxZoom.disable()
  map.boxZoom.enable()

  map.keyboard.disable()
  map.keyboard.enable()

  if (map.tap) {
    map.tap.disable()
    map.tap.enable()
  }
}

function renderMarkers() {
  if (!map || !markersLayer) {
    return
  }

  markersLayer.clearLayers()
  markersById = new Map()

  /** @type {Array<[number, number]>} */
  const bounds = []

  for (const location of props.locations) {
    if (!isValidCoordinate(location?.latitude, location?.longitude)) {
      continue
    }

    const marker = L.marker([location.latitude, location.longitude], {
      icon: createMarkerIcon(location, location.id === props.selectedLocationId),
      keyboard: props.interactive,
      riseOnHover: true
    })

    marker.on('click', () => {
      emit('select-location', location)
    })

    marker.bindPopup(buildPopupHtml(location), {
      closeButton: false,
      autoPan: props.interactive,
      className: 'locker-map-popup'
    })

    marker.addTo(markersLayer)
    markersById.set(location.id, marker)
    bounds.push([location.latitude, location.longitude])
  }

  if (!bounds.length) {
    map.setView(
      [props.center.lat ?? DEFAULT_CENTER.lat, props.center.lng ?? DEFAULT_CENTER.lng],
      props.center.zoom ?? DEFAULT_CENTER.zoom
    )
    return
  }

  if (props.selectedLocationId) {
    const selectedMarker = markersById.get(props.selectedLocationId)

    if (selectedMarker) {
      selectedMarker.openPopup()

      if (props.interactive) {
        map.flyTo(selectedMarker.getLatLng(), Math.max(map.getZoom(), 14), {
          duration: 0.45
        })
      }
      return
    }
  }

  if (!props.fitToLocations) {
    return
  }

  if (bounds.length === 1) {
    map.setView(bounds[0], Math.max(props.center.zoom ?? DEFAULT_CENTER.zoom, 14))
    return
  }

  map.fitBounds(bounds, {
    padding: [36, 36],
    maxZoom: 15
  })
}

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
}

/**
 * @param {any} location
 * @param {boolean} isSelected
 * @returns {L.DivIcon}
 */
function createMarkerIcon(location, isSelected) {
  const freeLockers = Number(location?.free_lockers ?? 0)
  const markerState = freeLockers > 0 ? 'available' : 'empty'

  return L.divIcon({
    className: 'locker-map-div-icon',
    html: `
      <div class="locker-map-marker ${markerState} ${isSelected ? 'selected' : ''}">
        <span>${freeLockers}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18]
  })
}

/**
 * @param {any} location
 * @returns {string}
 */
function buildPopupHtml(location) {
  const freeLockers = Number(location?.free_lockers ?? 0)
  const totalLockers = Number(location?.total_lockers ?? 0)

  return `
    <div class="locker-map-popup-card">
      <p class="locker-map-popup-title">${escapeHtml(location?.name || 'Localização')}</p>
      <p class="locker-map-popup-address">${escapeHtml(location?.address || '')}</p>
      <div class="locker-map-popup-stats">
        <span>${freeLockers} livre${freeLockers === 1 ? '' : 's'}</span>
        <span>${totalLockers} total</span>
      </div>
    </div>
  `
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
</script>

<style scoped>
:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  font-family: inherit;
  z-index: 0;
}

:deep(.leaflet-control-zoom a) {
  color: #0f172a;
}

:deep(.locker-map-div-icon) {
  background: transparent;
  border: 0;
}

:deep(.locker-map-marker) {
  display: flex;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 180ms cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 180ms ease-out;
}

:deep(.locker-map-marker.available) {
  background: #16a34a;
}

:deep(.locker-map-marker.empty) {
  background: #64748b;
}

:deep(.locker-map-marker.selected) {
  transform: scale(1.08);
  box-shadow: 0 18px 34px rgba(22, 163, 74, 0.28);
}

:deep(.leaflet-marker-icon:hover .locker-map-marker) {
  transform: translateY(-2px);
}

:deep(.locker-map-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

:deep(.locker-map-popup .leaflet-popup-content) {
  margin: 0;
}

:deep(.locker-map-popup-card) {
  min-width: 220px;
  padding: 14px;
}

:deep(.locker-map-popup-title) {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

:deep(.locker-map-popup-address) {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

:deep(.locker-map-popup-stats) {
  display: flex;
  margin-top: 10px;
  gap: 8px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
}
</style>
