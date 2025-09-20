<template>
  <div v-if="showFloorSelector" class="floor-selector-container">
    <q-card class="floor-selector-card">
      <q-select
        v-model="selectedFloor"
        :options="floorOptions"
        option-value="id"
        option-label="label"
        dense
        outlined
        style="min-width: 150px"
        @update:model-value="onFloorSelect"
        clearable
        clear-icon="close"
        placeholder="همه طبقات"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption> {{ scope.opt.equipmentCount }} تجهیزات </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  buildingData: {
    type: Object,
    default: () => ({}),
  },
  showSelector: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['floor-selected'])

const selectedFloor = ref(null)

const showFloorSelector = computed(() => {
  return props.showSelector && props.buildingData?.floors?.length > 0
})

const floorOptions = computed(() => {
  if (!props.buildingData?.floors) return []

  return props.buildingData.floors.map((floor) => ({
    id: floor.id,
    label: `طبقه ${floor.order_of_floor}`,
    equipmentCount: floor.equipments?.length || 0,
    floor: floor,
  }))
})

const onFloorSelect = (floorOption) => {
  if (floorOption) {
    emit('floor-selected', floorOption.floor)
  } else {
    emit('floor-selected', null)
  }
}

// Auto-select first floor when building changes
watch(
  () => props.buildingData,
  (newBuildingData) => {
    if (newBuildingData?.floors?.length > 0) {
      // Auto-select the first floor
      const firstFloorOption = floorOptions.value[0]
      if (firstFloorOption) {
        selectedFloor.value = firstFloorOption
        emit('floor-selected', firstFloorOption.floor)
      }
    } else {
      selectedFloor.value = null
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.floor-selector-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: auto;
}

.floor-selector-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

:deep(.q-select) {
  .q-field__control {
    background: white;
  }
}
</style>
