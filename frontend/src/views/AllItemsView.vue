<template>
  <v-container>
    <div class="d-flex align-center ga-2 mb-4">
      <v-text-field
        v-model="search"
        label="Search items"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        clearable
        class="flex-grow-1"
      />
      <v-btn
        icon="mdi-plus"
        color="primary"
        to="/items/new"
      />
    </div>

    <v-card v-if="filteredItems.length" variant="outlined">
      <v-list>
        <v-list-item
          v-for="item in filteredItems"
          :key="item.id"
          @click="router.push('/items/' + item.id)"
        >
          <template v-slot:prepend>
            <v-icon>mdi-chip</v-icon>
          </template>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ item.manufacturer }}
            <template v-if="item.mfr_part_number"> — {{ item.mfr_part_number }}</template>
          </v-list-item-subtitle>
          <template v-slot:append>
            <div class="text-end">
              <div class="text-body-2 font-weight-bold">{{ item.quantity_stock }} / {{ item.quantity_full }}</div>
              <div class="text-caption text-medium-emphasis">
                <template v-if="item.expand?.container?.name">{{ item.expand.container.name }}</template>
                <span v-else class="text-disabled">(no container)</span>
              </div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <div v-else-if="!loading" class="text-center text-medium-emphasis py-8">
      <v-icon size="48" color="disabled">mdi-package-variant</v-icon>
      <div class="text-h6 mt-2">No items found</div>
    </div>

    <v-skeleton-loader v-if="loading" type="list-item-three-line" />
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'

const router = useRouter()
const search = ref('')
const loading = ref(false)
let debounceTimer = null

const filteredItems = ref([])

async function fetchItems(term) {
  loading.value = true
  try {
    const params = { expand: 'container', sort: '-created', perPage: 500 }
    if (term) {
      params.filter = `(name~'${term}'||manufacturer~'${term}'||mfr_part_number~'${term}'||code_raw~'${term}')`
    }
    const r = await api.get('/api/collections/items/records', { params })
    filteredItems.value = r.data.items
  } finally {
    loading.value = false
  }
}

watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchItems(val), 300)
})

onMounted(() => fetchItems(''))
onUnmounted(() => clearTimeout(debounceTimer))
</script>
