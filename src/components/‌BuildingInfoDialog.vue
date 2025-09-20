<template>
  <q-dialog
    v-model="showModal"
    position="bottom"
    persistent
    no-shake
    class="building-info-dialog my-font"
  >
    <q-card>
      <q-card-section class="flex justify-between">
        <div class="text-h7">{{ location.name }}</div>
        <q-btn flat round icon="close" @click="closeSelectedLocation" size="sm" />
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-icon name="place" color="grey" size="24px" />
        <div class="text-grey-8" style="display: inline">{{ location.display_name }}</div>
      </q-card-section>
      <q-card-section v-if="Object.keys(buildingData).length" class="risk-status-section q-py-sm">
        <div class="text-subtitle2 q-mb-sm">وضعیت ساختمان:</div>

        <!-- Fire Risk Status -->
        <div v-if="fireRiskStatus" class="risk-item">
          <div class="flex items-center q-gutter-sm">
            <span class="risk-label">خطر آتش‌سوزی:</span>
            <q-chip
              :color="fireRiskStatus.color"
              text-color="white"
              size="sm"
              :icon="fireRiskStatus.icon"
              class="risk-chip"
            >
              {{ fireRiskStatus.label }}
            </q-chip>
          </div>
        </div>

        <!-- Incident Risk Status -->
        <div v-if="incidentRiskStatus" class="risk-item">
          <div class="flex items-center q-gutter-sm">
            <span class="risk-label">خطر حادثه:</span>
            <q-chip
              :color="incidentRiskStatus.color"
              text-color="white"
              size="sm"
              :icon="incidentRiskStatus.icon"
              class="risk-chip"
            >
              {{ incidentRiskStatus.label }}
            </q-chip>
          </div>
        </div>

        <!-- Show message if no risk data available -->
        <div v-if="!fireRiskStatus && !incidentRiskStatus" class="text-grey-6 q-pa-sm">
          اطلاعات خطرات ساختمان در دسترس نیست
        </div>

        <div v-if="buildingData.access_problem" class="q-pt-md">
          <div class="text-subtitle2 q-mb-sm">مشکلات دسترسی به ساختمان:</div>
          <div class="q-pa-sm">{{ buildingData.access_problem }}</div>
        </div>
      </q-card-section>
      <q-card-section class="flex justify-between q-pt-sm">
        <q-btn
          v-if="authStore.userInfo.userRole === 'staff'"
          class="rounded-border-lg"
          icon="fire_hydrant"
          color="primary"
          size="sm"
          @click="() => emit('editBuildingInfo')"
        >
          ویرایش اطلاعات ساختمان
        </q-btn>
        <q-btn
          class="rounded-border-lg"
          icon="assignment"
          color="primary"
          size="sm"
          @click="() => emit('editPip')"
        >
          برنامه پیش از حادثه (PIP)
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
  buildingData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'editBuildingInfo', 'editPip'])

const authStore = useAuthStore()

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeSelectedLocation = () => {
  showModal.value = false
}

// Risk status configurations
const fireRiskConfig = {
  low: {
    label: 'کم خطر',
    icon: 'check_circle',
    color: 'green',
    iconId: null,
  },
  moderate: {
    label: 'میان خطر',
    icon: 'warning',
    color: 'orange',
    iconId: 'MAAS', // High Fire Load icon
  },
  dangerous: {
    label: 'پرخطر',
    icon: 'error',
    color: 'red',
    iconId: 'MAAS', // High Fire Load icon
  },
  very_dangerous: {
    label: 'بسیار پر خطر',
    icon: 'dangerous',
    color: 'red',
    iconId: 'MAAS', // High Fire Load icon
  },
}

const incidentRiskConfig = {
  unsafe: {
    label: 'ناایمن',
    icon: 'dangerous',
    color: 'red',
    iconId: 'MAAI', // DO NOT ENTER Building icon
  },
  low_safety: {
    label: 'ایمنی پایین',
    icon: 'warning',
    color: 'orange',
    iconId: 'MAAP', // Hazardous Entry icon
  },
  fairly_safe: {
    label: 'نسبتا ایمن',
    icon: 'check_circle',
    color: 'green',
    iconId: null,
  },
}

// Computed properties for risk status
const fireRiskStatus = computed(() => {
  const fireRisk = props.buildingData?.fire_risk
  return fireRisk ? fireRiskConfig[fireRisk] : null
})

const incidentRiskStatus = computed(() => {
  const incidentRisk = props.buildingData?.incident_risk
  return incidentRisk ? incidentRiskConfig[incidentRisk] : null
})
</script>

<style lang="scss">
.building-info-dialog {
  .q-dialog__backdrop {
    pointer-events: none;
    background: transparent;
  }

  .q-dialog__inner {
    max-height: 400px;
    overflow-y: auto;
  }

  .risk-status-section {
    .risk-item {
      padding: 8px 12px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.02);
      display: inline-block;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .risk-chip {
      font-weight: 500;
      border-radius: 16px;
    }

    .risk-label {
      font-size: 14px;
      font-weight: 500;
      color: #424242;
    }
  }
}
</style>
