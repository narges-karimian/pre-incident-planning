<template>
  <q-tabs
    no-caps
    active-color="primary"
    indicator-color="transparent"
    class="text-grey-8 footer-menu"
    v-model="tab"
  >
    <q-tab name="map" label="نقشه" icon="location_on" />
    <q-tab name="setting" label="پروفایل من" icon="account_circle" />
  </q-tabs>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const tab = ref('map')
const router = useRouter()

watch(tab, (newVal) => {
  if (newVal === 'setting') {
    router.push('/profile')
  } else {
    router.push('/')
  }
})
</script>

<style scoped>
.footer-menu {
  :deep(.q-tab__label) {
    font-size: 12px;
    font-weight: 200;
  }
}
</style>
