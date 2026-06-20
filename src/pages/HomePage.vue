<script setup lang="ts">
import { ref } from 'vue'
import type { GrowthIndicator, AgeRange, BabyMeasurement, SpecialPeriod } from '../types'
import Header from '../components/Header.vue'
import IndicatorSwitch from '../components/IndicatorSwitch.vue'
import AgeRangeSwitch from '../components/AgeRangeSwitch.vue'
import GrowthChart from '../components/GrowthChart.vue'
import SpecialPeriodLegend from '../components/SpecialPeriodLegend.vue'
import MeasurementDetail from '../components/MeasurementDetail.vue'
import SpecialPeriodDetail from '../components/SpecialPeriodDetail.vue'

const currentIndicator = ref<GrowthIndicator>('weight')
const currentAgeRange = ref<AgeRange>('0-24')

const detailVisible = ref(false)
const selectedMeasurement = ref<BabyMeasurement | null>(null)
const selectedMeasurementIndex = ref(0)

const periodDetailVisible = ref(false)
const selectedPeriod = ref<SpecialPeriod | null>(null)

const handlePointClick = (measurement: BabyMeasurement, index: number) => {
  selectedMeasurement.value = measurement
  selectedMeasurementIndex.value = index
  detailVisible.value = true
}

const handleCloseDetail = () => {
  detailVisible.value = false
}

const handlePeriodClick = (period: SpecialPeriod) => {
  selectedPeriod.value = period
  periodDetailVisible.value = true
}

const handleClosePeriodDetail = () => {
  periodDetailVisible.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
    <div class="max-w-lg mx-auto px-4 py-6">
      <Header />
      
      <IndicatorSwitch v-model="currentIndicator" />
      
      <AgeRangeSwitch v-model="currentAgeRange" />
      
      <GrowthChart
        :indicator="currentIndicator"
        :age-range="currentAgeRange"
        @point-click="handlePointClick"
        @period-click="handlePeriodClick"
      />
      
      <SpecialPeriodLegend 
        :age-range="currentAgeRange" 
        @period-click="handlePeriodClick"
      />
      
      <div class="text-center text-xs text-gray-400 mt-6 pb-4">
        <p>双指捏合可缩放图表，左右滑动可查看不同月龄段</p>
        <p class="mt-1">点击测量点或特殊时期标记可查看详情</p>
      </div>
    </div>
    
    <MeasurementDetail
      :visible="detailVisible"
      :measurement="selectedMeasurement"
      :measurement-index="selectedMeasurementIndex"
      :indicator="currentIndicator"
      @close="handleCloseDetail"
    />
    
    <SpecialPeriodDetail
      :visible="periodDetailVisible"
      :period="selectedPeriod"
      @close="handleClosePeriodDetail"
    />
  </div>
</template>
