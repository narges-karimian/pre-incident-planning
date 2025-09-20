<template>
  <div class="q-gutter-md q-pa-md">
    <div class="text-h6 text-center q-my-md">نقشه طبقه</div>
    <div class="map-container q-mb-md" dir="ltr">
      <l-map
        ref="map"
        v-model:zoom="mapZoom"
        :center="mapCenter"
        :options="{ zoomControl: false }"
        style="height: 350px; width: 100%"
      >
        <l-tile-layer
          :url="getEnv('OPEN_STREET_TILE_API')"
          layer-type="base"
          name="OpenStreetMap"
        />

        <!-- Drawing Control -->
        <l-control position="topright">
          <q-btn-group flat class="my-font">
            <q-btn
              :icon="drawingMode ? 'close' : 'edit_location'"
              :color="drawingMode ? 'negative' : 'primary'"
              @click="toggleDrawingMode"
              :label="drawingMode ? 'انصراف' : 'رسم'"
            />
            <q-btn
              v-if="currentPolygon"
              icon="delete"
              color="negative"
              @click="clearPolygon"
              label="حذف"
            />
          </q-btn-group>
        </l-control>

        <!-- Display drawn polygon -->
        <l-polygon
          v-if="currentPolygon"
          :lat-lngs="currentPolygon"
          color="blue"
          :fill-color="'blue'"
          :fill-opacity="0.3"
        />
      </l-map>
    </div>
    <div class="text-h6 text-center q-my-md">طبقات</div>
    <q-card class="q-pa-md bg-grey-1">
      <div class="row q-gutter-md q-mb-md">
        <q-input
          v-model.number="newFloorOrder"
          label="شماره طبقه"
          type="number"
          dense
          filled
          hint="شماره ترتیب طبقه"
          :disable="!currentPolygon"
          class="col"
          min="1"
          step="1"
        />
        <q-input
          v-model="newFloorWidth"
          label="عرض (متر)"
          type="number"
          dense
          filled
          hint="عرض طبقه به متر"
          class="col"
          min="0"
          step="0.1"
        />
        <q-input
          v-model="newFloorHeight"
          label="ارتفاع (متر)"
          type="number"
          dense
          filled
          hint="ارتفاع طبقه به متر"
          class="col"
          min="0"
          step="0.1"
        />
      </div>
      <q-btn
        label="افزودن طبقه"
        color="primary"
        @click="addLevel"
        :disable="!canAddFloor"
        :loading="saving"
      />
      <div v-if="!currentPolygon" class="text-caption text-negative q-mt-sm">
        برای افزودن طبقه باید یک چند ضلعی رسم کنید
      </div>
    </q-card>

    <q-list ref="el" bordered class="rounded-borders">
      <q-item v-for="level in levels" :key="level.order_of_floor">
        <q-item-section top class="col-9">
          <q-item-label class="q-mt-sm">{{ level.name }}</q-item-label>
          <q-item-label caption>
            عرض: {{ level.width }}m | ارتفاع: {{ level.height }}m
            <span v-if="level.polygon"> | {{ level.polygon.length }} نقطه</span>
          </q-item-label>
        </q-item-section>

        <q-item-section top class="col-3">
          <div class="text-grey-8 q-gutter-xs">
            <q-btn size="12px" flat dense round icon="delete" @click="removeLevel(level)" />
            <q-btn size="12px" flat dense round icon="drag_handle" class="handle" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, useTemplateRef, onMounted, computed } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { LMap, LTileLayer, LPolygon, LControl } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet-draw'
import { getEnv } from 'src/utils'
import { useSharedStore } from 'src/stores/shared'

const props = defineProps({
  // buildingData: {
  //   type: Object,
  //   required: true,
  // },
  location: {
    type: Array,
    required: true,
  },
  // initialFloors: {
  //   type: Array,
  //   required: false,
  //   default: () => [],
  // },
})
const newFloorOrder = ref(1)
const newFloorWidth = ref(25.5)
const newFloorHeight = ref(3.0)
const levels = ref([])
const mapZoom = ref(18)
const mapCenter = ref(props.location)
const drawingMode = ref(false)
const currentPolygon = ref(null)
const map = ref(null)
const saving = ref(false)

const sharedStore = useSharedStore()

// Drawing control
let drawControl = null
let drawnItems = null

// Computed property for form validation
const canAddFloor = computed(() => {
  return (
    currentPolygon.value &&
    newFloorOrder.value > 0 &&
    newFloorWidth.value > 0 &&
    newFloorHeight.value > 0 &&
    !levels.value.some((l) => l.order_of_floor === newFloorOrder.value)
  )
})

const addLevel = async () => {
  if (!canAddFloor.value) return

  try {
    saving.value = true

    // Convert polygon coordinates to server format
    const shape = currentPolygon.value.map((coord) => ({
      lat: coord[0].toString(),
      lang: coord[1].toString(),
      alt: '0', // Default altitude
    }))

    // Create new floor data in server format
    const newFloorData = {
      order_of_floor: newFloorOrder.value,
      width: newFloorWidth.value,
      height: newFloorHeight.value,
      shape: shape,
    }

    // Get current building floors
    const currentFloors = [...(sharedStore.buildingFormData.floors || [])]

    // Add the new floor
    currentFloors.push(newFloorData)

    // Update building with new floors
    await sharedStore.updateBuilding({
      buildingId: sharedStore.buildingFormData.id,
      buildingData: {
        floors: currentFloors,
      },
    })

    // Update local levels for UI display
    const floorName = `طبقه ${newFloorOrder.value}`
    levels.value.push({
      name: floorName,
      order_of_floor: newFloorOrder.value,
      width: newFloorWidth.value,
      height: newFloorHeight.value,
      polygon: currentPolygon.value ? [...currentPolygon.value] : null,
    })

    // Reset form
    resetFloorForm()

    console.log('Floor added successfully:', newFloorData)
  } catch (error) {
    console.error('Error adding floor:', error)
  } finally {
    saving.value = false
  }
}

const resetFloorForm = () => {
  newFloorOrder.value = getNextFloorOrder()
  newFloorWidth.value = 25.5
  newFloorHeight.value = 3.0
  currentPolygon.value = null
  clearPolygon()
}

const getNextFloorOrder = () => {
  if (levels.value.length === 0) return 1
  const maxOrder = Math.max(...levels.value.map((l) => l.order_of_floor || 0))
  return maxOrder + 1
}

const el = useTemplateRef('el')

const { option } = useSortable(el, levels, {
  handle: '.handle',
})

option('animation', 200)

const removeLevel = async (level) => {
  try {
    // Get current building floors
    const currentFloors = [...(sharedStore.buildingFormData.floors || [])]

    // Remove the floor by order_of_floor
    const updatedFloors = currentFloors.filter((f) => f.order_of_floor !== level.order_of_floor)

    // Update building with remaining floors
    await sharedStore.updateBuilding({
      buildingId: sharedStore.buildingFormData.id,
      buildingData: {
        floors: updatedFloors,
      },
    })

    // Update local levels for UI display
    levels.value = levels.value.filter((l) => l.order_of_floor !== level.order_of_floor)

    console.log('Floor removed successfully:', level.order_of_floor)
  } catch (error) {
    console.error('Error removing floor:', error)
  }
}

const toggleDrawingMode = () => {
  if (drawingMode.value) {
    // Cancel drawing
    if (drawControl) {
      map.value.leafletObject.removeControl(drawControl)
      drawControl = null
    }
    drawingMode.value = false
  } else {
    // Start drawing
    startDrawing()
  }
}

const startDrawing = () => {
  if (!map.value?.leafletObject) return

  const mapInstance = map.value.leafletObject

  // Create a FeatureGroup to store editable layers
  drawnItems = new L.FeatureGroup()
  mapInstance.addLayer(drawnItems)

  // Initialize the draw control and pass it the FeatureGroup of editable layers
  drawControl = new L.Control.Draw({
    draw: {
      polygon: {
        allowIntersection: false,
        drawError: {
          color: '#e1e100',
          message: '<strong>خطا:</strong> شکل نمی‌تواند خودش را قطع کند!',
        },
        shapeOptions: {
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.3,
        },
      },
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
    },
    edit: {
      featureGroup: drawnItems,
      remove: false,
    },
  })

  mapInstance.addControl(drawControl)
  drawingMode.value = true

  // Handle drawing events
  mapInstance.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer
    drawnItems.addLayer(layer)

    // Get polygon coordinates
    const coordinates = layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng])
    currentPolygon.value = coordinates

    // Remove the draw control after drawing
    mapInstance.removeControl(drawControl)
    drawControl = null
    drawingMode.value = false
  })

  mapInstance.on(L.Draw.Event.DRAWSTOP, () => {
    drawingMode.value = false
  })
}

const clearPolygon = () => {
  currentPolygon.value = null
  if (drawnItems) {
    drawnItems.clearLayers()
  }
}

// const calculateArea = (polygon) => {
//   if (!polygon || polygon.length < 3) return 0

//   // Simple area calculation (approximate)
//   // For more accurate calculation, you might want to use a library like turf.js
//   let area = 0
//   for (let i = 0; i < polygon.length; i++) {
//     const j = (i + 1) % polygon.length
//     area += polygon[i][0] * polygon[j][1]
//     area -= polygon[j][0] * polygon[i][1]
//   }
//   area = Math.abs(area) / 2

//   // Convert to square meters (rough approximation)
//   return Math.round(area * 111320 * 111320 * Math.cos((polygon[0][0] * Math.PI) / 180))
// }

onMounted(() => {
  // Fix for default markers not working with bundlers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  // Initialize with provided floors data (if any)
  if (sharedStore.buildingFormData.floors && sharedStore.buildingFormData.floors.length) {
    const mapped = sharedStore.buildingFormData.floors.map((floor, idx) => ({
      name:
        typeof floor.order_of_floor !== 'undefined' && floor.order_of_floor !== null
          ? `طبقه ${floor.order_of_floor}`
          : `طبقه ${floor.id ?? idx + 1}`,
      order_of_floor: floor.order_of_floor ?? idx + 1,
      width: floor.width || 25.5,
      height: floor.height || 3.0,
      polygon: Array.isArray(floor.shape)
        ? floor.shape
            .map((p) => {
              const lat = parseFloat(p.lat)
              const lng = parseFloat(p.lang ?? p.lng)
              if (isNaN(lat) || isNaN(lng)) return null
              return [lat, lng]
            })
            .filter(Boolean)
        : null,
    }))

    levels.value = mapped

    // Set next floor order
    newFloorOrder.value = getNextFloorOrder()

    // Show first polygon (if exists) as the initial preview
    const firstWithPolygon = mapped.find((f) => Array.isArray(f.polygon) && f.polygon.length >= 3)
    if (firstWithPolygon) {
      currentPolygon.value = [...firstWithPolygon.polygon]
    }
  } else {
    // No existing floors, start with floor 1
    newFloorOrder.value = 1
  }
})
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
