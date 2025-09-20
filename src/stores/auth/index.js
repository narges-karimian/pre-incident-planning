import state from './state'
import actions from './actions'
import getters from './getters'

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authStore', {
  state,
  actions,
  getters,
  persist: true,
})
