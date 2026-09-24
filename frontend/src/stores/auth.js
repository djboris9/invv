import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('invv_token') || '')
  const user = ref(localStorage.getItem('invv_user') || '')

  async function login(identity, password) {
    const resp = await api.post('/api/collections/users/auth-with-password', {
      identity, password,
    })
    token.value = resp.data.token
    user.value = resp.data.record.email
    localStorage.setItem('invv_token', token.value)
    localStorage.setItem('invv_user', user.value)
  }

  function clear() {
    token.value = ''
    user.value = ''
    localStorage.removeItem('invv_token')
    localStorage.removeItem('invv_user')
  }

  return { token, user, login, clear }
})
