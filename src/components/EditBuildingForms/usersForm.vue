<template>
  <div class="flex column q-pa-md">
    <q-select
      v-model="selectedBuilding"
      :options="buildingFloors"
      label="انتخاب طبقه"
      option-label="name"
      @update:model-value="handleBuildingChangeFloor"
    />

    <q-list class="q-mt-md">
      <q-item-label header>کاربران</q-item-label>
      <q-scroll-area :visible="false" style="height: 75vh; max-width: 300px">
        <q-item v-for="user in buildingUsers" :key="user.id">
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ user.phoneNumber }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-scroll-area>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  buildingFloors: {
    type: Array,
    required: true,
  },
})

const selectedBuilding = ref(null)
const buildingUsers = ref([
  { name: 'نرگس', phoneNumber: '0990000000', id: '1' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '2' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '3' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '4' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '5' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '6' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '7' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '8' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '9' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '10' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '11' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '12' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '13' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '14' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '15' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '16' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '17' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '18' },
  { name: 'نرگس', phoneNumber: '0990000000', id: '19' },
])

const handleBuildingChangeFloor = (floor) => {
  console.log('Selected floor:', floor)
  // Fetch users for the selected floor
}
</script>
