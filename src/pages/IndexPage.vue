<template>
  <q-page class="flex flex-center main-view">
    <div class="main-view__map-container" dir="ltr">
      <l-map ref="map" v-model:zoom="zoom" :center="center" :options="{ zoomControl: false }">
        <l-tile-layer
          :url="getEnv('OPEN_STREET_TILE_API')"
          layer-type="base"
          name="OpenStreetMap"
        />
        <l-marker v-if="selectedLocation.marker" :lat-lng="selectedLocation.marker"></l-marker>

        <!-- Equipment markers from selected floor -->
        <l-marker
          v-for="equipment in equipmentMarkers"
          :key="equipment.id"
          :lat-lng="equipment.position"
          :icon="createEquipmentIcon(equipment)"
        >
          <l-popup>
            <div class="equipment-popup">
              <div class="text-weight-bold">{{ equipment.name }}</div>
              <div class="text-caption">وضعیت: {{ equipment.status }}</div>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>

    <SearchBox v-if="!selectedLocation.showModal" @select-location="selectLocation" />

    <FloorSelector
      :show-selector="selectedLocation.showModal"
      :building-data="sharedStore.buildingFormData"
      @floor-selected="onFloorSelected"
    />

    <BuildingInfoDialog
      v-model="selectedLocation.showModal"
      :location="selectedLocation.data"
      :buildingData="sharedStore.buildingFormData"
      @update:model-value="closeSelectedLocation"
      @edit-building-info="editBuildingInfo"
      @edit-pip="editPip"
    />

    <AiDialog v-model="aiDialog" :aiAnswer="sharedStore.buildingData.pip" />
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import SearchBox from 'src/components/SearchBox.vue'
import BuildingInfoDialog from 'src/components/‌BuildingInfoDialog.vue'
import FloorSelector from 'src/components/FloorSelector.vue'
import { getEnv } from 'src/utils'
import { useSharedStore } from 'src/stores/shared'
import { useSearchStore } from 'src/stores/search'
import usePromise from 'src/composables/usePromise.composable'
import { getIconUrl } from 'src/utils/hazardIcons'

const zoom = ref(12)
const map = ref(null)
const center = ref([36.2974945, 59.6059232])
const router = useRouter()
const sharedStore = useSharedStore()
const searchStore = useSearchStore()
const aiDialog = ref(false)

const selectedLocation = reactive({
  marker: sharedStore.location,
  data: sharedStore.buildingData,
  showModal: !!sharedStore.location,
})

const selectedFloor = ref(null)
const equipmentMarkers = ref([])

// Fix for default markers not working with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const { execute: searchBuildingInfo } = usePromise(async ({ lat, lng }) => {
  const response = await searchStore.searchBuildingInfo({ lat, lng })
  sharedStore.buildingFormData = response
  generatePIP({ buildingData: response })
})

const { execute: generatePIP } = usePromise(async ({ buildingData }) => {
  const response = await sharedStore.generatePIP({ buildingData })
  console.log(response)
})

const selectLocation = (location) => {
  selectedLocation.data = location
  selectedLocation.showModal = true

  const lat = parseFloat(location.lat)
  const lon = parseFloat(location.lon)

  selectedLocation.marker = [lat, lon]

  center.value = [lat, lon]
  map.value?.leafletObject.flyTo([lat, lon], 18)
  setTimeout(() => {
    zoom.value = 18
  }, 500)

  searchBuildingInfo({ lat, lng: lon })
}

const closeSelectedLocation = () => {
  sharedStore.location = null
  sharedStore.buildingData = { pip: '' }
  selectedLocation.data = null
  selectedLocation.marker = null
  selectedLocation.showModal = false
  sharedStore.buildingFormData = {}
  selectedFloor.value = null
  equipmentMarkers.value = []
}

const editBuildingInfo = () => {
  sharedStore.location = selectedLocation.marker
  sharedStore.buildingData = { pip: '', ...selectedLocation.data }
  router.push({ name: 'edit-building' })
}

const editPip = () => {
  aiDialog.value = true
  console.log('editPip')
}

// Equipment icon creation function
const createEquipmentIcon = (equipment) => {
  const iconUrl = getIconUrl(equipment.icon)

  if (iconUrl) {
    // Use the actual SVG icon
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: 'equipment-icon-marker',
    })
  } else {
    // Fallback to div icon with equipment icon ID
    return L.divIcon({
      html: `
        <div style="
          background: #1976d2;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-weight: bold;
        ">
          ${equipment.icon || '?'}
        </div>
      `,
      className: 'equipment-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    })
  }
}

// Floor selection handler
const onFloorSelected = (floor) => {
  selectedFloor.value = floor

  if (floor) {
    // Combine equipments and widgets from the floor
    const allEquipments = []

    // Add equipments
    if (floor.equipments) {
      floor.equipments.forEach((equipment) => {
        allEquipments.push({
          id: `equipment-${equipment.id}`,
          name: equipment.widget.name,
          description: equipment.widget.description,
          status: equipment.status,
          position: [
            parseFloat(equipment.widget.location.lat),
            parseFloat(equipment.widget.location.lang), // Note: API uses 'lang' instead of 'lng'
          ],
          icon: equipment.widget.icon,
        })
      })
    }

    equipmentMarkers.value = allEquipments
  } else {
    // Clear equipment markers when no floor is selected
    equipmentMarkers.value = []
  }
}
</script>

<style lang="scss" scoped>
.main-view {
  &__map-container {
    width: 100%;
    height: 100vh;
  }
}
</style>

<style lang="scss">
.equipment-popup {
  min-width: 150px;
  text-align: center;

  .text-weight-bold {
    margin-bottom: 4px;
    color: #1976d2;
  }

  .text-caption {
    margin-bottom: 2px;
    color: #666;
  }
}

.equipment-marker {
  border: none !important;
  background: transparent !important;
}

.equipment-icon-marker {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
