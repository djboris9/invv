<template>
  <v-container>
    <div class="text-h5 mb-3">History</div>
    <v-card>
      <v-tabs v-model="tab">
        <v-tab value="items">Items</v-tab>
        <v-tab value="containers">Containers</v-tab>
      </v-tabs>
      <v-divider />

      <HistoryList
        v-if="tab === 'items'"
        kind="item"
        :items="itemHistory"
        v-model:page="itemPage"
        :total-pages="itemTotalPages"
      />
      <HistoryList
        v-else
        kind="container"
        :items="containerHistory"
        v-model:page="containerPage"
        :total-pages="containerTotalPages"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '../api/client'
import HistoryList from '../components/HistoryList.vue'

const tab = ref('items')

const itemHistory = ref([])
const itemPage = ref(1)
const itemTotalPages = ref(1)

const containerHistory = ref([])
const containerPage = ref(1)
const containerTotalPages = ref(1)
const containerLoaded = ref(false)

async function loadItems() {
  const r = await api.get('/api/collections/item_history/records', {
    params: { sort: '-datetime', perPage: 50, page: itemPage.value, expand: 'item' },
  })
  itemHistory.value = r.data.items
  itemTotalPages.value = r.data.totalPages
}

async function loadContainers() {
  const r = await api.get('/api/collections/container_history/records', {
    params: { sort: '-datetime', perPage: 50, page: containerPage.value },
  })
  containerHistory.value = r.data.items
  containerTotalPages.value = r.data.totalPages
  containerLoaded.value = true
}

watch(itemPage, loadItems)
watch(containerPage, loadContainers)
watch(tab, (value) => {
  if (value === 'containers' && !containerLoaded.value) {
    loadContainers()
  }
})

onMounted(loadItems)
</script>
