<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">Invv Login</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-3" closable>{{ error }}</v-alert>
            <v-text-field
              v-model="identity"
              label="Email"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              @keyup.enter="doLogin"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              @keyup.enter="doLogin"
            />
            <v-btn block color="primary" size="large" :loading="loading" @click="doLogin">
              Login
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const identity = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function doLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(identity.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
