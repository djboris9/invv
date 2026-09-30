<template>
  <div>
    <v-list v-if="items.length">
      <v-list-item
        v-for="h in items"
        :key="h.id"
      >
        <template v-slot:prepend>
          <v-icon :color="actionColor(h.action)" :icon="actionIcon(h.action)" />
        </template>
        <v-list-item-title>
          <template v-if="kind === 'container'">
            <strong>{{ containerActionLabel(h.action) }}</strong>
            <v-chip v-if="h.container_name" size="small" variant="tonal" class="ml-2">
              {{ h.container_name }}
            </v-chip>
            <v-chip v-if="h.item_name" size="small" variant="tonal" class="ml-2">
              {{ h.item_name }}
            </v-chip>
          </template>
          <template v-else>
            <template v-if="h.action === 'relocate' && h.note">relocated</template>
            <template v-else><strong>{{ h.action }}</strong> x{{ h.quantity }}</template>
            <v-chip v-if="h.expand?.item" size="small" variant="tonal" class="ml-2">
              {{ h.expand.item.name }}
            </v-chip>
          </template>
        </v-list-item-title>
        <v-list-item-subtitle>
          <template v-if="h.note">{{ h.note }} — </template>
          {{ h.user }} @ {{ h.datetime }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <div v-else class="text-caption text-medium-emphasis pa-4">No history</div>

    <v-pagination
      v-if="totalPages > 1"
      :model-value="page"
      :length="totalPages"
      class="pa-4"
      @update:model-value="$emit('update:page', $event)"
    />
  </div>
</template>

<script setup>
import { actionColor, actionIcon, containerActionLabel } from '../lib/history'

defineProps({
  items: { type: Array, required: true },
  kind: { type: String, default: 'item' },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
})

defineEmits(['update:page'])
</script>
