<template>
  <v-card>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <v-card-text>
      <slot name="before-fields" />
      <v-text-field v-model="model.name" label="Name" variant="outlined" />
      <v-text-field v-model="model.location" label="Location" variant="outlined" />
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
defineProps({
  model: { type: Object, required: true },
  title: { type: String, default: '' },
  submitLabel: { type: String, default: 'Save' },
  loading: { type: Boolean, default: false },
  showCancel: { type: Boolean, default: true },
})

defineEmits(['submit', 'cancel'])
</script>
