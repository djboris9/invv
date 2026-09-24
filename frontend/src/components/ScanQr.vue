<template>
  <v-card>
    <v-card-text>
      <div id="scan-camera" class="camera-box"></div>

      <v-alert
        v-if="error"
        type="error"
        class="mt-2"
        variant="tonal"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <v-btn
        v-if="error"
        block
        color="primary"
        class="mt-2"
        variant="outlined"
        @click="initScanner"
      >
        <v-icon start>mdi-refresh</v-icon>
        Try Again
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
import { ref, onMounted, onUnmounted } from 'vue'

const SCANNER_ID = 'scan-camera'

const emit = defineEmits(['scan'])
const manualCode = ref('')
const error = ref('')
let scanner = null

async function initScanner() {
  error.value = ''

  const { Html5QrcodeScanner, Html5Qrcode } = await import('html5-qrcode')

  try {
    const cameras = await Html5Qrcode.getCameras()
    if (!cameras || cameras.length === 0) {
      error.value = 'No camera found on this device.'
      return
    }
  } catch (e) {
    if (e.name === 'NotAllowedError' || e.message?.includes('Permission')) {
      error.value = 'Camera access denied. Grant camera permission in your browser or phone settings, then try again.'
    } else {
      error.value = 'Could not access camera. Check that your device has a working camera.'
    }
    return
  }

  scanner = new Html5QrcodeScanner(
    SCANNER_ID,
    {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1,
      showTorchButtonIfSupported: true,
      useBarCodeDetectorIfSupported: true,
    },
    false
  )

  scanner.render(
    (text) => {
      emit('scan', text)
    },
    () => {}
  )
}

function submitManual() {
  const val = manualCode.value.trim()
  if (val) {
    emit('scan', val)
    manualCode.value = ''
  }
}

onMounted(() => {
  initScanner()
})

onUnmounted(() => {
  if (scanner) {
    try { scanner.clear() } catch (_) {}
    scanner = null
  }
})
</script>

<style scoped>
.camera-box {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
