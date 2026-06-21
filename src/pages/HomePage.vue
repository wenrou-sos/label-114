<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { GrowthIndicator, AgeRange, BabyMeasurement, SpecialPeriod } from '../types'
import Header from '../components/Header.vue'
import IndicatorSwitch from '../components/IndicatorSwitch.vue'
import AgeRangeSwitch from '../components/AgeRangeSwitch.vue'
import GrowthChart from '../components/GrowthChart.vue'
import SpecialPeriodLegend from '../components/SpecialPeriodLegend.vue'
import MeasurementDetail from '../components/MeasurementDetail.vue'
import SpecialPeriodDetail from '../components/SpecialPeriodDetail.vue'
import AddMeasurementModal from '../components/AddMeasurementModal.vue'
import ManageBabiesModal from '../components/ManageBabiesModal.vue'
import { useBabyData } from '../composables/useBabyData'

const { measurements, maxAgeMonths, currentBabyId, deleteMeasurement } = useBabyData()

const manageModalVisible = ref(false)

const compareMode = ref(false)
const compareBabyId = ref('')

const handleManageBabies = () => {
  manageModalVisible.value = true
}

watch(currentBabyId, () => {
  if (maxAgeMonths.value > 24 && currentAgeRange.value === '0-24') {
    currentAgeRange.value = '0-60'
  }
  if (compareBabyId.value === currentBabyId.value) {
    compareBabyId.value = ''
    compareMode.value = false
  }
})

const currentIndicator = ref<GrowthIndicator>('weight')
const currentAgeRange = ref<AgeRange>('0-24')

watch(maxAgeMonths, (newMax) => {
  if (newMax > 24 && currentAgeRange.value === '0-24') {
    currentAgeRange.value = '0-60'
  }
}, { immediate: true })

const detailVisible = ref(false)
const selectedMeasurement = ref<BabyMeasurement | null>(null)
const selectedMeasurementIndex = ref(0)

const periodDetailVisible = ref(false)
const selectedPeriod = ref<SpecialPeriod | null>(null)

const addModalVisible = ref(false)
const addModalMode = ref<'add' | 'edit'>('add')
const editingMeasurement = ref<BabyMeasurement | null>(null)

const handlePointClick = (measurement: BabyMeasurement, index: number) => {
  selectedMeasurement.value = measurement
  selectedMeasurementIndex.value = index
  detailVisible.value = true
}

const handleCloseDetail = () => {
  detailVisible.value = false
}

const handleEditMeasurement = (measurement: BabyMeasurement) => {
  detailVisible.value = false
  editingMeasurement.value = measurement
  addModalMode.value = 'edit'
  addModalVisible.value = true
}

const handleDeleteMeasurement = (measurement: BabyMeasurement) => {
  deleteMeasurement(measurement.id)
  if (maxAgeMonths.value <= 24 && currentAgeRange.value === '0-60') {
    currentAgeRange.value = '0-24'
  }
}

const handlePeriodClick = (period: SpecialPeriod) => {
  selectedPeriod.value = period
  periodDetailVisible.value = true
}

const handleClosePeriodDetail = () => {
  periodDetailVisible.value = false
}

const handleAddSuccess = () => {
  editingMeasurement.value = null
  addModalMode.value = 'add'
  if (maxAgeMonths.value > 24 && currentAgeRange.value === '0-24') {
    currentAgeRange.value = '0-60'
  }
}

const handleAddButtonClick = () => {
  editingMeasurement.value = null
  addModalMode.value = 'add'
  addModalVisible.value = true
}

const handleAddModalClose = () => {
  addModalVisible.value = false
  setTimeout(() => {
    if (editingMeasurement.value) {
      const idx = measurements.value.findIndex(m => m.id === editingMeasurement.value!.id)
      if (idx !== -1) {
        selectedMeasurement.value = measurements.value[idx]
        selectedMeasurementIndex.value = idx
        detailVisible.value = true
      }
    }
    editingMeasurement.value = null
    addModalMode.value = 'add'
  }, 0)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 pb-24">
    <div class="max-w-lg mx-auto px-4 py-6">
      <Header @manage="handleManageBabies" />
      
      <IndicatorSwitch v-model="currentIndicator" />
      
      <AgeRangeSwitch v-model="currentAgeRange" />
      
      <GrowthChart
        v-model:compare-mode="compareMode"
        v-model:compare-baby-id="compareBabyId"
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
    
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <button
        @click="handleAddButtonClick"
        class="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-xl shadow-pink-300/60 hover:shadow-pink-400/70 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-pink-400/50"
      >
        <Plus class="w-5 h-5" />
        <span>添加记录</span>
      </button>
    </div>
    
    <MeasurementDetail
      :visible="detailVisible"
      :measurement="selectedMeasurement"
      :measurement-index="selectedMeasurementIndex"
      :indicator="currentIndicator"
      @close="handleCloseDetail"
      @edit="handleEditMeasurement"
      @delete="handleDeleteMeasurement"
    />
    
    <SpecialPeriodDetail
      :visible="periodDetailVisible"
      :period="selectedPeriod"
      @close="handleClosePeriodDetail"
    />
    
    <AddMeasurementModal
      :visible="addModalVisible"
      :mode="addModalMode"
      :edit-measurement="editingMeasurement"
      @close="handleAddModalClose"
      @success="handleAddSuccess"
    />
    
    <ManageBabiesModal
      :visible="manageModalVisible"
      @close="manageModalVisible = false"
    />
  </div>
</template>
