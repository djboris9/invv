<template>
  <v-container>
    <v-row>
      <v-col cols="6" sm="4" md="3">
        <v-card
          variant="outlined"
          @click="$router.push('/containers')"
          :ripple="false"
        >
          <v-card-text class="text-center pa-4 pa-sm-6">
            <v-icon size="40" color="primary">mdi-cube-outline</v-icon>
            <div class="text-body-1 text-sm-h6 mt-2">Containers</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card
          variant="outlined"
          @click="$router.push('/items')"
          :ripple="false"
        >
          <v-card-text class="text-center pa-4 pa-sm-6">
            <v-icon size="40" color="primary">mdi-chip</v-icon>
            <div class="text-body-1 text-sm-h6 mt-2">Items</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card
          variant="outlined"
          @click="$router.push('/scan')"
          :ripple="false"
        >
          <v-card-text class="text-center pa-4 pa-sm-6">
            <v-icon size="40" color="primary">mdi-qrcode-scan</v-icon>
            <div class="text-body-1 text-sm-h6 mt-2">Scan</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card
          variant="outlined"
          @click="$router.push('/history')"
          :ripple="false"
        >
          <v-card-text class="text-center pa-4 pa-sm-6">
            <v-icon size="40" color="primary">mdi-history</v-icon>
            <div class="text-body-1 text-sm-h6 mt-2">History</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-sheet class="pa-4 mt-4" variant="outlined" rounded>
      <div class="text-caption">Logged in as: <strong>{{ authStore.user }}</strong></div>
    </v-sheet>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
