import { ref } from 'vue'

const defaultConfig = {
  throwOnError: false,
  onError: async (error) => console.error(error),
  defaultData: null,
  onConditionalLoading: async () => true,
}

export const usePromise = (
  promise,
  {
    onError = defaultConfig.onError,
    throwOnError = defaultConfig.throwOnError,
    defaultData = defaultConfig.defaultData,
    onConditionalLoading = defaultConfig.onConditionalLoading,
  } = defaultConfig,
) => {
  const loading = ref(false)
  const isRejected = ref(false)
  const promiseError = ref(null)
  const isFulfilled = ref(false)
  const data = ref(defaultData)

  const execute = async (...params) => {
    if (loading.value) return

    isRejected.value = false
    loading.value = true

    try {
      data.value = await promise(...params)
      isFulfilled.value = true
      return Promise.resolve(data.value)
    } catch (error) {
      isRejected.value = true
      promiseError.value = error
      await onError(error)

      if (throwOnError) return Promise.reject(error)
    } finally {
      if (await onConditionalLoading()) loading.value = false
    }
  }

  return { data, error: promiseError, isRejected, loading, isFulfilled, execute }
}

export default usePromise
