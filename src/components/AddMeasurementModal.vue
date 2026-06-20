<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Calendar, Scale, Ruler, Headphones, Check, AlertCircle } from 'lucide-vue-next'
import { useBabyData } from '../composables/useBabyData'

defineOptions({
  inheritAttrs: false
})

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { babyInfo, validateDate, calculateAgeMonths, addMeasurement } = useBabyData()

const formData = ref({
  date: '',
  weight: '' as string | number,
  height: '' as string | number,
  headCircumference: '' as string | number
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const showSuccess = ref(false)

const getDefaultDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const minDate = computed(() => babyInfo.birthDate)

const computedAgeMonths = computed(() => {
  if (!formData.value.date) return null
  const validation = validateDate(formData.value.date)
  if (!validation.valid) return null
  return calculateAgeMonths(formData.value.date)
})

watch(() => props.visible, (val) => {
  if (val) {
    formData.value = {
      date: getDefaultDate(),
      weight: '',
      height: '',
      headCircumference: ''
    }
    errors.value = {}
    showSuccess.value = false
  }
})

const validateField = (field: string): boolean => {
  errors.value = { ...errors.value }
  
  if (field === 'date') {
    const validation = validateDate(formData.value.date)
    if (!validation.valid) {
      errors.value.date = validation.message || '日期无效'
      return false
    }
    delete errors.value.date
  }
  
  if (field === 'weight') {
    if (formData.value.weight === '' || formData.value.weight === undefined || formData.value.weight === null) {
      errors.value.weight = '请填写体重（必填）'
      return false
    }
    const w = Number(formData.value.weight)
    if (isNaN(w) || w <= 0 || w > 50) {
      errors.value.weight = '体重应在0-50kg之间'
      return false
    }
    delete errors.value.weight
  }
  
  if (field === 'height' && formData.value.height !== '' && formData.value.height !== undefined && formData.value.height !== null) {
    const h = Number(formData.value.height)
    if (isNaN(h) || h <= 0 || h > 200) {
      errors.value.height = '身高应在0-200cm之间'
      return false
    }
    delete errors.value.height
  }
  
  if (field === 'headCircumference' && formData.value.headCircumference !== '' && formData.value.headCircumference !== undefined && formData.value.headCircumference !== null) {
    const hc = Number(formData.value.headCircumference)
    if (isNaN(hc) || hc <= 0 || hc > 100) {
      errors.value.headCircumference = '头围应在0-100cm之间'
      return false
    }
    delete errors.value.headCircumference
  }
  
  return true
}

const validateAll = (): boolean => {
  const dateOk = validateField('date')
  const weightOk = validateField('weight')
  const heightOk = formData.value.height !== '' ? validateField('height') : true
  const headOk = formData.value.headCircumference !== '' ? validateField('headCircumference') : true
  return dateOk && weightOk && heightOk && headOk
}

const handleSubmit = async () => {
  if (!validateAll()) return
  
  submitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = addMeasurement({
    date: formData.value.date,
    weight: formData.value.weight !== '' ? Number(formData.value.weight) : undefined,
    height: formData.value.height !== '' ? Number(formData.value.height) : undefined,
    headCircumference: formData.value.headCircumference !== '' ? Number(formData.value.headCircumference) : undefined
  })
  
  submitting.value = false
  
  if (result.success) {
    showSuccess.value = true
    setTimeout(() => {
      emit('success')
      emit('close')
    }, 800)
  } else {
    errors.value.submit = result.message || '添加失败，请重试'
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
        
        <div class="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-hidden shadow-2xl transform transition-all">
          <div class="sticky top-0 bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-bold text-white">添加测量记录</h3>
            <button
              v-if="!showSuccess"
              @click="emit('close')"
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div v-if="showSuccess" class="p-8 flex flex-col items-center justify-center">
            <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
              <Check class="w-10 h-10 text-green-500" />
            </div>
            <h4 class="text-lg font-bold text-gray-800">添加成功！</h4>
            <p class="text-sm text-gray-500 mt-2">图表已自动更新</p>
          </div>
          
          <div v-else class="p-6 overflow-y-auto">
            <div 
              v-if="computedAgeMonths !== null"
              class="mb-5 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100"
            >
              <div class="text-xs text-gray-500 mb-1">根据出生日期自动计算月龄</div>
              <div class="text-lg font-bold text-pink-500">
                {{ computedAgeMonths.toFixed(1) }} 个月
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar class="w-4 h-4 text-pink-400" />
                  测量日期 <span class="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  v-model="formData.date"
                  :min="minDate"
                  :max="maxDate"
                  @blur="validateField('date')"
                  class="w-full px-4 py-3 rounded-xl border text-gray-800 outline-none transition-colors appearance-none"
                  :class="errors.date 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                />
                <p v-if="errors.date" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.date }}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  可选范围：{{ minDate }} 至 {{ maxDate }}
                </p>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Scale class="w-4 h-4 text-pink-400" />
                  体重 (kg) <span class="text-red-400">*</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    v-model="formData.weight"
                    placeholder="例如：13.50"
                    @input="validateField('weight')"
                    @blur="validateField('weight')"
                    class="w-full px-4 py-3 pr-14 rounded-xl border text-gray-800 outline-none transition-colors"
                    :class="errors.weight 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">kg</span>
                </div>
                <p v-if="errors.weight" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.weight }}
                </p>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Ruler class="w-4 h-4 text-pink-400" />
                  身高 (cm) <span class="text-gray-400 text-xs">选填</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="200"
                    v-model="formData.height"
                    placeholder="例如：88.0"
                    @input="validateField('height')"
                    @blur="validateField('height')"
                    class="w-full px-4 py-3 pr-14 rounded-xl border text-gray-800 outline-none transition-colors"
                    :class="errors.height 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
                </div>
                <p v-if="errors.height" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.height }}
                </p>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Headphones class="w-4 h-4 text-pink-400" />
                  头围 (cm) <span class="text-gray-400 text-xs">选填</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    v-model="formData.headCircumference"
                    placeholder="例如：49.0"
                    @input="validateField('headCircumference')"
                    @blur="validateField('headCircumference')"
                    class="w-full px-4 py-3 pr-14 rounded-xl border text-gray-800 outline-none transition-colors"
                    :class="errors.headCircumference 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
                </div>
                <p v-if="errors.headCircumference" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.headCircumference }}
                </p>
              </div>
            </div>

            <p v-if="errors.submit" class="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
              {{ errors.submit }}
            </p>

            <div class="mt-6 flex gap-3">
              <button
                type="button"
                @click="emit('close')"
                class="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                @click="handleSubmit"
                :disabled="submitting"
                class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-medium shadow-lg shadow-pink-200 transition-all hover:shadow-pink-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="submitting">添加中...</span>
                <span v-else>确定添加</span>
              </button>
            </div>

            <div class="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 leading-relaxed">
                <strong class="text-gray-700">温馨提示：</strong>
                月龄会根据宝宝出生日期（{{ babyInfo.birthDate }}）和测量日期自动计算。
                建议每月测量一次并记录，便于观察生长趋势。
              </p>
            </div>
          </div>
        </div>
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

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0.6;
  cursor: pointer;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
