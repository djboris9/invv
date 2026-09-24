<template>
  <v-container max-width="600">
    <div class="text-h5 mb-4">New Item</div>

    <v-card>
      <v-card-text>
        <v-text-field v-model="form.name" label="Name" variant="outlined" required />
        <v-text-field v-model="form.manufacturer" label="Manufacturer" variant="outlined" />
        <v-text-field v-model="form.mfr_part_number" label="MPN" variant="outlined" />
        <v-text-field v-model="form.order_number" label="Order #" variant="outlined" />
        <v-text-field v-model.number="form.quantity_full" label="Quantity Full" type="number" variant="outlined" min="0" />
        <v-text-field v-model.number="form.quantity_stock" label="Quantity Stock" type="number" variant="outlined" min="0" />
        <v-select
          v-model="form.container"
          :items="containers"
          item-title="name"
          item-value="id"
          label="Container"
          variant="outlined"
          clearable
        />
        <v-text-field v-model="form.code_raw" label="Distributor code (optional)" variant="outlined" />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="$router.push('/items')">Cancel</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="tonal" :loading="saving" @click="submit">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { detectDistributor } from '../lib/distributors'

const router = useRouter()
const saving = ref(false)
const containers = ref([])

const form = ref({
  name: '',
  manufacturer: '',
  mfr_part_number: '',
  order_number: '',
  quantity_full: 1,
  quantity_stock: 1,
  container: null,
  code_raw: '',
})

onMounted(async () => {
  const r = await api.get('/api/collections/containers/records?sort=name')
  containers.value = r.data.items
})

async function submit() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      manufacturer: form.value.manufacturer,
      mfr_part_number: form.value.mfr_part_number,
      order_number: form.value.order_number,
      quantity_full: form.value.quantity_full || 1,
      quantity_stock: form.value.quantity_stock || 0,
      code_raw: form.value.code_raw,
      distributor: form.value.code_raw ? (detectDistributor(form.value.code_raw) || 'lcsc') : 'lcsc',
      container: form.value.container || null,
      date_added: new Date().toISOString(),
    }
    const r = await api.post('/api/collections/items/records', payload)
    await api.post('/api/collections/item_history/records', {
      item: r.data.id, action: 'add', quantity: payload.quantity_full,
    })
    router.push('/items/' + r.data.id)
  } finally {
    saving.value = false
  }
}
</script>
