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

    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const SCANNER_ID = 'scan-camera'

const emit = defineEmits(['scan'])
const error = ref('')
let scanner = null

let lastScanText = ''
let lastScanTime = 0
const SCAN_COOLDOWN = 2000

async function initScanner() {
  error.value = ''

  const { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')

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
      fps: 15,
      qrbox: (vw, vh) => {
        const min = Math.min(vw, vh)
        const size = Math.floor(min * 0.7)
        return { width: size, height: size }
      },
      showTorchButtonIfSupported: true,
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      rememberLastUsedCamera: true,
    },
    false
  )

  scanner.render(
    (text) => {
      const now = Date.now()
      if (text === lastScanText && now - lastScanTime < SCAN_COOLDOWN) return
      lastScanText = text
      lastScanTime = now
      emit('scan', text)
    },
    () => {}
  )
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
