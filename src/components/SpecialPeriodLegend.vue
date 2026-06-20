<script setup lang="ts">
import { Star, Baby, Thermometer } from 'lucide-vue-next'

const legends = [
  { type: 'growthSpurt', label: '猛长期', color: '#FFB74D', icon: Star },
  { type: 'teething', label: '出牙期', color: '#81C784', icon: Baby },
  { type: 'illness', label: '生病期', color: '#E57373', icon: Thermometer }
]

const percentiles = [
  { label: 'P3/P97', color: '#E0E0E0', style: 'dashed' },
  { label: 'P15/P85', color: '#BDBDBD', style: 'dashed' },
  { label: 'P50 (中位线)', color: '#FF8FA3', style: 'solid' },
  { label: '宝宝数据', color: '#FF6B6B', style: 'solid' }
]
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
    
    <div>
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
  </div>
</template>
