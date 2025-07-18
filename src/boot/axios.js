import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' })
const TIMEOUT = 2 * 60 * 1000
const onRequestFallback = (request) => request
const onRequestErrorFallback = (error) => Promise.reject(error)
const onResponseFallback = (response) => response
const onResponseErrorFallback = (error) => Promise.reject(error)

class Client {
  constructor({
    baseURL,
    headers,
    defaults,
    interceptors = [],
    timeout = TIMEOUT,
    clientName,
    normalizer = {
      onResponse: (response) => response?.data,
      onResponseError: (error) => Promise.reject(error?.response || error),
    },
  }) {
    this.client = axios.create({
      timeout,
      baseURL,
      headers,
      ...defaults,
    })

    interceptors.forEach(
      ({
        onRequest = onRequestFallback,
        onRequestError = onRequestErrorFallback,
        onResponse = onResponseFallback,
        onResponseError = onResponseErrorFallback,
      }) => {
        this.client.interceptors.request.use(
          (...args) => onRequest(...args, this.client),
          (...args) => onRequestError(...args, this.client),
        )
        this.client.interceptors.response.use(
          (...args) => onResponse(...args, this.client),
          (...args) => onResponseError(...args, this.client, clientName),
        )
      },
    )
    // todo => add multiple langs in errorToShow property
    this.client.interceptors.response.use(normalizer.onResponse, normalizer.onResponseError)
  }

  getInstance() {
    return this.client
  }
}

export { Client }

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = Client
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})
