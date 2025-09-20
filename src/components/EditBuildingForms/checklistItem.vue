<template>
  <div>
    <div v-if="!item.children" class="q-mb-sm">
      <div class="text-body2 q-mb-xs">{{ item.label }}</div>
      <div class="row q-gutter-sm">
        <q-radio v-model="model[item.key]" :val="true" label="بله" color="positive" />
        <q-radio v-model="model[item.key]" :val="false" label="خیر" color="negative" />
        <q-radio v-model="model[item.key]" :val="null" label="پاسخ داده نشده" color="grey" />
      </div>
      <q-separator />
      <!-- <q-input
        v-if="item.note !== undefined"
        v-model="model[`${item.key}_note`]"
        label="یادداشت"
        type="textarea"
        rows="2"
        class="q-mt-sm"
        outlined
        dense
      /> -->
    </div>
    <div v-else>
      <div class="text-bold q-mt-md q-mb-xs">{{ item.label }}</div>
      <div class="q-ml-md">
        <ChecklistItem
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          v-model="model"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineModel } from 'vue'

defineProps({
  item: Object,
})

const model = defineModel({ required: true })
</script>
