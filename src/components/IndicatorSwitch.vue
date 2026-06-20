<script setup lang="ts">
import { Scale, Ruler, CircleDot } from 'lucide-vue-next'
import type { GrowthIndicator } from '../types'

interface Props {
  modelValue: GrowthIndicator
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: GrowthIndicator): void
}>()

const indicators: { key: GrowthIndicator; label: string; icon: typeof Scale }[] = [
  { key: 'weight', label: '体重', icon: Scale },
  { key: 'height', label: '身高', icon: Ruler },
  { key: 'headCircumference', label: '头围', icon: CircleDot }
]
</script>

<template>
  <div class="flex gap-2 mb-4">
    <button
      v-for="indicator in indicators"
      :key="indicator.key"
      @click="emit('update:modelValue', indicator.key)"
      class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300"
      :class="[
        props.modelValue === indicator.key
          ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md transform scale-105'
          : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
      ]"
    >
      <component :is="indicator.icon" class="w-5 h-5" />
      <span class="font-medium text-sm">{{ indicator.label }}</span>
    </button>
  </div>
</template>
