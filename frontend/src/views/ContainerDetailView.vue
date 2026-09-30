<template>
  <v-container>
    <div class="text-h5 mb-1">Container: {{ container?.name }}</div>
    <div v-if="container?.location" class="text-subtitle-1 mb-3">{{ container.location }}</div>
    <ScanQr @scan="onScan" />

    <v-dialog v-model="showAdd" max-width="500">
      <ItemForm
        :model="form"
        submit-label="Save"
        :loading="saving"
        @submit="submitAdd"
        @cancel="showAdd = false"
      >
        <template #before-fields>
          <v-alert v-if="scannedData" type="info" class="mb-3">
            Detected: <code>{{ scannedData.code }}</code>
            <div v-if="scannedData.manufacturerPart">MPN: {{ scannedData.manufacturerPart }}</div>
          </v-alert>
        </template>
      </ItemForm>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/client'
import ScanQr from '../components/ScanQr.vue'
import ItemForm from '../components/ItemForm.vue'
import { detectDistributor } from '../lib/distributors'
import { useScanAction } from '../lib/useScanAction'

const { scannedData, rawCode, parseScan } = useScanAction()

const route = useRoute()
const router = useRouter()
const container = ref(null)
const showAdd = ref(false)
const saving = ref(false)
const form = ref({
  name: '', manufacturer: '', mfr_part_number: '', order_number: '',
  quantity_full: 1, container: route.params.id, code_raw: '',
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
    container: route.params.id,
    code_raw: raw,
  }
  showAdd.value = true
}

async function submitAdd() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      quantity_stock: form.value.quantity_full || 0,
      code_raw: form.value.code_raw || rawCode.value,
      distributor: detectDistributor(form.value.code_raw || rawCode.value) || 'lcsc',
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
  } finally {
    saving.value = false
  }
}
</script>
