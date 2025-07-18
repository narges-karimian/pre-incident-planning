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
      </l-map>
    </div>

    <SearchBox v-if="!selectedLocation.showModal" @select-location="selectLocation" />
    <BuildingInfoDialog
      v-model="selectedLocation.showModal"
      :location="selectedLocation.data"
      @update:model-value="closeSelectedLocation"
      @edit-building-info="editBuildingInfo"
      @edit-pip="editPip"
    />
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SearchBox from 'src/components/SearchBox.vue'
import BuildingInfoDialog from 'src/components/‌BuildingInfoDialog.vue'
import { getEnv } from 'src/utils'

const zoom = ref(12)
const map = ref(null)
const center = ref([36.2974945, 59.6059232])
const router = useRouter()

const selectedLocation = reactive({
  marker: null,
  data: null,
  showModal: false,
})

// Fix for default markers not working with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const selectLocation = (location) => {
  selectedLocation.data = location
  selectedLocation.showModal = true

  const lat = parseFloat(location.lat)
  const lon = parseFloat(location.lon)
  selectedLocation.marker = [lat, lon]

  center.value = [lat, lon]
  map.value?.leafletObject.flyTo([lat, lon], 17)
  setTimeout(() => {
    zoom.value = 17
  }, 500)
}

const closeSelectedLocation = () => {
  selectedLocation.data = null
  selectedLocation.marker = null
  selectedLocation.showModal = false
}

const editBuildingInfo = () => {
  console.log('editBuildingInfo')
  router.push({ name: 'edit-building', params: { id: selectedLocation.data.id } })
}

const editPip = () => {
  console.log('editPip')
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
