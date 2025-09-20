<template>
  <div class="flex column q-pa-md">
    <q-select
      v-model="selectedBuilding"
      :options="buildingFloors"
      label="انتخاب طبقه"
      option-label="name"
      @update:model-value="handleBuildingChangeFloor"
    />

    <FileUploader
      :files="buildingImages"
      accept=".jpg,.png,.jpeg"
      multiple
      @update:files="handleFilesUpdate"
      class="q-mt-lg"
      :loading="loading"
    />

    <div v-if="loading" class="flex justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <span class="q-ml-sm">بارگذاری تصاویر...</span>
    </div>

    <div v-else>
      <h6 v-if="images.length === 0" class="text-grey-6 text-center q-pa-md">
        {{
          selectedBuilding
            ? 'هیچ تصویری برای این طبقه ذخیره نشده است'
            : 'هیچ تصویری برای این ساختمان ذخیره نشده است'
        }}
      </h6>

      <div v-else class="q-mt-md">
        <h6 class="q-mb-md">
          {{ selectedBuilding ? `تصاویر ${selectedBuilding.name}` : 'تصاویر ساختمان' }}
          ({{ images.length }} تصویر)
        </h6>

        <div class="row">
          <div v-for="image in images" :key="image.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="image-card">
              <q-img
                :src="image.image"
                :alt="image.description"
                class="image-preview"
                style="height: 200px"
                fit="cover"
              />
              <q-card-section>
                <div class="text-caption text-grey-7">
                  {{ image.description }}
                </div>
                <div class="text-caption text-grey-5">
                  {{ new Date(image.createdAt).toLocaleDateString('fa-IR') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="delete"
                  @click="deleteImage(image.id)"
                  size="sm"
                >
                  حذف
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useSharedStore } from 'src/stores/shared'
import { imageDB } from 'src/utils/indexedDB'

const sharedStore = useSharedStore()
const buildingImages = ref([])
const selectedBuilding = ref(null)
const images = ref([])
const loading = ref(false)

const buildingFloors = computed(
  () =>
    sharedStore.buildingFormData?.floors?.map((floor) => ({
      name: `طبقه ${floor.order_of_floor}`,
      ...floor,
    })) || [],
)

const handleBuildingChangeFloor = async (floor) => {
  console.log('Selected floor:', floor)

  if (floor && floor.id) {
    // Load images for the selected floor from IndexedDB
    try {
      loading.value = true
      const floorImages = await imageDB.getFloorImages(sharedStore.buildingFormData?.id, floor.id)
      images.value = floorImages
    } catch (error) {
      console.error('Error loading floor images:', error)
      images.value = []
    } finally {
      loading.value = false
    }
  } else {
    // Load building-level images when no floor is selected
    await loadBuildingImages()
  }
}

const loadBuildingImages = async () => {
  try {
    loading.value = true
    const buildingImages = await imageDB.getBuildingImages(sharedStore.buildingFormData?.id)
    images.value = buildingImages
  } catch (error) {
    console.error('Error loading building images:', error)
    images.value = []
  } finally {
    loading.value = false
  }
}

const handleFilesUpdate = async (files) => {
  try {
    loading.value = true
    const buildingId = sharedStore.buildingFormData?.id

    if (!buildingId) {
      console.error('No building ID available')
      return
    }

    for (const file of files) {
      let storedImage

      if (!selectedBuilding.value) {
        // Store as building-level image (no floor ID)
        storedImage = await imageDB.storeImage(file, buildingId, null, file.name)
      } else {
        // Store as floor-level image
        storedImage = await imageDB.storeImage(
          file,
          buildingId,
          selectedBuilding.value.id,
          file.name,
        )
      }

      // Add the new image to the current display
      images.value = [...images.value, storedImage]
    }

    console.log('Images stored successfully in IndexedDB')
  } catch (error) {
    console.error('Error storing images:', error)
  } finally {
    loading.value = false
  }
}

const deleteImage = async (imageId) => {
  try {
    await imageDB.deleteImage(imageId)

    // Remove from current display
    images.value = images.value.filter((img) => img.id !== imageId)

    console.log('Image deleted successfully')
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

onMounted(async () => {
  // Initialize IndexedDB
  try {
    await imageDB.init()

    // Load building-level images by default
    await loadBuildingImages()
  } catch (error) {
    console.error('Error initializing IndexedDB or loading images:', error)
    images.value = []
  }
})
</script>
