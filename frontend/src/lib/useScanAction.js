import { ref } from 'vue'
import { api } from '../api/client'
import { detectDistributor, parseCode } from './distributors'

export function useScanAction() {
  const scannedData = ref(null)
  const rawCode = ref('')

  function parseScan(raw) {
    rawCode.value = raw
    const dist = detectDistributor(raw)
    const p = dist ? parseCode(raw, dist) : { code: raw }
    scannedData.value = p
    return p
  }

  async function createItem(containerId, formOverrides = {}) {
    const d = scannedData.value
    if (!d) throw new Error('No scanned data')
    const dist = detectDistributor(rawCode.value)

    const payload = {
      name: d.manufacturerPart || d.code,
      mfr_part_number: d.manufacturerPart || '',
      order_number: d.orderNumber || '',
      quantity_full: d.quantity || 1,
      quantity_stock: d.quantity || 1,
      code_raw: d.code,
      distributor: dist || 'lcsc',
      container: containerId,
      date_added: new Date().toISOString(),
      ...formOverrides,
    }
    const r = await api.post('/api/collections/items/records', payload)
    await api.post('/api/collections/item_history/records', {
      item: r.data.id, action: 'add', quantity: r.data.quantity_full,
    })
    return r.data
  }

  async function takeoutItem(codeRaw, qty) {
    const items = await api.get('/api/collections/items/records?filter=code_raw%3D%22' + encodeURIComponent(codeRaw) + '%22')
    const target = items.data.items?.[0]
    if (!target) throw new Error('Item not found')
    const newStock = Math.max(0, target.quantity_stock - qty)
    await api.patch('/api/collections/items/records/' + target.id, { quantity_stock: newStock })
    await api.post('/api/collections/item_history/records', {
      item: target.id, action: 'takeout', quantity: qty,
    })
    return target
  }

  return { scannedData, rawCode, parseScan, createItem, takeoutItem }
}
