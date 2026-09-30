<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex ga-2">
        <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="openCreate">
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
            <v-btn
              variant="text"
              icon="mdi-pencil"
              @click="openEdit(c)"
            />
            <v-spacer />
            <v-btn
              variant="text"
              color="error"
              icon="mdi-delete"
              @click="openDelete(c)"
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

    <v-dialog v-model="showForm" max-width="400">
      <ContainerForm
        :model="form"
        :title="editing ? 'Edit Container' : 'New Container'"
        :submit-label="editing ? 'Save' : 'Create'"
        :loading="saving"
        @submit="submitForm"
        @cancel="showForm = false"
      />
    </v-dialog>

    <v-dialog v-model="showDelete" max-width="400">
      <v-card>
        <v-card-title>Delete container?</v-card-title>
        <v-card-text>
          <p class="mb-2">Delete "{{ deleteTarget?.name }}"?</p>
          <div v-if="deleteItemCount" class="text-caption text-medium-emphasis">
            {{ deleteItemCount }} item(s) will be moved to unassigned.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="tonal" :loading="deleting" @click="removeContainer">
            Delete
          </v-btn>
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
import ContainerForm from '../components/ContainerForm.vue'

const router = useRouter()
const containers = ref([])
const items = ref([])
const loading = ref(false)
const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = ref({ name: '', location: '' })
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const showLabelDialog = ref(false)
const labelZpl = ref('')
const labelContainer = ref(null)
const printing = ref(false)
const printError = ref('')

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

const deleteItemCount = computed(() => {
  if (!deleteTarget.value) return 0
  return itemsByContainer.value[deleteTarget.value.id]?.length || 0
})

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

function openCreate() {
  editing.value = null
  form.value = { name: '', location: '' }
  showForm.value = true
}

function openEdit(c) {
  editing.value = c
  form.value = { name: c.name, location: c.location || '' }
  showForm.value = true
}

async function submitForm() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (editing.value) {
      const r = await api.patch('/api/collections/containers/records/' + editing.value.id, {
        name: form.value.name,
        location: form.value.location,
      })
      const idx = containers.value.findIndex((c) => c.id === editing.value.id)
      if (idx !== -1) containers.value[idx] = r.data
      await logContainerHistory(r.data, 'edit', describeChanges(editing.value, r.data))
    } else {
      const r = await api.post('/api/collections/containers/records', {
        name: form.value.name,
        location: form.value.location,
      })
      containers.value.push(r.data)
      await logContainerHistory(r.data, 'create', 'created')
    }
    showForm.value = false
  } finally {
    saving.value = false
  }
}

function describeChanges(oldC, newC) {
  const parts = []
  if (oldC.name !== newC.name) parts.push('name: "' + oldC.name + '" → "' + newC.name + '"')
  const oldLoc = oldC.location || ''
  const newLoc = newC.location || ''
  if (oldLoc !== newLoc) parts.push('location: "' + oldLoc + '" → "' + newLoc + '"')
  return parts.join('; ') || 'updated'
}

async function logContainerHistory(c, action, note) {
  await api.post('/api/collections/container_history/records', {
    container_id: c.id,
    container_name: c.name,
    action,
    note,
  })
}

function openDelete(c) {
  deleteTarget.value = c
  showDelete.value = true
}

async function removeContainer() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete('/api/collections/containers/records/' + deleteTarget.value.id)
    containers.value = containers.value.filter((c) => c.id !== deleteTarget.value.id)
    showDelete.value = false
    await load()
  } finally {
    deleting.value = false
  }
}

async function fetchLabel(c) {
  labelContainer.value = c
  labelZpl.value = containerZpl(c)
  printError.value = ''
  showLabelDialog.value = true
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
