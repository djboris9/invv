<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex ga-2">
        <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="showCreate = true">
          New Container
        </v-btn>
        <v-btn prepend-icon="mdi-refresh" variant="text" @click="load" :loading="loading" />
      </v-col>
    </v-row>

    <v-row v-if="unassigned.length">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel title="Unassigned items" :text="unassigned.length + ' items'">
            <v-expansion-panel-text>
              <v-list>
                <v-list-item
                  v-for="item in unassigned"
                  :key="item.id"
                  :title="item.name"
                  :subtitle="'Stock: ' + item.quantity_stock + ' / ' + item.quantity_full"
                  @click="router.push('/items/' + item.id)"
                />
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="c in containers"
        :key="c.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card>
          <v-card-title>{{ c.name }}</v-card-title>
          <v-card-subtitle>{{ c.location }}</v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in itemsByContainer[c.id]"
                :key="item.id"
                :title="item.name"
                :subtitle="'Stock: ' + item.quantity_stock + ' / ' + item.quantity_full"
                @click="router.push('/items/' + item.id)"
              />
            </v-list>
            <div v-if="!itemsByContainer[c.id]?.length" class="text-caption text-medium-emphasis">Empty</div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              variant="text"
              icon="mdi-label"
              @click="fetchLabel(c)"
            />
            <v-spacer />
            <v-btn
              variant="text"
              color="error"
              icon="mdi-delete"
              @click="removeContainer(c.id)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showLabelDialog" max-width="600">
      <v-card>
        <v-card-title>Label for {{ labelContainer?.name }}</v-card-title>
        <v-card-text>
          <v-alert v-if="printError" type="error" density="compact" closable class="mb-2" @click:close="printError = ''">{{ printError }}</v-alert>
          <pre class="pa-3 bg-grey-lighten-3 rounded" style="white-space: pre-wrap; font-size: 12px;">{{ labelZpl }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="!printError"
            variant="tonal"
            prepend-icon="mdi-printer"
            :loading="printing"
            @click="printZpl"
          >
            Print
          </v-btn>
          <v-btn variant="text" @click="showLabelDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showCreate" max-width="400">
      <v-card>
        <v-card-title>New Container</v-card-title>
        <v-card-text>
          <v-text-field v-model="newName" label="Name" variant="outlined" />
          <v-text-field v-model="newLocation" label="Location" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreate = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" @click="createContainer">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { containerZpl } from '../lib/label'

const router = useRouter()
const containers = ref([])
const items = ref([])
const loading = ref(false)
const showCreate = ref(false)
const showLabelDialog = ref(false)
const labelZpl = ref('')
const labelContainer = ref(null)
const printing = ref(false)
const printError = ref('')
const newName = ref('')
const newLocation = ref('')

const itemsByContainer = computed(() => {
  const map = {}
  for (const i of items.value) {
    const cid = i.container || '__unassigned__'
    if (!map[cid]) map[cid] = []
    map[cid].push(i)
  }
  return map
})

const unassigned = computed(() => itemsByContainer.value['__unassigned__'] || [])

async function load() {
  loading.value = true
  try {
    const [c, i] = await Promise.all([
      api.get('/api/collections/containers/records?sort=name'),
      api.get('/api/collections/items/records?sort=-created&perPage=500'),
    ])
    containers.value = c.data.items
    items.value = i.data.items
  } catch (e) {
    console.error('Failed to load data', e)
  } finally {
    loading.value = false
  }
}

async function removeContainer(id) {
  await api.delete('/api/collections/containers/records/' + id)
  containers.value = containers.value.filter((c) => c.id !== id)
}

async function createContainer() {
  if (!newName.value.trim()) return
  const r = await api.post('/api/collections/containers/records', {
    name: newName.value,
    location: newLocation.value,
  })
  containers.value.push(r.data)
  newName.value = ''
  newLocation.value = ''
  showCreate.value = false
}

async function fetchLabel(c) {
  labelContainer.value = c
  labelZpl.value = containerZpl(c)
  printError.value = ''
  showLabelDialog.value = true
}

async function copyZpl() {
  await navigator.clipboard.writeText(labelZpl.value)
}

async function printZpl() {
  printError.value = ''
  printing.value = true
  try {
    await api.post('/api/invv/print', { zpl: labelZpl.value })
  } catch (e) {
    printError.value = e.response?.data?.message || e.message || 'Print failed'
  } finally {
    printing.value = false
  }
}

onMounted(load)
</script>
