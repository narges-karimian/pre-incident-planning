<template>
  <div class="q-gutter-md q-pa-md">
    <!-- Floor Selection -->
    <div class="text-h6 text-center q-my-md">مدیریت ویجت های طبقات</div>

    <q-select
      v-model="selectedFloor"
      :options="buildingFloors"
      label="انتخاب طبقه"
      option-label="name"
      @update:model-value="handleFloorChange"
      class="q-mb-md"
    />

    <!-- Action Buttons -->
    <div class="row q-gutter-sm q-mb-md">
      <q-btn
        color="primary"
        icon="add"
        label="افزودن"
        @click="showHazardSelector = true"
        :disable="!selectedFloor"
      />
    </div>

    <!-- Hazard List -->
    <q-list v-if="floorHazards.length > 0" bordered class="rounded-borders q-mb-md">
      <q-item-label header>ویجت های موجود</q-item-label>
      <q-item v-for="hazard in floorHazards" :key="hazard.id" class="q-py-sm">
        <q-item-section avatar>
          <div class="hazard-icon-container">
            <img
              v-if="getIconUrl(hazard.iconId)"
              :src="getIconUrl(hazard.iconId)"
              :alt="hazard.iconName"
              style="width: 32px; height: 32px; object-fit: contain"
              @error="handleIconError"
            />
            <div
              v-else
              class="fallback-icon"
              style="
                width: 32px;
                height: 32px;
                background-color: #1976d2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              "
            >
              {{ hazard.iconId }}
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ hazard.iconName }}</q-item-label>
          <q-item-label caption>{{ hazard.description }}</q-item-label>
          <q-item-label caption>وضعیت: {{ getStatusLabel(hazard.status) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn size="sm" flat round icon="edit" @click="editHazard(hazard)" />
            <q-btn size="sm" flat round icon="delete" @click="deleteHazard(hazard)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Hazard Icon Selector Dialog -->
    <q-dialog v-model="showHazardSelector" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h8">انتخاب نوع خطر</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-tabs v-model="hazardCategory" dense class="text-grey" active-color="primary">
            <q-tab
              v-for="tab in HAZARD_TABS"
              :key="tab.value"
              :name="tab.value"
              :label="tab.label"
            />
          </q-tabs>

          <q-tab-panels v-model="hazardCategory" animated>
            <q-tab-panel
              v-for="tab in HAZARD_TABS"
              :key="tab.value"
              :name="tab.value"
              class="q-pa-none"
            >
              <div class="row q-gutter-sm">
                <q-card
                  v-for="icon in getIconsByCategory(tab.value)"
                  :key="icon.iconId"
                  class="hazard-icon-card cursor-pointer"
                  @click="selectHazardIcon(icon)"
                >
                  <q-card-section class="text-center">
                    <div class="icon-display-container">
                      <img
                        v-if="getIconUrl(icon.iconId)"
                        :src="getIconUrl(icon.iconId)"
                        :alt="icon.iconName.label"
                        style="width: 40px; height: 40px; object-fit: contain"
                        @error="handleIconError"
                      />
                      <div
                        v-else
                        class="fallback-icon"
                        style="
                          width: 40px;
                          height: 40px;
                          background-color: #1976d2;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: bold;
                          font-size: 10px;
                        "
                      >
                        {{ icon.iconId }}
                      </div>
                    </div>
                    <div class="text-caption">{{ icon.iconName.key }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="انصراف" @click="showHazardSelector = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Map Dialog for Placing Hazard -->
    <q-dialog v-model="showMapDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h8">انتخاب موقعیت ویجت</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption q-mb-md">
            <q-icon name="info" class="q-mr-xs" />
            روی نقشه کلیک کنید تا موقعیت ویجت را انتخاب کنید.
            <span v-if="tempHazardLocation" class="text-positive">
              <q-icon name="check_circle" class="q-ml-xs" />
              موقعیت انتخاب شد
            </span>
          </div>

          <!-- Map Container -->
          <div class="map-container" dir="ltr" :class="{ 'placing-hazard': showMapDialog }">
            <l-map
              ref="map"
              v-model:zoom="mapZoom"
              :center="mapCenter"
              :options="{ zoomControl: false }"
              style="height: 75vh; width: 100%"
            >
              <l-tile-layer
                :url="getEnv('OPEN_STREET_TILE_API')"
                layer-type="base"
                name="OpenStreetMap"
              />

              <!-- Floor Polygon -->
              <l-polygon
                v-if="selectedFloor?.polygon"
                :lat-lngs="selectedFloor.polygon"
                color="blue"
                :fill-color="'blue'"
                :fill-opacity="0.1"
                :weight="2"
              />

              <!-- Existing Hazards -->
              <l-marker
                v-for="hazard in floorHazards"
                :key="hazard.id"
                :lat-lng="hazard.location"
                :icon="createLeafletIcon(hazard.iconId)"
                @click="editHazard(hazard)"
              >
                <l-popup>
                  <div class="hazard-popup">
                    <div class="text-weight-bold">{{ hazard.iconName }}</div>
                    <div class="text-caption">{{ hazard.description }}</div>
                    <div class="text-caption">وضعیت: {{ getStatusLabel(hazard.status) }}</div>
                    <q-btn size="sm" color="primary" @click="editHazard(hazard)" class="q-mt-xs">
                      ویرایش
                    </q-btn>
                  </div>
                </l-popup>
              </l-marker>

              <!-- Temporary Hazard Marker (when placing new hazard) -->
              <l-marker
                v-if="tempHazardLocation && selectedHazardIcon"
                :lat-lng="tempHazardLocation"
                :icon="createLeafletIcon(selectedHazardIcon.iconId)"
              />
            </l-map>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="انصراف" @click="cancelMapDialog" />
          <q-btn
            flat
            label="تایید موقعیت"
            color="primary"
            @click="confirmLocation"
            :disable="!tempHazardLocation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Hazard Form Dialog -->
    <q-dialog v-model="showHazardForm" persistent>
      <q-card style="width: 100%">
        <q-card-section>
          <div class="text-h8">{{ editingHazard ? 'ویجت خطر' : 'افزودن ویجت جدید' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveHazard" class="q-gutter-md">
            <div v-if="selectedHazardIcon" class="text-center q-mb-md">
              <div class="selected-icon-container">
                <img
                  v-if="getIconUrl(selectedHazardIcon.iconId)"
                  :src="getIconUrl(selectedHazardIcon.iconId)"
                  :alt="selectedHazardIcon.iconName.key"
                  style="width: 64px; height: 64px; object-fit: contain; margin-bottom: 8px"
                  @error="handleIconError"
                />
                <div
                  v-else
                  class="fallback-icon"
                  style="
                    width: 64px;
                    height: 64px;
                    background-color: #1976d2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                    margin: 0 auto 8px auto;
                  "
                >
                  {{ selectedHazardIcon.iconId }}
                </div>
              </div>
              <div class="text-h8 text-weight-thin">{{ selectedHazardIcon.iconName.key }}</div>
              <div class="text-caption">{{ selectedHazardIcon.iconDesc }}</div>
            </div>

            <q-select
              v-model="hazardForm.status"
              :options="hazardStatusOptions"
              label="وضعیت ویجت"
              filled
              dense
              option-label="label"
              option-value="value"
              :rules="[(val) => !!val || 'وضعیت الزامی است']"
            />
            <q-input
              v-model="hazardForm.description"
              label="توضیحات ویجت (اختیاری)"
              type="textarea"
              filled
              dense
            />

            <div class="row q-gutter-sm">
              <q-btn label="انصراف" flat @click="cancelHazardForm" />
              <q-btn label="ذخیره" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h8">تایید حذف</div>
        </q-card-section>

        <q-card-section class="q-pt-none text-caption">
          آیا از حذف این ویجت اطمینان دارید؟
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="انصراف" @click="showDeleteConfirm = false" dense />
          <q-btn flat label="حذف" color="negative" @click="confirmDeleteHazard" dense />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { LMap, LTileLayer, LMarker, LPolygon, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { getEnv } from 'src/utils'
import { getIconUrl, getIconsByCategory, createLeafletIcon } from 'src/utils/hazardIcons'
import { useSharedStore } from 'src/stores/shared'

const props = defineProps({
  location: {
    type: Array,
    required: true,
  },
})

// Reactive data
const selectedFloor = ref(null)
const mapZoom = ref(18)
const mapCenter = ref(props.location)
const map = ref(null)
const floorHazards = ref([])
const placingHazard = ref(false)
const tempHazardLocation = ref(null)
const selectedHazardIcon = ref(null)
const editingHazard = ref(null)

// Dialog states
const showHazardSelector = ref(false)
const showMapDialog = ref(false)
const showHazardForm = ref(false)
const showDeleteConfirm = ref(false)
const hazardCategory = ref('AccessHazards')

// Form data
const hazardForm = ref({
  description: '',
  status: '',
})

const sharedStore = useSharedStore()

const buildingFloors = computed(
  () =>
    sharedStore.buildingFormData?.floors?.map((floor) => ({
      name: `طبقه ${floor.order_of_floor}`,
      ...floor,
    })) || [],
)

// Equipment status options (based on the provided structure)

const hazardStatusOptions = [
  { label: 'بررسی شده', value: 'checked' },
  { label: 'تکمیل شده', value: 'filled' },
  { label: 'غیر قابل استفاده', value: 'not_working' },
  { label: 'منقضی شده', value: 'out_of_date' },
]

const HAZARD_TABS = [
  { label: 'خطرات دسترسی', value: 'AccessHazards' },
  { label: 'پیش طرح', value: 'Preplan' },
  { label: 'نقاط خطر با جزئیات', value: 'HazardPointsDetailed' },
  { label: 'خطوط نجات', value: 'Lifelines' },
  { label: 'مواد خطرناک', value: 'HazardousMaterials' },
  { label: 'خطرات انسانی', value: 'HumanCausedHazards' },
  { label: 'حادثه', value: 'Incident' },
  { label: 'زیرساخت', value: 'Infrastructure' },
  { label: 'خطرات طبیعی', value: 'NaturalHazards' },
  { label: 'موقعیت NIMS', value: 'NIMSPositions' },
  { label: 'هشدار عمومی', value: 'PublicAlert' },
  { label: 'منابع', value: 'Resources' },
  { label: 'USAR', value: 'USAR' },
]

// Methods
const handleFloorChange = (floor) => {
  if (floor) {
    selectedFloor.value = floor
    mapCenter.value = floor.polygon ? getPolygonCenter(floor.polygon) : props.location
    loadFloorHazards(floor)
  }
}

const getPolygonCenter = (polygon) => {
  if (!polygon || polygon.length === 0) return props.location

  const latSum = polygon.reduce((sum, point) => sum + point[0], 0)
  const lngSum = polygon.reduce((sum, point) => sum + point[1], 0)

  return [latSum / polygon.length, lngSum / polygon.length]
}

const loadFloorHazards = (floor) => {
  // Load hazards/equipments for the selected floor from buildingFormData
  const equipments = floor?.equipments || []

  // Convert equipment structure to hazard structure for UI compatibility
  floorHazards.value = equipments.map((equipment) => ({
    id: equipment.id,
    iconId: equipment.widget.icon,
    iconName: equipment.widget.name,
    description: equipment.widget.description,
    status: equipment.status,
    location: [
      parseFloat(equipment.widget.location.lat),
      parseFloat(equipment.widget.location.lang), // Note: API uses 'lang' instead of 'lng'
    ],
    floorId: floor.id,
    equipmentData: equipment, // Keep original equipment data for server updates
  }))
}

const selectHazardIcon = (icon) => {
  selectedHazardIcon.value = icon
  showHazardSelector.value = false
  showMapDialog.value = true
  startPlacingHazard()
}

const initializeMapClickListener = () => {
  nextTick(() => {
    if (map.value?.leafletObject) {
      // Remove any existing click listeners first
      map.value.leafletObject.off('click')

      // Add new click listener
      map.value.leafletObject.once('click', (e) => {
        tempHazardLocation.value = [e.latlng.lat, e.latlng.lng]
        placingHazard.value = true // Keep this true to show the marker
      })
    } else {
      // Fallback: try again after a short delay
      setTimeout(() => {
        if (map.value?.leafletObject) {
          map.value.leafletObject.off('click')
          map.value.leafletObject.once('click', (e) => {
            tempHazardLocation.value = [e.latlng.lat, e.latlng.lng]
            placingHazard.value = true // Keep this true to show the marker
          })
        }
      }, 500)
    }
  })
}

const startPlacingHazard = () => {
  placingHazard.value = true
  tempHazardLocation.value = null
  initializeMapClickListener()
}

// Add watcher for showMapDialog
watch(showMapDialog, (newVal) => {
  if (newVal && selectedHazardIcon.value) {
    // When map dialog opens, initialize the click listener
    nextTick(() => {
      initializeMapClickListener()
    })
  }
})

const confirmLocation = () => {
  if (tempHazardLocation.value) {
    showMapDialog.value = false
    showHazardForm.value = true
  }
}

const cancelMapDialog = () => {
  showMapDialog.value = false
  placingHazard.value = false
  tempHazardLocation.value = null
  selectedHazardIcon.value = null
}

const saveHazard = async () => {
  if (!selectedHazardIcon.value || !tempHazardLocation.value || !selectedFloor.value) return

  try {
    // Convert hazard form data to equipment structure for server
    const equipmentData = {
      widget: {
        location: {
          lat: tempHazardLocation.value[0].toString(),
          lang: tempHazardLocation.value[1].toString(), // Note: API uses 'lang' instead of 'lng'
          alt: '0', // Default altitude
        },
        name: selectedHazardIcon.value.iconName.key,
        icon: selectedHazardIcon.value.iconId,
        description: hazardForm.value.description || selectedHazardIcon.value.iconName.key,
      },
      status: hazardForm.value.status.value || hazardForm.value.status, // Handle both object and string values
    }

    // Get current building data
    const currentFloors = [...sharedStore.buildingFormData.floors]
    const floorIndex = currentFloors.findIndex((f) => f.id === selectedFloor.value.id)

    if (floorIndex === -1) return

    let updatedFloor = { ...currentFloors[floorIndex] }

    if (editingHazard.value) {
      // Update existing equipment
      if (!updatedFloor.equipments) updatedFloor.equipments = []

      const equipmentIndex = updatedFloor.equipments.findIndex(
        (e) => e.id === editingHazard.value.id,
      )
      if (equipmentIndex !== -1) {
        // Keep the existing ID for updates
        equipmentData.id = editingHazard.value.id
        updatedFloor.equipments[equipmentIndex] = equipmentData
      }
    } else {
      // Add new equipment (server will assign ID)
      if (!updatedFloor.equipments) updatedFloor.equipments = []
      updatedFloor.equipments.push(equipmentData)
    }

    // Update the floors array
    currentFloors[floorIndex] = updatedFloor

    // Send update to server
    const response = await sharedStore.updateBuilding({
      buildingId: sharedStore.buildingFormData.id,
      buildingData: {
        floors: currentFloors,
      },
    })

    // Reload floor hazards from updated data
    const updatedFloorData = response.floors.find((f) => f.id === selectedFloor.value.id)
    if (updatedFloorData) {
      loadFloorHazards(updatedFloorData)
    }

    // Reset form
    resetHazardForm()
    console.log('Equipment saved successfully')
  } catch (error) {
    console.error('Error saving equipment:', error)
  }
}

const editHazard = (hazard) => {
  editingHazard.value = hazard
  selectedHazardIcon.value = {
    iconId: hazard.iconId,
    iconName: { key: hazard.iconName },
  }
  hazardForm.value.description = hazard.description

  // Find the status option that matches
  const statusOption = hazardStatusOptions.find(
    (opt) => opt.value === hazard.status || opt.label === hazard.status,
  )
  hazardForm.value.status = statusOption || hazard.status

  tempHazardLocation.value = hazard.location
  showHazardForm.value = true
}

const deleteHazard = (hazard) => {
  editingHazard.value = hazard
  showDeleteConfirm.value = true
}

const confirmDeleteHazard = async () => {
  if (!editingHazard.value || !selectedFloor.value) return

  try {
    // Get current building data
    const currentFloors = [...sharedStore.buildingFormData.floors]
    const floorIndex = currentFloors.findIndex((f) => f.id === selectedFloor.value.id)

    if (floorIndex === -1) return

    let updatedFloor = { ...currentFloors[floorIndex] }

    // Remove equipment from floor
    if (updatedFloor.equipments) {
      updatedFloor.equipments = updatedFloor.equipments.filter(
        (e) => e.id !== editingHazard.value.id,
      )
    }

    // Update the floors array
    currentFloors[floorIndex] = updatedFloor

    // Send update to server
    await sharedStore.updateBuilding({
      buildingId: sharedStore.buildingFormData.id,
      buildingData: {
        floors: currentFloors,
      },
    })

    // Reload floor hazards from updated data
    const updatedFloorData = sharedStore.buildingFormData.floors.find(
      (f) => f.id === selectedFloor.value.id,
    )
    if (updatedFloorData) {
      loadFloorHazards(updatedFloorData)
    }

    console.log('Equipment deleted successfully')
  } catch (error) {
    console.error('Error deleting equipment:', error)
  }

  showDeleteConfirm.value = false
  editingHazard.value = null
}

const cancelHazardForm = () => {
  resetHazardForm()
}

const resetHazardForm = () => {
  showHazardForm.value = false
  placingHazard.value = false
  tempHazardLocation.value = null
  selectedHazardIcon.value = null
  editingHazard.value = null
  hazardForm.value = {
    description: '',
    status: '',
  }
}

const handleIconError = (event) => {
  console.warn('Icon failed to load:', event.target.src)
  // Hide the broken image
  event.target.style.display = 'none'

  // Check if fallback already exists to avoid duplicates
  const parent = event.target.parentNode
  if (parent && !parent.querySelector('.icon-error-fallback')) {
    const fallback = document.createElement('div')
    fallback.className = 'icon-error-fallback'
    fallback.style.cssText = `
      width: ${event.target.style.width || '32px'};
      height: ${event.target.style.height || '32px'};
      background-color: #ff4444;
      border: 2px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    `
    fallback.textContent = '!'
    parent.appendChild(fallback)
  }
}

const getStatusLabel = (status) => {
  const statusMap = {
    checked: 'بررسی شده',
    active: 'فعال',
    inactive: 'غیرفعال',
    investigating: 'در حال بررسی',
    resolved: 'حل شده',
    action_required: 'نیاز به اقدام',
  }
  return statusMap[status] || status
}

// Lifecycle
onMounted(() => {
  // Fix for default markers not working with bundlers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  // Set default floor if available and load its hazards
  if (buildingFloors.value.length > 0) {
    selectedFloor.value = buildingFloors.value[0]
    handleFloorChange(selectedFloor.value)
  }
})
</script>

<style scoped>
.hazard-icon-card {
  width: 120px;
  transition: all 0.3s ease;
}

.hazard-icon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hazard-popup {
  min-width: 200px;
}

.cursor-pointer {
  cursor: pointer;
}

.placing-hazard :deep(.leaflet-container) {
  cursor: crosshair !important;
}

:deep(.hazard-icon) {
  background: transparent !important;
  border: none !important;
}

.hazard-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-display-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.selected-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fallback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}
</style>
