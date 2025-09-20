<template>
  <q-uploader
    ref="uploaderRef"
    class="file-uploader full-width"
    flat
    @added="onFileAdded"
    @removed="onFileRemoved"
    @rejected="onFileRejected"
  >
    <template v-slot:header="scope">
      <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
        <q-btn
          v-if="scope.queuedFiles.length > 0"
          icon="clear_all"
          @click="() => removeAllFiles(scope)"
          round
          dense
          flat
        >
          <q-tooltip>پاک کردن همه فایل ها</q-tooltip>
        </q-btn>
        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
        <div class="col">
          <div class="q-uploader__title">فایل ها را انتخاب کنید</div>
        </div>
        <q-btn
          v-if="scope.canAddFiles"
          type="a"
          icon="add_box"
          @click="scope.pickFiles"
          round
          dense
          flat
        >
          <q-uploader-add-trigger />
          <q-tooltip>انتخاب فایل ها</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template v-slot:list="scope">
      <q-list separator>
        <q-item v-for="file in scope.files" :key="file.__key">
          <q-item-section>
            <q-item-label class="full-width ellipsis">
              {{ file.name }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="file.__img" thumbnail>
            <img :src="file.__img.src" />
          </q-item-section>

          <q-item-section center side>
            <q-btn size="12px" flat dense round icon="delete" @click="scope.removeFile(file)" />
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-uploader>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  defaultValue: {
    type: Array,
    default: () => [],
  },
  files: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['added', 'removed', 'rejected', 'update:files'])

const uploaderRef = ref(null)
const currentFiles = ref([])
const isInitialized = ref(false)

const $q = useQuasar()
const MESSAGES = {
  accept: (fileName = 'فایل') =>
    `نوع فایل "${fileName}" پشتیبانی نمی‌شود. لطفاً فایل با فرمت مجاز انتخاب کنید.`,
  'max-file-size': (fileName = 'فایل') => `حجم فایل "${fileName}"بیش از حد مجاز است.`,
  filter: (fileName = 'فایل') => `فایل "${fileName}" فیلتر شده و قابل آپلود نیست.`,
  duplicate: (fileName = 'فایل') => `فایل "${fileName}" قبلاً انتخاب شده است.`,
}

// Function to add files to uploader
const addFilesToUploader = async (filesToAdd) => {
  if (!uploaderRef.value) return

  await nextTick()
  const scope = uploaderRef.value

  // Clear existing files first
  scope.removeQueuedFiles()

  // Add new files
  if (filesToAdd && filesToAdd.length > 0) {
    filesToAdd.forEach((file) => {
      if (file instanceof File) {
        scope.addFiles([file])
      } else if (file && typeof file === 'object') {
        if (file.blob || file.data) {
          const fileObj = new File([file.blob || file.data], file.name, {
            type: file.type || 'application/octet-stream',
          })
          scope.addFiles([fileObj])
        }
      }
    })
  }

  // Update internal files array
  currentFiles.value = [...filesToAdd]
}

// Watch for files prop changes (for dynamic updates)
watch(
  () => props.files,
  async (newFiles) => {
    if (isInitialized.value && newFiles) {
      await addFilesToUploader(newFiles)
    }
  },
  { deep: true },
)

// Initialize with default files
onMounted(async () => {
  const initialFiles = props.files.length > 0 ? props.files : props.defaultValue
  if (initialFiles && initialFiles.length > 0) {
    await addFilesToUploader(initialFiles)
  }
  isInitialized.value = true
})

const onFileAdded = (addedFiles) => {
  // Update internal files array
  addedFiles.forEach((file) => {
    if (!currentFiles.value.find((f) => f.name === file.name && f.size === file.size)) {
      currentFiles.value.push(file)
    }
  })

  // Emit the updated files array
  emit('update:files', [...currentFiles.value])
  emit('added', addedFiles)
}

const onFileRemoved = (removedFiles) => {
  // Update internal files array
  removedFiles.forEach((removedFile) => {
    const index = currentFiles.value.findIndex(
      (f) => f.name === removedFile.name && f.size === removedFile.size,
    )
    if (index > -1) {
      currentFiles.value.splice(index, 1)
    }
  })

  // Emit the updated files array
  emit('update:files', [...currentFiles.value])
  emit('removed', removedFiles)
}

const onFileRejected = (failedFiles) => {
  console.log('File rejected:', failedFiles)

  failedFiles.forEach(({ failedPropValidation, file }) => {
    $q.notify({
      message: MESSAGES[failedPropValidation]?.(file.name) || `خطا در آپلود فایل "${file.name}"`,
      color: 'negative',
    })
  })
}

const removeAllFiles = (scope) => {
  scope.removeQueuedFiles()
  // Clear internal files array
  currentFiles.value = []
  // Emit the updated files array
  emit('update:files', [])
}
</script>

<style lang="scss" scoped>
.file-uploader {
  //min-height: 80vh;
}
</style>
