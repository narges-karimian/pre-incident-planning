<template>
  <q-form @submit.prevent="save" class="my-font">
    <q-card-section class="q-gutter-xs">
      <div class="text-h6 text-center">اطلاعات عمومی ساختمان</div>
      <q-input v-model="form.ownersName" label="نام مالک" dense filled />
      <q-input v-model="form.renovationCode" label="کد نوسازی" dense filled />
      <q-select
        v-model="form.businessType"
        :options="BUSINESS_TYPES"
        option-value="key"
        option-label="label"
        emit-value
        map-options
        label="کاربری"
        dense
        filled
        options-dense
        option-class="my-font"
      />
      <q-select
        v-model="form.fireVulnerabilityRisk"
        :options="FIRE_VULNERABILITY_RISK"
        option-value="key"
        option-label="label"
        emit-value
        map-options
        label="ریسک آسیب پذیری حریق"
        dense
        filled
        options-dense
        option-class="my-font"
      />
      <q-select
        v-model="form.accidentVulnerabilityRisk"
        :options="ACCIDENT_VULNERABILITY_RISK"
        option-value="key"
        option-label="label"
        emit-value
        map-options
        label="ریسک آسیب پذیری حادثه"
        dense
        filled
        options-dense
        option-class="my-font"
      />
      <q-input
        v-model="form.permanentResidents"
        label="تعداد ساکنان دائمی"
        type="number"
        dense
        filled
      />
      <q-input
        v-model="form.temporaryResidents"
        label="تعداد ساکنان موقتی (مراجعان)"
        type="number"
        dense
        filled
      />
      <q-checkbox v-model="form.highRise" label="ساختمان مرتفع" />

      <div class="row justify-between q-gutter-y-xs">
        <div class="col-6 q-pr-xs">
          <q-input v-model="form.width" label="طول ساختمان" type="number" dense filled />
        </div>
        <div class="col-6">
          <q-input v-model="form.length" label="عرض ساختمان" type="number" dense filled />
        </div>
        <div class="col-6 q-pr-xs">
          <q-input v-model="form.height" label="ارتفاع ساختمان" type="number" dense filled />
        </div>
        <div class="col-6">
          <q-input v-model="form.area" label="مساحت ساختمان" type="number" dense filled />
        </div>
      </div>

      <q-input
        v-model="form.accessProblems"
        label="مشکلات دسترسی"
        type="textarea"
        dense
        filled
        autogrow
      />
      <q-input v-model="form.description" label="توضیحات" type="textarea" dense filled autogrow />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Save" type="submit" color="primary" :loading="saving" />
      <q-btn label="Cancel" flat @click="cancel" :disable="saving" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useSharedStore } from 'src/stores/shared'
import { useFormStore } from 'src/stores/form'
import { Notify } from 'quasar'

const emit = defineEmits(['save', 'cancel'])
const sharedStore = useSharedStore()
const formStore = useFormStore()
const saving = ref(false)

const BUSINESS_TYPES = Object.freeze([
  {
    key: 'tradeAssociations',
    label: 'واحد صنفی',
  },
  {
    key: 'accommodationUnit',
    label: 'واحد اقامتی',
  },
  {
    key: 'treatmentUnit',
    label: 'واحد درمانی',
  },
  {
    key: 'militaryUnit',
    label: 'واجد نظامی',
  },
  {
    key: 'residentialUnit',
    label: 'واحد مسکونی',
  },
  {
    key: 'businessUnit',
    label: 'واجد تجاری',
  },
  {
    key: 'industrialUnit',
    label: 'واحد صنعتی',
  },
  {
    key: 'administrativeUnit',
    label: 'واحد اداری',
  },
  {
    key: 'educationalUnit',
    label: 'واحد آموزشی',
  },
  {
    key: 'warehouse',
    label: 'انبار',
  },
  {
    key: 'other',
    label: 'سایر',
  },
])

const FIRE_VULNERABILITY_RISK = Object.freeze([
  {
    key: 'low',
    label: 'کم خطر',
  },
  {
    key: 'moderate',
    label: 'میان خطر',
  },
  {
    key: 'dangerous',
    label: 'پر خطر',
  },
  {
    key: 'veryDangerous',
    label: 'بسیار پر خطر',
  },
])

const ACCIDENT_VULNERABILITY_RISK = Object.freeze([
  {
    key: 'unsafe',
    label: 'ناایمن',
  },
  {
    key: 'lowSafety',
    label: 'ایمنی پایین',
  },
  {
    key: 'fairlySafe',
    label: 'نسبتا ایمن',
  },
])

const form = ref({
  ownersName: sharedStore?.buildingFormData?.owner_name || '',
  renovationCode: sharedStore?.buildingFormData?.renewal_code || '',
  businessType: sharedStore?.buildingFormData?.building_type || '',
  width: sharedStore?.buildingFormData?.width || '',
  height: sharedStore?.buildingFormData?.height || '',
  length: sharedStore?.buildingFormData?.length || '',
  area: sharedStore?.buildingFormData?.area || '',
  fireVulnerabilityRisk: sharedStore?.buildingFormData?.fire_risk || 'low',
  accidentVulnerabilityRisk: sharedStore?.buildingFormData?.incident_risk || 'unsafe',
  highRise: sharedStore?.buildingFormData?.is_building_tall || false,
  description: sharedStore?.buildingFormData?.description || '',
  accessProblems: sharedStore?.buildingFormData?.access_problem || '',
  permanentResidents: sharedStore?.buildingFormData?.permanant_residence || 0,
  temporaryResidents: sharedStore?.buildingFormData?.temp_residence || 0,
})

const save = async () => {
  if (saving.value) return

  try {
    saving.value = true

    // Prepare building data
    const buildingData = {
      owner_name: form.value.ownersName,
      renewal_code: form.value.renovationCode,
      building_type: form.value.businessType,
      width: form.value.width,
      height: form.value.height,
      length: form.value.length,
      area: form.value.area,
      fire_risk: form.value.fireVulnerabilityRisk,
      incident_risk: form.value.accidentVulnerabilityRisk,
      is_building_tall: form.value.highRise,
      description: form.value.description,
      access_problem: form.value.accessProblems,
      permanant_residence: form.value.permanentResidents,
      temp_residence: form.value.temporaryResidents,
    }

    let response
    const isUpdate = !!sharedStore?.buildingFormData?.id

    if (isUpdate) {
      // Update existing building
      response = await sharedStore.updateBuilding({
        buildingId: sharedStore.buildingFormData.id,
        buildingData: buildingData,
      })
      console.log('Building updated:', response)
    } else {
      // Create new building
      response = await createNewBuilding(buildingData)
      console.log('Building created:', response)

      // Update shared store with new building data
      sharedStore.buildingFormData = response
    }

    Notify.create({
      message: isUpdate ? 'اطلاعات با موفقیت بروزرسانی شد' : 'ساختمان با موفقیت ایجاد شد',
      color: 'green',
      icon: 'check',
    })

    emit('save', { ...form.value })
  } catch (error) {
    console.error('Error saving building:', error)

    Notify.create({
      message: 'خطا در ذخیره اطلاعات',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const createNewBuilding = async (buildingData) => {
  try {
    // Get form template 1
    await formStore.getFormTemplate(1)

    // Create safety forms with empty data
    const safetyFormResponse = await formStore.createForm({})

    console.log('Safety forms created:', {
      safety_form: safetyFormResponse.id,
      safety_form_for_eco: safetyFormResponse.id,
    })

    // Prepare complete building data with location and form IDs
    const completeBuildingData = {
      ...buildingData,
      images: [],
      floors: [],
      routes: [],
      location: {
        lat:
          sharedStore.buildingData?.lat?.toString() || sharedStore.location?.[0]?.toString() || '0',
        lang:
          sharedStore.buildingData?.lon?.toString() || sharedStore.location?.[1]?.toString() || '0',
        alt: '0',
      },
      safety_form: safetyFormResponse.id,
      safety_form_for_eco: safetyFormResponse.id,
    }

    // Create the building
    const buildingResponse = await sharedStore.createBuilding(completeBuildingData)

    return buildingResponse
  } catch (error) {
    console.error('Error creating new building:', error)
    throw error
  }
}
const cancel = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped></style>
