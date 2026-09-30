<template>
  <v-card>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <v-card-text>
      <slot name="before-fields" />
      <v-text-field v-model="model.name" label="Name" variant="outlined" required />
      <v-text-field v-model="model.manufacturer" label="Manufacturer" variant="outlined" />
      <v-text-field v-model="model.mfr_part_number" label="MPN" variant="outlined" />
      <v-text-field v-model="model.order_number" label="Order #" variant="outlined" />
      <v-text-field
        v-model.number="model.quantity_full"
        label="Quantity Full"
        type="number"
        variant="outlined"
        min="0"
      />
      <v-select
        v-model="model.container"
        :items="containers"
        item-title="name"
        item-value="id"
        label="Container"
        variant="outlined"
        clearable
      />
      <v-text-field v-model="model.code_raw" label="Distributor code (optional)" variant="outlined" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn v-if="showCancel" variant="text" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" variant="tonal" :loading="loading" @click="$emit('submit')">
        {{ submitLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/client'

defineProps({
  model: { type: Object, required: true },
  title: { type: String, default: '' },
  submitLabel: { type: String, default: 'Save' },
  loading: { type: Boolean, default: false },
  showCancel: { type: Boolean, default: true },
})

defineEmits(['submit', 'cancel'])

const containers = ref([])

onMounted(async () => {
  const r = await api.get('/api/collections/containers/records?sort=name')
  containers.value = r.data.items
})
</script>
