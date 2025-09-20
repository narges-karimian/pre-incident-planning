<template>
  <q-form @submit.prevent="save">
    <q-card-section>
      <div class="text-h6 text-center">چک لیست بازدید موارد ایمنی و آتش نشانی</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <ChecklistItem
        v-for="checklist in CHECKLIST_ITEMS"
        :key="checklist.key"
        :item="checklist"
        v-model="checklistModel"
      />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Save" type="submit" color="primary" />
      <q-btn label="Cancel" flat @click="cancel" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSharedStore } from 'src/stores/shared'
import { useFormStore } from 'src/stores/form'
import usePromise from 'src/composables/usePromise.composable'

const checklistModel = ref({})
const sharedStore = useSharedStore()
const formStore = useFormStore()
const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const CHECKLIST_ITEMS = ref([])

// Transform formTemplate sections to checklist structure
const transformFormTemplateToChecklist = (sections) => {
  return sections.map((section) => {
    const transformedSection = {
      key: `section_${section.id}`,
      label: section.title_snapshot || section.title,
      children: [],
    }

    // Add direct items
    if (section.items && section.items.length > 0) {
      section.items.forEach((item) => {
        transformedSection.children.push({
          key: `item_${item.item_id}`,
          label: item.body_snapshot || item.body,
          answer: item.answer || 'UNANSWERED',
          note: item.note || '',
          itemId: item.item_id || item.item_id,
        })
      })
    }

    // Add child sections
    if (section.children && section.children.length > 0) {
      section.children.forEach((childSection) => {
        const childSectionTransformed = {
          key: `section_${childSection.id}`,
          label: childSection.title_snapshot || childSection.title,
          children: [],
        }

        // Add items from child section
        if (childSection.items && childSection.items.length > 0) {
          childSection.items.forEach((item) => {
            childSectionTransformed.children.push({
              key: `item_${item.item_id}`,
              label: item.body_snapshot || item.body,
              answer: item.answer || 'UNANSWERED',
              note: item.note || '',
              itemId: item.item_id || item.item_id,
            })
          })
        }

        transformedSection.children.push(childSectionTransformed)
      })
    }

    return transformedSection
  })
}

// Populate checklist model with existing answers
const populateChecklistModel = (sections) => {
  const model = {}

  const processItems = (items) => {
    items.forEach((item) => {
      // Handle answer (YES/NO/UNANSWERED)
      if (item.answer) {
        if (item.answer === 'YES') {
          model[`item_${item.item_id}`] = true
        } else if (item.answer === 'NO') {
          model[`item_${item.item_id}`] = false
        } else {
          model[`item_${item.item_id}`] = null // UNANSWERED
        }
      } else {
        model[`item_${item.item_id}`] = null // Default to unanswered
      }

      // // Handle notes
      // if (item.note) {
      //   model[`${item.key}_note`] = item.note
      // }
    })
  }

  const processSections = (sections) => {
    sections.forEach((section) => {
      if (section.items) {
        processItems(section.items)
      }
      if (section.children) {
        section.children.forEach((childSection) => {
          if (childSection.items) {
            processItems(childSection.items)
          }
        })
      }
    })
  }

  processSections(sections)
  return model
}

const getFormTemplate = async () => {
  try {
    const response = await formStore.getFormTemplate()
    if (response && response.sections) {
      CHECKLIST_ITEMS.value = transformFormTemplateToChecklist(response.sections)
    }
  } catch (error) {
    console.error('Error fetching form template:', error)
  }
}

onMounted(async () => {
  const formId = sharedStore.buildingFormData.safety_form

  try {
    // First load the form template to get the structure
    await getFormTemplate()

    // Then load the form data with answers
    const formResponse = await formStore.getForm(formId)

    // If we have form data with sections, use it to populate the checklist
    if (formResponse && formResponse.sections) {
      CHECKLIST_ITEMS.value = transformFormTemplateToChecklist(formResponse.sections)
      checklistModel.value = populateChecklistModel(formResponse.sections)
    }
  } catch (error) {
    console.error('Error loading form data:', error)
  }
})

const { execute: updateChecklistForm } = usePromise(async () => {
  const answers = []
  Object.keys(checklistModel.value).forEach((key) => {
    const itemId = key.split('_')[1]
    const answer = checklistModel.value[key]

    let answerValue = 'UNANSWERED'
    if (answer === true) answerValue = 'YES'
    else if (answer === false) answerValue = 'NO'

    answers.push({
      item_id: itemId,
      answer: answerValue,
    })
  })

  await formStore.updateFormAnswers({
    formId: sharedStore.buildingFormData.safety_form,
    formData: { answers },
  })
})

const save = async () => {
  await updateChecklistForm()
  emit('save', checklistModel.value)
}
const cancel = () => {
  emit('cancel')
}
</script>
