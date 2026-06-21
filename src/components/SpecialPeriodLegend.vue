<script setup lang="ts">
import { computed } from 'vue'
import { Star, Baby, Thermometer, ChevronRight } from 'lucide-vue-next'
import type { AgeRange, SpecialPeriod, SpecialPeriodType } from '../types'
import { useBabyData } from '../composables/useBabyData'

interface Props {
  ageRange?: AgeRange
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'periodClick', period: SpecialPeriod): void
}>()

const { specialPeriods } = useBabyData()

const periodConfig: Record<SpecialPeriodType, { label: string; color: string; icon: typeof Star }> = {
  growthSpurt: { label: '猛长期', color: '#FFB74D', icon: Star },
  teething: { label: '出牙期', color: '#81C784', icon: Baby },
  illness: { label: '生病期', color: '#E57373', icon: Thermometer }
}

const legends = [
  { type: 'growthSpurt' as const, label: '猛长期', color: '#FFB74D', icon: Star },
  { type: 'teething' as const, label: '出牙期', color: '#81C784', icon: Baby },
  { type: 'illness' as const, label: '生病期', color: '#E57373', icon: Thermometer }
]

const percentiles = [
  { label: 'P3/P97', color: '#E0E0E0', style: 'dashed' },
  { label: 'P15/P85', color: '#BDBDBD', style: 'dashed' },
  { label: 'P50 (中位线)', color: '#FF8FA3', style: 'solid' },
  { label: '宝宝数据', color: '#FF6B6B', style: 'solid' }
]

const formatAge = (ageMonths: number): string => {
  if (ageMonths < 1) {
    const weeks = Math.round(ageMonths * 4.33)
    return `${weeks}周`
  }
  if (Number.isInteger(ageMonths)) {
    return `${ageMonths}月`
  }
  return `${ageMonths}月`
}

const visiblePeriods = computed(() => {
  const maxAge = props.ageRange === '0-60' ? 60 : 24
  return specialPeriods.value
    .filter(sp => sp.ageMonths <= maxAge)
    .sort((a, b) => a.ageMonths - b.ageMonths)
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">图例说明</h3>
    
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-600 mb-2">生长曲线</h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="p in percentiles"
          :key="p.label"
          class="flex items-center gap-2"
        >
          <div class="relative w-6 h-0.5">
            <div 
              class="absolute inset-0"
              :style="{
                backgroundColor: p.style === 'dashed' ? 'transparent' : p.color,
                borderTop: p.style === 'dashed' ? `2px dashed ${p.color}` : 'none',
                height: p.style === 'dashed' ? '0' : '2px',
                top: p.style === 'dashed' ? '-1px' : '0'
              }"
            ></div>
          </div>
          <span class="text-xs text-gray-500">{{ p.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-600 mb-2">特殊时期</h4>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="legend in legends"
          :key="legend.type"
          class="flex items-center gap-2"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: legend.color + '20' }"
          >
            <component 
              :is="legend.icon" 
              class="w-3.5 h-3.5"
              :style="{ color: legend.color }"
            />
          </div>
          <span class="text-xs text-gray-500">{{ legend.label }}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-600">特殊时期记录</h4>
        <span class="text-[10px] text-gray-400">点击查看详情</span>
      </div>
      <div v-if="visiblePeriods.length > 0" class="space-y-2">
        <button
          v-for="(sp, idx) in visiblePeriods"
          :key="sp.id"
          @click="emit('periodClick', sp)"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left active:scale-[0.98] transition-transform"
          :style="{ backgroundColor: periodConfig[sp.type].color + '12' }"
        >
          <div 
            class="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: periodConfig[sp.type].color + '30' }"
          >
            <component 
              :is="periodConfig[sp.type].icon" 
              class="w-4 h-4"
              :style="{ color: periodConfig[sp.type].color }"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-gray-800">{{ sp.label }}</span>
              <span 
                class="text-xs px-1.5 py-0.5 rounded-full text-white font-tabular"
                :style="{ backgroundColor: periodConfig[sp.type].color }"
              >
                {{ formatAge(sp.ageMonths) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-1">{{ sp.description }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-300 flex-shrink-0" />
        </button>
      </div>
      <p v-else class="text-xs text-gray-400 py-2">当前月龄范围内暂无特殊时期记录</p>
    </div>
  </div>
</template>
