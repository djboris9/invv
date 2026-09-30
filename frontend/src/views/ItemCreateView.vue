<template>
  <v-container max-width="600">
    <div class="text-h5 mb-4">New Item</div>

    <ItemForm
      :model="form"
      submit-label="Save"
      :loading="saving"
      @submit="submit"
      @cancel="$router.push('/items')"
    />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { detectDistributor } from '../lib/distributors'
import ItemForm from '../components/ItemForm.vue'

const router = useRouter()
const saving = ref(false)

const form = ref({
  name: '',
  manufacturer: '',
  mfr_part_number: '',
  order_number: '',
  quantity_full: 1,
  container: null,
  code_raw: '',
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
      quantity_stock: form.value.quantity_full || 0,
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
