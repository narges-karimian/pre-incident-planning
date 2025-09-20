<template>
  <q-dialog v-model="dialog" persistent no-shake position="bottom">
    <q-card class="fullscreen-dialog">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="general" icon="home" />
        <q-tab name="checklist" icon="list" />
        <q-tab name="floors" icon="layers" />
        <q-tab name="hazards" icon="warning" />
        <q-tab name="files" icon="file_present" />
        <!-- <q-tab name="users" icon="group" /> -->
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="general" class="q-pa-none">
          <GeneralForm @save="updateFormData('general', $event)" @cancel="cancelEditBuilding" />
        </q-tab-panel>

        <q-tab-panel name="checklist" class="q-pa-none">
          <ChecklistForm @save="updateFormData('checklist', $event)" />
        </q-tab-panel>

        <q-tab-panel name="floors" class="q-pa-none">
          <FloorsForm :buildingData="sharedStore.buildingData" :location="sharedStore.location" />
        </q-tab-panel>

        <q-tab-panel name="hazards" class="q-pa-none">
          <HazardForm
            :buildingFloors="buildingFloors"
            :location="sharedStore.location"
            @update:hazards="updateHazards"
          />
        </q-tab-panel>

        <q-tab-panel name="files" class="q-pa-none">
          <AttachmentForm
            :building="sharedStore.buildingData"
            :building-floors="sharedStore.buildingData?.floors || []"
          />
        </q-tab-panel>
        <!-- 
        <q-tab-panel name="users" class="q-pa-none">
          <UsersForm :buildingFloors="buildingFloors" />
        </q-tab-panel> -->
      </q-tab-panels>
      <!-- 
      <q-card-actions align="right">
        <q-btn label="Save All" color="primary" @click="saveAll" />
        <q-btn label="Cancel" flat @click="cancel" />
      </q-card-actions> -->
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSharedStore } from 'src/stores/shared'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const sharedStore = useSharedStore()
const router = useRouter()
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const activeTab = ref('general')

// Store form data from all tabs
const formData = ref({
  general: {},
  occupancy: {},
  construction: {},
  hazards: {},
})

const buildingFloors = ref([{ name: 'همکف' }, { name: 'طبقه 1' }, { name: 'طبقه 2' }])

function updateFormData(tabName, data) {
  formData.value[tabName] = data
}

function updateHazards(hazards) {
  formData.value.hazards = hazards
  console.log('Hazards updated:', hazards)
}

const cancelEditBuilding = () => {
  dialog.value = false
  router.push('/')
}
</script>

<style lang="scss" scoped>
.fullscreen-dialog {
  height: 100vh !important;
  max-height: 100vh !important;
  min-height: 100vh !important;
}

:deep(.q-tab) {
  padding: 0 8px;
}

/* Override Quasar dialog styles for fullscreen */
:deep(.q-dialog__inner--minimized > div) {
  max-height: 100vh !important;
}

:deep(.q-dialog__inner) {
  max-height: 100vh !important;
}
</style>
