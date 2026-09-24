<template>
  <v-container>
    <div class="text-h5 mb-3">History</div>
    <v-card>
      <v-list>
        <v-list-item
          v-for="h in history"
          :key="h.id"
        >
          <template v-slot:prepend>
            <v-icon :color="actionColor(h.action)" :icon="actionIcon(h.action)" />
          </template>
          <v-list-item-title>
            <template v-if="h.action === 'relocate' && h.note">relocated</template>
            <template v-else><strong>{{ h.action }}</strong> x{{ h.quantity }}</template>
            <v-chip v-if="h.expand?.item" size="small" variant="tonal" class="ml-2">
              {{ h.expand.item.name }}
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle>
            <template v-if="h.note">{{ h.note }} — </template>
            {{ h.user }} @ {{ h.datetime }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-pagination
        v-if="totalPages > 1"
        v-model="page"
        :length="totalPages"
        class="pa-4"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '../api/client'
import { actionColor, actionIcon } from '../lib/history'

const history = ref([])
const page = ref(1)
const totalPages = ref(1)

async function load() {
  const r = await api.get('/api/collections/item_history/records', {
    params: { sort: '-datetime', perPage: 50, page: page.value, expand: 'item' },
  })
  history.value = r.data.items
  totalPages.value = r.data.totalPages
}

watch(page, load)
onMounted(load)
</script>
