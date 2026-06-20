<script setup lang="ts">
import type { AgeRange } from '../types'

interface Props {
  modelValue: AgeRange
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: AgeRange): void
}>()

const ranges: { key: AgeRange; label: string }[] = [
  { key: '0-24', label: '0-24个月' },
  { key: '0-60', label: '0-60个月' }
]
</script>

<template>
  <div class="flex bg-gray-100 rounded-xl p-1 mb-4">
    <button
      v-for="range in ranges"
      :key="range.key"
      @click="emit('update:modelValue', range.key)"
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300"
      :class="[
        props.modelValue === range.key
          ? 'bg-white text-pink-500 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      ]"
    >
      {{ range.label }}
    </button>
  </div>
</template>
