<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Calendar, TrendingUp, Percent, Activity, Edit2, Trash2, AlertTriangle } from 'lucide-vue-next'
import type { GrowthIndicator, BabyMeasurement } from '../types'
import { usePercentile } from '../composables/usePercentile'

defineOptions({
  inheritAttrs: false
})

interface Props {
  visible: boolean
  measurement: BabyMeasurement | null
  measurementIndex: number
  indicator: GrowthIndicator
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', measurement: BabyMeasurement): void
  (e: 'delete', measurement: BabyMeasurement): void
}>()

const { getMeasurementDetail, getGrowthStatus } = usePercentile()

const confirmDeleteVisible = ref(false)

const detail = computed(() => {
  if (!props.measurement) return null
  return getMeasurementDetail(props.measurement, props.measurementIndex, props.indicator)
})

const growthStatus = computed(() => {
  if (!detail.value) return null
  return getGrowthStatus(detail.value.percentile)
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const handleEdit = () => {
  if (props.measurement) {
    emit('edit', props.measurement)
  }
}

const handleDeleteClick = () => {
  confirmDeleteVisible.value = true
}

const handleCancelDelete = () => {
  confirmDeleteVisible.value = false
}

const handleConfirmDelete = () => {
  if (props.measurement) {
    emit('delete', props.measurement)
    confirmDeleteVisible.value = false
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>
        
        <div class="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-hidden shadow-2xl transform transition-all">
          <div class="sticky top-0 bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">测量详情</h3>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div v-if="detail" class="p-6 overflow-y-auto">
            <div class="flex items-center gap-4 mb-6">
              <div 
                class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                :style="{ backgroundColor: growthStatus?.color + '20' }"
              >
                <Activity 
                  class="w-8 h-8" 
                  :style="{ color: growthStatus?.color }"
                />
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-800">
                  {{ detail.value.toFixed(2) }}
                  <span class="text-sm font-normal text-gray-500 ml-1">{{ detail.unit }}</span>
                </div>
                <div class="text-sm text-gray-500">{{ detail.indicatorLabel }}</div>
              </div>
            </div>
            
            <div 
              class="rounded-2xl p-4 mb-4"
              :style="{ backgroundColor: growthStatus?.color + '10' }"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">生长状态</span>
                <span 
                  class="px-3 py-1 rounded-full text-sm font-medium text-white"
                  :style="{ backgroundColor: growthStatus?.color }"
                >
                  {{ growthStatus?.status }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ detail.percentileLabel }}
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar class="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div class="text-xs text-gray-500">测量日期</div>
                  <div class="text-sm font-medium text-gray-800">
                    {{ formatDate(detail.date) }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp class="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div class="text-xs text-gray-500">月龄</div>
                  <div class="text-sm font-medium text-gray-800">
                    {{ detail.ageMonths }} 个月
                  </div>
                </div>
              </div>
              
              <div class="p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Percent class="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">百分位排名</div>
                    <div class="text-base font-bold text-gray-800">
                      第 {{ detail.percentile.toFixed(1) }}%
                    </div>
                  </div>
                </div>
                <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    class="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                    :style="{ 
                      width: detail.percentile + '%',
                      backgroundColor: growthStatus?.color
                    }"
                  ></div>
                  <div class="absolute top-0 h-full w-0.5 bg-white/60" style="left: 3%"></div>
                  <div class="absolute top-0 h-full w-0.5 bg-white/60" style="left: 15%"></div>
                  <div class="absolute top-0 h-full w-0.5 bg-white/80" style="left: 50%"></div>
                  <div class="absolute top-0 h-full w-0.5 bg-white/60" style="left: 85%"></div>
                  <div class="absolute top-0 h-full w-0.5 bg-white/60" style="left: 97%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400">
                  <span>P3</span>
                  <span>P15</span>
                  <span>P50</span>
                  <span>P85</span>
                  <span>P97</span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                  <span class="font-medium">含义：</span>
                  在同年龄同性别儿童中，约有 
                  <span class="font-medium" :style="{ color: growthStatus?.color }">
                    {{ detail.percentile.toFixed(1) }}%
                  </span> 
                  的宝宝生长指标低于此数值
                </div>
              </div>
              
              <div 
                v-if="detail.growthRate !== 0"
                class="flex items-center gap-3 p-3 rounded-xl"
                :class="detail.growthRate > 0 ? 'bg-emerald-50' : 'bg-red-50'"
              >
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="detail.growthRate > 0 ? 'bg-emerald-100' : 'bg-red-100'"
                >
                  <TrendingUp 
                    class="w-5 h-5" 
                    :class="detail.growthRate > 0 ? 'text-emerald-500' : 'text-red-500 rotate-180'"
                  />
                </div>
                <div>
                  <div class="text-xs text-gray-500">生长速度</div>
                  <div 
                    class="text-sm font-medium"
                    :class="detail.growthRate > 0 ? 'text-emerald-600' : 'text-red-600'"
                  >
                    {{ detail.growthRate > 0 ? '+' : '' }}{{ detail.growthRate.toFixed(1) }} {{ detail.growthRateUnit }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p class="text-xs text-amber-700 leading-relaxed">
                <strong>温馨提示：</strong>百分位是评估宝宝生长发育的重要参考指标。
                15%-85%之间都属于正常范围。生长速度受多种因素影响，
                如发现持续异常请及时咨询医生。
              </p>
            </div>

            <div class="mt-5 flex gap-3">
              <button
                type="button"
                @click="handleEdit"
                class="flex-1 py-3.5 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 class="w-5 h-5" />
                编辑记录
              </button>
              <button
                type="button"
                @click="handleDeleteClick"
                class="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 class="w-5 h-5" />
                删除记录
              </button>
            </div>
          </div>
        </div>

        <Transition name="fade">
          <div
            v-if="confirmDeleteVisible"
            class="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
          >
            <div class="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle class="w-6 h-6 text-red-500" />
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-gray-800 mb-1">确认删除</h4>
                  <p class="text-sm text-gray-500 mb-4">
                    删除后此测量记录将永久清除，无法恢复。确定要删除吗？
                  </p>
                  <div class="flex gap-3">
                    <button
                      class="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      @click="handleCancelDelete"
                    >
                      取消
                    </button>
                    <button
                      class="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                      @click="handleConfirmDelete"
                    >
                      确认删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .relative,
  .modal-leave-to .relative {
    transform: translateY(0) scale(0.95);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
