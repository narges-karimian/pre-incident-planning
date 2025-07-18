<template>
  <q-card
    class="search-trigger full-width absolute-bottom q-px-md transparent rounded-border-lg"
    flat
    @click="openSearch"
  >
    <q-card-section class="bg-grey-3 flex items-center justify-between">
      <span class="text-grey-8">جستجو محله</span>
      <q-icon name="search" size="20px" color="grey-6" />
    </q-card-section>
  </q-card>

  <q-dialog v-model="showSearch" position="bottom" maximized>
    <q-card class="bottom-sheet-card fullscreen-dialog">
      <q-card-section>
        <div class="row items-center q-gutter-sm">
          <q-input
            ref="searchInput"
            v-model="searchQuery"
            @update:model-value="onSearch"
            outlined
            placeholder="جستجو..."
            class="col search-input my-font"
            :loading="searchLoading"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn flat round icon="close" @click="closeSearch" size="md" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="search-results q-pa-none my-font">
        <div v-if="searchLoading" class="q-pa-lg flex items-center justify-center column">
          <q-spinner size="md" color="text-green-6" />
          <div class="q-mt-sm text-grey-6">در حال جستجو...</div>
        </div>

        <q-list v-else-if="searchResults.length > 0" separator>
          <q-item
            v-for="result in searchResults"
            :key="result.place_id"
            clickable
            v-ripple
            @click="selectLocation(result)"
          >
            <q-item-section avatar>
              <q-icon name="place" color="green" size="24px" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-grey-8">
                {{ result.name }}
              </q-item-label>
              <q-item-label caption class="text-grey-6">
                {{
                  `${result.address?.city || result.address?.county || ''} -
                  ${result.address?.quarter || result.address?.district || ''} -
                  ${result.address?.road || result.address?.neighborhood || ''}`
                }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_left" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>

        <div
          v-else-if="searchQuery && !searchLoading"
          class="q-pa-xl text-grey-6 flex items-center justify-center column"
        >
          <q-icon name="search_off" size="48px" class="q-mb-md" />
          <div>نتیجه‌ای پیدا نشد</div>
        </div>

        <div v-else class="q-pa-xl text-grey-6 flex items-center justify-center column">
          <q-icon name="search" size="48px" class="q-mb-md" />
          <div>مکان مورد نظر خود را جستجو کنید</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useSearchStore } from 'src/stores/search'
import usePromise from 'src/composables/usePromise.composable'

const emit = defineEmits(['selectLocation'])

const searchStore = useSearchStore()

const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchInput = ref(null)

let searchTimeout = null

// const handlePopState = () => {
//   if (showSearch.value) {
//     closeSearch()
//   }
// }

const openSearch = async () => {
  showSearch.value = true
  // window.history.pushState({ search: true }, '', window.location.href)
  await nextTick()
  setTimeout(() => {
    searchInput.value?.focus()
  }, 300)
}

const closeSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
  // if (window.history.state?.search) window.history.back()
}

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length > 2) performSearch(searchQuery.value)
    else searchResults.value = []
  }, 1000)
}

const { execute: performSearch, loading: searchLoading } = usePromise(
  async (query) => {
    const response = await searchStore.search({ query })
    searchResults.value = response
    // console.log(response)
  },
  {
    onError: (error) => {
      console.log(error)
      searchResults.value = []
    },
  },
)

const selectLocation = (location) => {
  emit('selectLocation', location)
  closeSearch()
}

// onMounted(() => {
//   window.addEventListener('popstate', handlePopState)
// })

// onUnmounted(() => {
//   window.removeEventListener('popstate', handlePopState)
// })
</script>

<style scoped>
/* Search Trigger */
.search-trigger {
  z-index: 1000;
  bottom: 90px;
}

/* Bottom Sheet */
.bottom-sheet-card {
  width: 100%;
  /* max-height: 70vh; */
  border-radius: 16px 16px 0 0;
}

.fullscreen-dialog {
  height: 100vh !important;
  max-height: 100vh !important;
  min-height: 100vh !important;
}

/* Override Quasar dialog styles for fullscreen */
:deep(.q-dialog__inner--minimized > div) {
  max-height: 100vh !important;
}

:deep(.q-dialog__inner) {
  max-height: 100vh !important;
}

.search-input :deep(.q-field__control) {
  border-radius: 32px;
}

.search-results {
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .search-trigger {
    width: 95%;
  }

  .bottom-sheet-card {
    max-height: 80vh;
  }
}

/* Custom scrollbar for search results */
.search-results::-webkit-scrollbar {
  width: 4px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
