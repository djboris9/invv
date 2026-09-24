<template>
  <v-card>
    <v-card-text>
      <v-btn
        v-if="!scanning"
        block
        color="primary"
        size="x-large"
        variant="outlined"
        @click="startCamera"
      >
        <v-icon start>mdi-qrcode-scan</v-icon>
        Scan QR Code
      </v-btn>

      <div v-if="scanning" id="scan-camera" class="camera-box"></div>

      <v-btn
        v-if="scanning"
        block
        color="error"
        class="mt-2"
        @click="stopCamera"
      >
        Cancel
      </v-btn>

      <v-divider class="my-4">or</v-divider>

      <v-text-field
        v-model="manualCode"
        label="Enter code manually"
        variant="outlined"
        hide-details
        @keyup.enter="submitManual"
      >
        <template v-slot:append-inner>
          <v-btn icon="mdi-check" variant="text" @click="submitManual" />
        </template>
      </v-text-field>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const emit = defineEmits(['scan'])
const scanning = ref(false)
const manualCode = ref('')
let html5QrCode = null

async function startCamera() {
  const { Html5Qrcode } = await import('html5-qrcode')
  scanning.value = true
  html5QrCode = new Html5Qrcode('scan-camera')
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 300, height: 300 } },
      (text) => {
        emit('scan', text)
        stopCamera()
      },
      () => {},
    )
  } catch (e) {
    scanning.value = false
  }
}

function stopCamera() {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {})
    html5QrCode = null
  }
  scanning.value = false
}

function submitManual() {
  const val = manualCode.value.trim()
  if (val) {
    emit('scan', val)
    manualCode.value = ''
  }
}

onUnmounted(() => stopCamera())
</script>

<style scoped>
.camera-box {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 1;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
</style>
