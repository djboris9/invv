import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePwaStore = defineStore('pwa', () => {
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  let updateSW = null

  function setUpdateSW(fn) {
    updateSW = fn
  }

  function applyUpdate() {
    updateSW?.(true)
  }

  function dismiss() {
    needRefresh.value = false
  }

  function dismissOfflineReady() {
    offlineReady.value = false
  }

  return { needRefresh, offlineReady, setUpdateSW, applyUpdate, dismiss, dismissOfflineReady }
})
