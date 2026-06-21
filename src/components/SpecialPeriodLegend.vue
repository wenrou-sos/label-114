<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star, Baby, Thermometer, ChevronRight, Plus, X, Check, Trash2 } from 'lucide-vue-next'
import type { AgeRange, SpecialPeriod, SpecialPeriodType } from '../types'
import { useBabyData } from '../composables/useBabyData'
import { useMultipleBabies } from '../composables/useMultipleBabies'

interface Props {
  ageRange?: AgeRange
  compareMode?: boolean
  compareBabyId?: string
}

const props = withDefaults(defineProps<Props>(), {
  ageRange: undefined,
  compareMode: false,
  compareBabyId: ''
})
const emit = defineEmits<{
  (e: 'periodClick', period: SpecialPeriod): void
}>()

const { specialPeriods, addSpecialPeriod, deleteSpecialPeriod, maxAgeMonths, babyInfo, currentBabyId } = useBabyData()
const { getBabyInfoById } = useMultipleBabies()

const addModalVisible = ref(false)

const formData = ref({
  type: 'growthSpurt' as SpecialPeriodType,
  ageMonths: 0,
  label: '',
  description: ''
})

const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const maxAllowedAgeMonths = computed(() => {
  return Math.max(maxAgeMonths.value, 0.5)
})

const compareBabyInfo = computed(() => {
  if (!props.compareMode || !props.compareBabyId) return null
  return getBabyInfoById(props.compareBabyId)
})

const comparePercentiles = [
  { label: 'P50 (中位线)', color: '#FF8FA3', style: 'solid' }
]

const periodTypeOptions = [
  { value: 'growthSpurt' as const, label: '猛长期', color: '#FFB74D' },
  { value: 'teething' as const, label: '出牙期', color: '#81C784' },
  { value: 'illness' as const, label: '生病期', color: '#E57373' }
]

const handleAddPeriod = () => {
  formData.value = {
    type: 'growthSpurt',
    ageMonths: Math.min(Math.floor(maxAllowedAgeMonths.value), 12),
    label: '',
    description: ''
  }
  formErrors.value = {}
  addModalVisible.value = true
}

const validateForm = (): boolean => {
  formErrors.value = {}
  
  if (formData.value.ageMonths < 0 || formData.value.ageMonths > 60) {
    formErrors.value.ageMonths = '月龄应在0-60之间'
  }
  
  if (!formData.value.label.trim()) {
    formErrors.value.label = '请输入时期标签'
  } else if (formData.value.label.length > 20) {
    formErrors.value.label = '标签不能超过20个字符'
  }
  
  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  const result = addSpecialPeriod({
    type: formData.value.type,
    ageMonths: formData.value.ageMonths,
    label: formData.value.label.trim(),
    description: formData.value.description.trim()
  })
  
  await new Promise(resolve => setTimeout(resolve, 200))
  
  isSubmitting.value = false
  
  if (result.success) {
    addModalVisible.value = false
  } else {
    formErrors.value.general = result.message || '添加失败'
  }
}

const handleDeletePeriod = (periodId: string) => {
  deleteSpecialPeriod(periodId)
}

const handleCloseModal = () => {
  if (!isSubmitting.value) {
    addModalVisible.value = false
  }
}

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

    <div v-if="compareMode && compareBabyInfo" class="space-y-4">
      <div>
        <h4 class="text-sm font-medium text-gray-600 mb-2">生长曲线</h4>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="p in comparePercentiles"
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
        <h4 class="text-sm font-medium text-gray-600 mb-2">宝宝对比</h4>
        <div class="space-y-2">
          <div class="flex items-center gap-3 p-2.5 rounded-xl" style="background-color: rgba(255,107,107,0.08)">
            <div class="w-6 h-1 rounded-full" style="background-color: #FF6B6B"></div>
            <span class="text-sm font-medium text-gray-700">{{ babyInfo.name }}（当前）</span>
            <span class="text-xs text-gray-400 ml-auto">实线 · 圆点</span>
          </div>
          <div class="flex items-center gap-3 p-2.5 rounded-xl" style="background-color: rgba(74,144,217,0.08)">
            <div class="w-6 h-0.5 border-t-2 border-dashed" style="border-color: #4A90D9"></div>
            <span class="text-sm font-medium text-gray-700">{{ compareBabyInfo.name }}</span>
            <span class="text-xs text-gray-400 ml-auto">虚线 · 菱形</span>
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-400 leading-relaxed">
          对比模式下仅显示 P50 中位线作为参照；点击蓝色对比点暂不支持详情/编辑。
        </p>
      </div>
    </div>

    <template v-else>
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
        <button
          @click="handleAddPeriod"
          class="mt-3 w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs text-gray-600 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          补充特殊时期
        </button>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-600">特殊时期记录</h4>
          <span class="text-[10px] text-gray-400">点击查看详情，悬停可删除</span>
        </div>
        <div v-if="visiblePeriods.length > 0" class="space-y-2">
          <div
            v-for="(sp, idx) in visiblePeriods"
            :key="sp.id"
            class="relative group"
          >
            <button
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
              <button
                @click.stop="handleDeletePeriod(sp.id)"
                class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-xs text-gray-400 mb-2">当前月龄范围内暂无特殊时期记录</p>
          <button
            @click="handleAddPeriod"
            class="text-xs text-pink-500 hover:text-pink-600 font-medium"
          >
            点击补充
          </button>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="addModalVisible"
          class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          @click.self="handleCloseModal"
        >
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          <div 
            class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div class="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 class="text-lg font-bold text-gray-800">补充特殊时期</h3>
              <button
                class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                :disabled="isSubmitting"
                @click="handleCloseModal"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="p-5 pb-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <p v-if="formErrors.general" class="text-sm text-red-500 mb-3">{{ formErrors.general }}</p>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">时期类型</label>
                <div class="flex gap-2">
                  <button
                    v-for="opt in periodTypeOptions"
                    :key="opt.value"
                    type="button"
                    class="flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200"
                    :class="[
                      formData.type === opt.value
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                    :style="{
                      backgroundColor: formData.type === opt.value ? opt.color : undefined,
                      boxShadow: formData.type === opt.value ? `0 4px 12px ${opt.color}40` : undefined
                    }"
                    :disabled="isSubmitting"
                    @click="formData.type = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">发生月龄</label>
                <input
                  v-model.number="formData.ageMonths"
                  type="number"
                  min="0"
                  :max="maxAllowedAgeMonths"
                  step="0.1"
                  placeholder="例如：3.5"
                  class="w-full px-4 py-3 text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 transition-all"
                  :class="{ 'border-red-300 bg-red-50 focus:border-red-300': formErrors.ageMonths }"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.ageMonths" class="mt-1.5 text-xs text-red-500">{{ formErrors.ageMonths }}</p>
                <p class="mt-1 text-xs text-gray-400">当前宝宝最大月龄：{{ maxAllowedAgeMonths.toFixed(1) }}月，建议填写不超过此值</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">时期标签</label>
                <input
                  v-model="formData.label"
                  type="text"
                  placeholder="例如：第一次发烧"
                  maxlength="20"
                  class="w-full px-4 py-3 text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 transition-all"
                  :class="{ 'border-red-300 bg-red-50 focus:border-red-300': formErrors.label }"
                  :disabled="isSubmitting"
                />
                <p v-if="formErrors.label" class="mt-1.5 text-xs text-red-500">{{ formErrors.label }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">详细描述（可选）</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  placeholder="描述这个时期宝宝的表现和特点..."
                  maxlength="200"
                  class="w-full px-4 py-3 text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 transition-all resize-none"
                  :disabled="isSubmitting"
                />
              </div>
            </div>

            <div class="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
              <div class="flex gap-3">
                <button
                  class="flex-1 py-3.5 px-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  :disabled="isSubmitting"
                  @click="handleCloseModal"
                >
                  取消
                </button>
                <button
                  class="flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-all flex items-center justify-center gap-2"
                  :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }"
                  :disabled="isSubmitting"
                  @click="handleSubmit"
                >
                  <Check class="w-5 h-5" />
                  {{ isSubmitting ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .modal-enter-from > div:last-child,
  .modal-leave-to > div:last-child {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
