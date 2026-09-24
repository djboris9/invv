<template>
  <v-container>
    <div class="text-h5 mb-3">Container: {{ container?.name }}</div>
    <ScanQr @scan="onScan" />

    <v-dialog v-model="showAdd" max-width="500">
      <v-card>
        <v-card-title>Add Item</v-card-title>
        <v-card-text>
          <v-alert v-if="scannedData" type="info" class="mb-3">
            Detected: <code>{{ scannedData.code }}</code>
            <div v-if="scannedData.manufacturerPart">MPN: {{ scannedData.manufacturerPart }}</div>
          </v-alert>
          <v-text-field v-model="form.name" label="Name" variant="outlined" />
          <v-text-field v-model="form.manufacturer" label="Manufacturer" variant="outlined" />
          <v-text-field v-model="form.mfr_part_number" label="MPN" variant="outlined" />
          <v-text-field v-model="form.order_number" label="Order #" variant="outlined" />
          <v-text-field v-model.number="form.quantity_full" label="Qty Full" type="number" variant="outlined" />
          <v-text-field v-model.number="form.quantity_stock" label="Qty Stock" type="number" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAdd = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" @click="submitAdd">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/client'
import ScanQr from '../components/ScanQr.vue'
import { detectDistributor } from '../lib/distributors'
import { useScanAction } from '../lib/useScanAction'

const { scannedData, rawCode, parseScan, createItem } = useScanAction()

const route = useRoute()
const router = useRouter()
const container = ref(null)
const showAdd = ref(false)
const form = ref({
  name: '', manufacturer: '', mfr_part_number: '', order_number: '',
  quantity_full: 1, quantity_stock: 1,
})

onMounted(async () => {
  const r = await api.get('/api/collections/containers/records/' + route.params.id)
  container.value = r.data
})

function onScan(raw) {
  const p = parseScan(raw)
  form.value = {
    name: p?.manufacturerPart || raw,
    manufacturer: form.value.manufacturer,
    mfr_part_number: p?.manufacturerPart || '',
    order_number: p?.orderNumber || '',
    quantity_full: p?.quantity || 1,
    quantity_stock: p?.quantity || 0,
  }
  showAdd.value = true
}

async function submitAdd() {
  const payload = {
    ...form.value,
    code_raw: rawCode.value,
    distributor: detectDistributor(rawCode.value) || 'lcsc',
    container: route.params.id,
    date_added: new Date().toISOString(),
  }
  const r = await api.post('/api/collections/items/records', payload)
  await api.post('/api/collections/item_history/records', {
    item: r.data.id, action: 'add', quantity: form.value.quantity_full,
  })
  showAdd.value = false
  scannedData.value = null
  router.push('/containers')
}
</script>
