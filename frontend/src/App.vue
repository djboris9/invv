<template>
  <v-app>
    <v-navigation-drawer
      v-if="authStore.token"
      v-model="drawer"
      temporary
    >
      <v-list-item title="Invv" subtitle="Inventory" />
      <v-divider />
      <v-list-item
        prepend-icon="mdi-cube-outline"
        title="Containers"
        to="/containers"
      />
      <v-list-item
        prepend-icon="mdi-chip"
        title="Items"
        to="/items"
      />
      <v-list-item
        prepend-icon="mdi-qrcode-scan"
        title="Scan"
        to="/scan"
      />
      <v-list-item
        prepend-icon="mdi-history"
        title="History"
        to="/history"
      />
      <template v-slot:append>
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          @click="logout"
        />
      </template>
    </v-navigation-drawer>

    <v-app-bar v-if="authStore.token" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title @click="$router.push('/')" style="cursor: pointer">Invv</v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-qrcode-scan" to="/scan" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(false)

function logout() {
  authStore.clear()
  router.push('/login')
}
</script>
