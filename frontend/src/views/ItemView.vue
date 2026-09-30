<template>
  <v-container>
    <v-card v-if="item" class="mb-4">
      <v-card-title>{{ item.name }}</v-card-title>
      <v-card-subtitle>{{ item.manufacturer }} - {{ item.mfr_part_number }}</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="6"><strong>Stock:</strong> {{ item.quantity_stock }} / {{ item.quantity_full }}</v-col>
          <v-col cols="6"><strong>Order:</strong> {{ item.order_number }}</v-col>
          <v-col cols="12"><strong>Code:</strong> <code>{{ item.code_raw }}</code></v-col>
          <v-col cols="12">
            <v-select
              :model-value="item?.container || ''"
              :items="containerOptions"
              item-title="name"
              item-value="id"
              label="Container"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="onContainerChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-text-field
          v-model.number="qty"
          label="Qty"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 100px"
          min="1"
        />
        <v-btn variant="tonal" color="warning" @click="takeout">Take out</v-btn>
        <v-btn variant="tonal" color="success" @click="restock">Restock</v-btn>
        <v-spacer />
        <v-btn variant="text" icon="mdi-pencil" @click="openEdit" />
        <v-btn variant="text" color="error" icon="mdi-delete" @click="showDelete = true" />
      </v-card-actions>
    </v-card>

    <div class="text-h6 mt-4 mb-2">History</div>
    <v-card v-if="history.length">
      <v-list>
        <v-list-item
          v-for="h in history"
          :key="h.id"
        >
          <template v-slot:prepend>
            <v-icon
              :color="actionColor(h.action)"
              :icon="actionIcon(h.action)"
            />
          </template>
          <v-list-item-title>
            <template v-if="h.action === 'relocate' && h.note">relocated</template>
            <template v-else>{{ h.action }} x{{ h.quantity }}</template>
          </v-list-item-title>
          <v-list-item-subtitle>
            <template v-if="h.note">{{ h.note }} — </template>
            {{ h.user }} @ {{ h.datetime }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
    <div v-else class="text-caption text-medium-emphasis">No history</div>

    <v-btn class="mt-4" variant="text" prepend-icon="mdi-arrow-left" @click="router.push('/containers')">
      Back
    </v-btn>

    <v-dialog v-model="showEdit" max-width="600">
      <ItemForm
        :model="editForm"
        title="Edit Item"
        submit-label="Save"
        :loading="saving"
        @submit="submitEdit"
        @cancel="showEdit = false"
      />
    </v-dialog>

    <v-dialog v-model="showDelete" max-width="400">
      <v-card>
        <v-card-title>Delete item?</v-card-title>
        <v-card-text>
          <p class="mb-2">Delete "{{ item?.name }}"?</p>
          <div class="text-caption text-medium-emphasis">
            This also removes the item's history.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="tonal" :loading="deleting" @click="removeItem">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/client'
import { actionColor, actionIcon } from '../lib/history'
import ItemForm from '../components/ItemForm.vue'

const route = useRoute()
const router = useRouter()
const item = ref(null)
const history = ref([])
const containers = ref([])
const qty = ref(1)
const showEdit = ref(false)
const saving = ref(false)
const showDelete = ref(false)
const deleting = ref(false)
const editForm = ref({
  name: '', manufacturer: '', mfr_part_number: '', order_number: '',
  quantity_full: 1, container: null, code_raw: '',
})

const containerOptions = computed(() => {
  const opts = [...containers.value]
  opts.unshift({ id: '', name: '(none)' })
  return opts
})

function containerName(id) {
  if (!id) return '(none)'
  const c = containers.value.find((c) => c.id === id)
  return c?.name || id
}

async function load() {
  const [c, i, h] = await Promise.all([
    api.get('/api/collections/containers/records?sort=name'),
    api.get('/api/collections/items/records/' + route.params.id),
    api.get('/api/collections/item_history/records', {
      params: {
        filter: 'item="' + route.params.id.replace(/"/g, '\\"') + '"',
        sort: '-datetime',
      },
    }),
  ])
  containers.value = c.data.items
  item.value = i.data
  history.value = h.data.items
}

async function onContainerChange(rawNewId) {
  const newId = rawNewId || ''
  const oldId = item.value.container || ''
  if (newId === oldId) return

  const fromName = containerName(oldId)
  const toName = containerName(newId)

  await api.patch('/api/collections/items/records/' + item.value.id, {
    container: newId || null,
  })
  await api.post('/api/collections/item_history/records', {
    item: item.value.id,
    action: 'relocate',
    quantity: 0,
    note: 'from "' + fromName + '" to "' + toName + '"',
  })
  await load()
}

function openEdit() {
  editForm.value = {
    name: item.value.name || '',
    manufacturer: item.value.manufacturer || '',
    mfr_part_number: item.value.mfr_part_number || '',
    order_number: item.value.order_number || '',
    quantity_full: item.value.quantity_full ?? 0,
    container: item.value.container || null,
    code_raw: item.value.code_raw || '',
  }
  showEdit.value = true
}

function describeChanges(oldItem, payload) {
  const fields = ['name', 'manufacturer', 'mfr_part_number', 'order_number', 'quantity_full', 'code_raw']
  const changed = fields.filter((f) => (oldItem[f] ?? '') !== (payload[f] ?? ''))
  if ((oldItem.container || '') !== (payload.container || '')) changed.push('container')
  return changed.length ? 'edited: ' + changed.join(', ') : 'edited'
}

async function submitEdit() {
  if (!editForm.value.name.trim()) return
  saving.value = true
  try {
    const oldContainer = item.value.container || ''
    const newContainer = editForm.value.container || ''
    const payload = {
      name: editForm.value.name,
      manufacturer: editForm.value.manufacturer,
      mfr_part_number: editForm.value.mfr_part_number,
      order_number: editForm.value.order_number,
      quantity_full: editForm.value.quantity_full,
      code_raw: editForm.value.code_raw,
      container: newContainer || null,
    }
    await api.patch('/api/collections/items/records/' + item.value.id, payload)

    if (newContainer !== oldContainer) {
      await api.post('/api/collections/item_history/records', {
        item: item.value.id,
        action: 'relocate',
        quantity: 0,
        note: 'from "' + containerName(oldContainer) + '" to "' + containerName(newContainer) + '"',
      })
    }

    await api.post('/api/collections/item_history/records', {
      item: item.value.id,
      action: 'edit',
      quantity: 0,
      note: describeChanges(item.value, payload),
    })

    showEdit.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function removeItem() {
  deleting.value = true
  try {
    await api.delete('/api/collections/items/records/' + item.value.id)
    showDelete.value = false
    router.push('/items')
  } finally {
    deleting.value = false
  }
}

async function takeout() {
  if (qty.value <= 0) return
  const newStock = Math.max(0, item.value.quantity_stock - qty.value)
  await api.patch('/api/collections/items/records/' + item.value.id, {
    quantity_stock: newStock,
  })
  await api.post('/api/collections/item_history/records', {
    item: item.value.id, action: 'takeout', quantity: qty.value,
    note: 'stock now ' + newStock,
  })
  await load()
}

async function restock() {
  if (qty.value <= 0) return
  const newStock = item.value.quantity_stock + qty.value
  await api.patch('/api/collections/items/records/' + item.value.id, {
    quantity_stock: newStock,
  })
  await api.post('/api/collections/item_history/records', {
    item: item.value.id, action: 'restock', quantity: qty.value,
    note: 'stock now ' + newStock,
  })
  await load()
}

onMounted(load)
</script>
