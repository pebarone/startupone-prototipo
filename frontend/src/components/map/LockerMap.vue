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
import { summarizeAddress } from '@/lib/address'
import { isValidCoordinate } from '@/lib/geo'

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
  userLocation: {
    type: Object,
    default: null
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
    default: 'Nenhuma localizacao cadastrada ainda.'
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
  cleanupGlobalInteractionState()

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

watch(
  () => props.userLocation,
  () => {
    renderMarkers()
  },
  { deep: true }
)

watch(
  () => props.center,
  (nextCenter) => {
    if (!map || !nextCenter) {
      return
    }

    map.flyTo([nextCenter.lat, nextCenter.lng], nextCenter.zoom ?? 12, {
      duration: 1.2,
      easeLinearity: 0.3
    })
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
    map.invalidateSize()

    if (restoreInteraction) {
      restoreInteractionState()
    }
  }, 120)
}

function restoreInteractionState() {
  cleanupGlobalInteractionState()

  if (!map || !props.interactive) {
    return
  }

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

function cleanupGlobalInteractionState() {
  mapElement.value?.classList?.remove('leaflet-drag-target', 'leaflet-grab', 'leaflet-touch-drag', 'leaflet-touch-zoom')
  document.body.classList.remove('leaflet-dragging', 'leaflet-touching')
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
      icon: createLocationMarkerIcon(location, location.id === props.selectedLocationId),
      keyboard: props.interactive,
      riseOnHover: true
    })

    marker.on('click', () => {
      emit('select-location', location)
    })

    marker.bindPopup(buildLocationPopupHtml(location), {
      closeButton: false,
      autoPan: props.interactive,
      className: 'locker-map-popup'
    })

    marker.addTo(markersLayer)
    markersById.set(location.id, marker)
    bounds.push([location.latitude, location.longitude])
  }

  if (isValidCoordinate(props.userLocation?.lat, props.userLocation?.lng)) {
    const userMarker = L.marker([props.userLocation.lat, props.userLocation.lng], {
      icon: createUserMarkerIcon(),
      keyboard: false,
      zIndexOffset: 900
    })

    userMarker.bindPopup(buildUserPopupHtml(), {
      closeButton: false,
      autoPan: props.interactive,
      className: 'locker-map-popup locker-map-user-popup'
    })

    userMarker.addTo(markersLayer)
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
 * @param {any} location
 * @param {boolean} isSelected
 * @returns {L.DivIcon}
 */
function createLocationMarkerIcon(location, isSelected) {
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
 * @returns {L.DivIcon}
 */
function createUserMarkerIcon() {
  return L.divIcon({
    className: 'locker-map-user-div-icon',
    html: `
      <div class="locker-map-user-marker">
        <div class="locker-map-user-pulse"></div>
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M22 4C14.268 4 8 10.268 8 18c0 9.12 11.226 18.451 13.261 20.072a1.2 1.2 0 0 0 1.478 0C24.774 36.451 36 27.12 36 18 36 10.268 29.732 4 22 4Z" fill="#ef4444"></path>
          <circle cx="22" cy="18" r="7" fill="#ffffff"></circle>
          <circle cx="22" cy="18" r="3.2" fill="#ef4444"></circle>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 38],
    popupAnchor: [0, -32]
  })
}

/**
 * @param {any} location
 * @returns {string}
 */
function buildLocationPopupHtml(location) {
  const freeLockers = Number(location?.free_lockers ?? 0)
  const totalLockers = Number(location?.total_lockers ?? 0)

  return `
    <div class="locker-map-popup-card">
      <p class="locker-map-popup-title">${escapeHtml(location?.name || 'Localizacao')}</p>
      <p class="locker-map-popup-address">${escapeHtml(summarizeAddress(location?.address || ''))}</p>
      <div class="locker-map-popup-stats">
        <span>${freeLockers} livre${freeLockers === 1 ? '' : 's'}</span>
        <span>${totalLockers} total</span>
      </div>
    </div>
  `
}

/**
 * @returns {string}
 */
function buildUserPopupHtml() {
  return `
    <div class="locker-map-popup-card">
      <p class="locker-map-popup-title">Sua localizacao</p>
      <p class="locker-map-popup-address">GPS ativo neste mapa.</p>
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

:deep(.locker-map-div-icon),
:deep(.locker-map-user-div-icon) {
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

:deep(.locker-map-user-marker) {
  position: relative;
  display: flex;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
}

:deep(.locker-map-user-marker svg) {
  position: relative;
  height: 44px;
  width: 44px;
  filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.2));
}

:deep(.locker-map-user-pulse) {
  position: absolute;
  inset: 10px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.2);
  animation: locker-map-pulse 2.1s ease-out infinite;
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

@keyframes locker-map-pulse {
  0% {
    transform: scale(0.84);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.42);
    opacity: 0;
  }
  100% {
    transform: scale(1.42);
    opacity: 0;
  }
}
</style>
