<template>
  <div class="row q-gutter-x-sm justify-center" dir="ltr">
    <q-input
      outlined
      dense
      v-for="i in length"
      v-model="fieldValues[i]"
      v-bind="$attrs"
      @keyup="onKeyUp($event, i - 1)"
      @update:model-value="onUpdate($event, i - 1)"
      :key="i"
      :ref="(el) => updateFieldRef(el, i - 1)"
      maxlength="1"
      input-class="text-center"
      style="width: 40px"
      class="verification-input border-radius-md"
    >
    </q-input>
  </div>
</template>

<script setup>
import { computed, onBeforeUpdate, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  inputLength: {
    type: Number,
    default: 6,
  },
})

const emit = defineEmits(['update:modelValue'])

const length = computed(() => props.inputLength)
const fields = ref([])
const fieldValues = ref([])

const composite = computed(() => {
  const nonNullFields = fieldValues.value.filter((value) => value)
  if (length.value !== nonNullFields.length) {
    return ''
  }
  return nonNullFields.join('')
})

watch(composite, () => {
  if (composite.value) {
    // You should emit this value, e.g.
    emit('update:modelValue', composite.value)
  }
})

// make sure to reset the refs before each update
onBeforeUpdate(() => {
  fields.value = []
})

const updateFieldRef = (element, index) => {
  if (element) {
    fields.value[index] = element
  }
}

const focus = (index) => {
  if (index >= 0) {
    if (index < length.value) {
      fields.value[index].select()
    } else {
      if (composite.value) {
        fields.value[index - 1].blur()
      }
    }
  }
}

const onUpdate = (value, index) => {
  if (value) {
    focus(index + 1)
  }
  const currentValue = fieldValues.value.filter((v) => v).join('')
  emit('update:modelValue', currentValue)
}

const onKeyUp = (evnt, index) => {
  const key = evnt.key

  if (['Tab', 'Shift', 'Meta', 'Control', 'Alt'].includes(key)) {
    return
  }

  if (['Delete'].includes(key)) {
    return
  }

  if (key === 'ArrowLeft' || key === 'Backspace') {
    focus(index - 1)
  } else if (key === 'ArrowRight') {
    focus(index + 1)
  }
}
</script>

<style scoped>
.verification-input input {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
</style>
