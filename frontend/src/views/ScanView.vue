<template>
  <v-container>
    <div class="text-h5 mb-3">Scan</div>
    <ScanQr @scan="onScan" />

    <v-alert
      v-if="notice"
      :type="noticeType"
      class="mt-2"
      variant="tonal"
      closable
      @click:close="notice = ''"
    >
      {{ notice }}
    </v-alert>

    <v-select
      v-if="scannedItems.length"
      v-model="containerId"
      :items="containers"
      item-title="name"
      item-value="id"
      label="Container for new items"
      variant="outlined"
      class="mt-4"
      clearable
    />

    <div v-if="scannedItems.length" class="mt-2">
      <v-card
        v-for="(entry, i) in scannedItems"
        :key="entry.id"
        class="mb-2"
        :variant="entry.added ? 'tonal' : 'elevated'"
        :color="entry.added ? 'success' : undefined"
      >
        <v-card-text>
          <div class="d-flex align-center ga-2">
            <div class="flex-grow-1">
              <div v-if="entry.scannedData.manufacturerPart" class="font-weight-medium">
                {{ entry.scannedData.manufacturerPart }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ entry.scannedData.code }}
                <span v-if="entry.scannedData.quantity"> &middot; Qty: {{ entry.scannedData.quantity }}</span>
              </div>
            </div>

            <template v-if="!entry.added">
              <v-btn
                v-if="!entry.showTakeout"
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                @click="addItem(i)"
              >
                Add
              </v-btn>

              <v-btn
                v-if="!entry.showTakeout"
                color="warning"
                variant="tonal"
                size="small"
                prepend-icon="mdi-minus"
                @click="entry.showTakeout = true"
              >
                Take out
              </v-btn>

              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="dismissItem(i)"
              />
            </template>
            <template v-else>
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
          </div>

          <v-row v-if="entry.showTakeout && !entry.added" class="mt-2">
            <v-col cols="4">
              <v-text-field
                v-model.number="entry.takeQty"
                label="Qty"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                min="1"
              />
            </v-col>
            <v-col cols="8" class="d-flex ga-2 align-center">
              <v-btn
                color="warning"
                variant="tonal"
                size="small"
                @click="takeOutItem(i)"
              >
                Confirm
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                @click="entry.showTakeout = false"
              >
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/client'
import ScanQr from '../components/ScanQr.vue'
import { useScanAction } from '../lib/useScanAction'

let nextId = 1

const { parseScan, createItem, takeoutItem } = useScanAction()

const scannedItems = ref([])
const containers = ref([])
const containerId = ref(null)
const notice = ref('')
const noticeType = ref('info')

onMounted(async () => {
  const r = await api.get('/api/collections/containers/records?sort=name')
  containers.value = r.data.items
})

function onScan(raw) {
  const data = parseScan(raw)
  scannedItems.value.push({
    id: nextId++,
    scannedData: { ...data },
    takeQty: 1,
    showTakeout: false,
    added: false,
  })
}

async function addItem(i) {
  const entry = scannedItems.value[i]
  if (!containerId.value) {
    notice.value = 'Select a container first'
    noticeType.value = 'warning'
    return
  }
  try {
    await createItem(containerId.value)
    entry.added = true
    notice.value = 'Item added to container'
    noticeType.value = 'success'
    setTimeout(() => {
      const idx = scannedItems.value.indexOf(entry)
      if (idx !== -1) scannedItems.value.splice(idx, 1)
    }, 1500)
  } catch (e) {
    notice.value = e.message || 'Failed to add item'
    noticeType.value = 'error'
  }
}

async function takeOutItem(i) {
  const entry = scannedItems.value[i]
  const qty = entry.takeQty || 1
  try {
    await takeoutItem(entry.scannedData.code, qty)
    scannedItems.value.splice(i, 1)
    notice.value = 'Taken out ' + qty
    noticeType.value = 'success'
  } catch (e) {
    notice.value = e.message || 'Failed to take out item'
    noticeType.value = 'error'
  }
}

function dismissItem(i) {
  scannedItems.value.splice(i, 1)
}
</script>
