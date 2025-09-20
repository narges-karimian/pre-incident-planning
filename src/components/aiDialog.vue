<template>
  <q-dialog v-model="dialog" persistent no-shake position="bottom">
    <q-card class="fullscreen-dialog">
      <q-card-section class="flex justify-between">
        <div class="text-h7">برنامه پیش از حادثه (PIP)</div>
        <q-btn flat round icon="close" @click="closeAIDialog" size="sm" />
      </q-card-section>
      <q-card-actions>
        <pre class="ai-answer">{{ aiAnswer }}</pre>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  aiAnswer: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const closeAIDialog = () => {
  dialog.value = false
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

.ai-answer {
  max-width: 100vw;
  text-wrap: auto;
}
</style>
