<template>
  <v-container>
    <div class="text-h5 mb-3">Scan</div>
    <ScanQr @scan="onScan" />

    <v-card v-if="scannedData" class="mt-4">
      <v-card-title>Scanned: {{ scannedData.code }}</v-card-title>
      <v-card-text>
        <div v-if="scannedData.manufacturerPart">MPN: {{ scannedData.manufacturerPart }}</div>
        <div v-if="scannedData.quantity">Qty: {{ scannedData.quantity }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          v-if="!mode"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="mode = 'add'"
        >
          Add to container
        </v-btn>
        <v-btn
          v-if="!mode"
          color="warning"
          variant="tonal"
          prepend-icon="mdi-minus"
          @click="mode = 'takeout'"
        >
          Take out
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-if="mode" class="mt-4">
      <v-card-title>{{ mode === 'add' ? 'Add Item' : 'Take Out' }}</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedContainer"
          :items="containers"
          item-title="name"
          item-value="id"
          label="Container"
          variant="outlined"
          return-object
        />
        <v-text-field v-if="mode === 'takeout'" v-model.number="takeQty" label="Qty" type="number" variant="outlined" min="1" />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="mode = null">Cancel</v-btn>
        <v-btn color="primary" variant="tonal" @click="confirmAction">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/client'
import ScanQr from '../components/ScanQr.vue'
import { useScanAction } from '../lib/useScanAction'

const { scannedData, parseScan, createItem, takeoutItem } = useScanAction()

const mode = ref(null)
const containers = ref([])
const selectedContainer = ref(null)
const takeQty = ref(1)

onMounted(async () => {
  const r = await api.get('/api/collections/containers/records?sort=name')
  containers.value = r.data.items
})

function onScan(raw) {
  parseScan(raw)
  mode.value = null
}

async function confirmAction() {
  if (!selectedContainer.value || !scannedData.value) return

  if (mode.value === 'add') {
    await createItem(selectedContainer.value.id)
  } else if (mode.value === 'takeout') {
    await takeoutItem(scannedData.value.code, takeQty.value)
  }
  mode.value = null
  scannedData.value = null
}
</script>
