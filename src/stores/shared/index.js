import state from './state'
import actions from './actions'
import getters from './getters'

import { defineStore } from 'pinia'

export const useSharedStore = defineStore('sharedStore', {
  state,
  actions,
  getters,
  persist: {
    storage: sessionStorage,
  },
})
