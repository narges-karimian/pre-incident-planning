<template>
  <q-page class="flex flex-center">
    <div id="map" style="height: 400px; width: 400px"></div>
    <!-- <mapir :center="center" :apiKey="apiKey"></mapir> -->
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import OSMMap from 'map'
// import { mapir } from 'mapir-vue'

const map = ref(null)

onMounted(() => {
  map.value = new OSMMap('map', {
    center: [51.420296, 35.732379], // New York
    zoom: 12,
  })
})
// const apiKey =
//   'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImIwODgyOWJjMDc3YzM0Mzc1NzE4OWQ0N2E2YzY1MjhmMjFjNmY0NmI3OGQxMGUwZDAzODFjYjMyYzM4NzI0M2IzMzFlZmJiMzQ3MjdhNTU3In0.eyJhdWQiOiIzMTc0MCIsImp0aSI6ImIwODgyOWJjMDc3YzM0Mzc1NzE4OWQ0N2E2YzY1MjhmMjFjNmY0NmI3OGQxMGUwZDAzODFjYjMyYzM4NzI0M2IzMzFlZmJiMzQ3MjdhNTU3IiwiaWF0IjoxNzQzNDk3NjU4LCJuYmYiOjE3NDM0OTc2NTgsImV4cCI6MTc0NjA4OTY1OCwic3ViIjoiIiwic2NvcGVzIjpbImJhc2ljIl19.QO7S7ztqKvdVCnXnkvUyxHxzRHyBD5HNJXu1-ccPiGnznm-E_PfQX6Os04uq34YdjgVR2OOCMyBP4Lj0RpRKcTJfBOvw1yHp7hp7gBwRIk2EPxWbv3pbBB0DqgilK2PmJVPVX8qt58CLZ1nuh-f4cl8i0vYwlzHUTIvFH6NU9Q8FgdzPOZ8uWzfmCJxO_iQHuIigDpkpOLrWCO77PCokAIj1ZU-6E3o-5IXgYNC5W2UuHKH26JL03Xd_l5JSiG9VuqNLID3OHMLznzOm8m6X4hfam1WetAJFYhKXiily10PTS_5N7iKQEG2QrRpuH8SMvPZBCiM1Tlw1q9Yit_KgKw'
// const center = ref([51.420296, 35.732379])
</script>
