<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Calendar, Tag, MapPin, FileText, Check, AlertCircle, Syringe } from 'lucide-vue-next'
import type { VaccinationRecord } from '../types'
import { useVaccination } from '../composables/useVaccination'

interface Props {
  visible: boolean
  mode?: 'add' | 'edit'
  scheduleId?: string
  editRecord?: VaccinationRecord | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'add',
  scheduleId: '',
  editRecord: null
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const {
  scheduledList,
  markVaccinated,
  updateVaccination,
  validateVaccinationDate,
  getDefaultDate,
  getMinDate,
  getMaxDate
} = useVaccination()

const formData = ref({
  date: '',
  batchNumber: '',
  site: '',
  note: ''
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const showSuccess = ref(false)

const maxDate = computed(() => getMaxDate())
const minDate = computed(() => getMinDate())

const currentSchedule = computed(() => {
  if (props.mode === 'edit' && props.editRecord) {
    return scheduledList.value.find(s => s.record?.id === props.editRecord?.id)?.schedule
  }
  return scheduledList.value.find(s => s.schedule.id === props.scheduleId)?.schedule
})

const modalTitle = computed(() => {
  if (props.mode === 'edit') return '编辑接种记录'
  if (currentSchedule.value) return `标记 ${currentSchedule.value.vaccineName}`
  return '标记接种'
})

const submitButtonText = computed(() => {
  if (submitting.value) return props.mode === 'edit' ? '保存中...' : '标记中...'
  return props.mode === 'edit' ? '保存修改' : '确认标记'
})

const successText = computed(() => props.mode === 'edit' ? '更新成功！' : '标记成功！')

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'edit' && props.editRecord) {
      const r = props.editRecord
      formData.value = {
        date: r.date,
        batchNumber: r.batchNumber || '',
        site: r.site || '',
        note: r.note || ''
      }
    } else {
      formData.value = {
        date: getDefaultDate(),
        batchNumber: '',
        site: '',
        note: ''
      }
    }
    errors.value = {}
    showSuccess.value = false
  }
})

const validateField = (field: string): boolean => {
  errors.value = { ...errors.value }

  if (field === 'date') {
    const validation = validateVaccinationDate(formData.value.date)
    if (!validation.valid) {
      errors.value.date = validation.message || '日期无效'
      return false
    }
    delete errors.value.date
  }

  if (field === 'batchNumber' && formData.value.batchNumber) {
    if (formData.value.batchNumber.length > 50) {
      errors.value.batchNumber = '批号不能超过50个字符'
      return false
    }
    delete errors.value.batchNumber
  }

  if (field === 'site' && formData.value.site) {
    if (formData.value.site.length > 20) {
      errors.value.site = '接种部位不能超过20个字符'
      return false
    }
    delete errors.value.site
  }

  if (field === 'note' && formData.value.note) {
    if (formData.value.note.length > 200) {
      errors.value.note = '备注不能超过200个字符'
      return false
    }
    delete errors.value.note
  }

  return true
}

const validateAll = (): boolean => {
  const dateOk = validateField('date')
  const batchOk = formData.value.batchNumber ? validateField('batchNumber') : true
  const siteOk = formData.value.site ? validateField('site') : true
  const noteOk = formData.value.note ? validateField('note') : true
  return dateOk && batchOk && siteOk && noteOk
}

const handleSubmit = async () => {
  if (!validateAll()) return

  submitting.value = true

  await new Promise(resolve => setTimeout(resolve, 300))

  const payload = {
    date: formData.value.date,
    batchNumber: formData.value.batchNumber || undefined,
    site: formData.value.site || undefined,
    note: formData.value.note || undefined
  }

  let result
  if (props.mode === 'edit' && props.editRecord) {
    result = updateVaccination(props.editRecord.id, payload)
  } else {
    result = markVaccinated(props.scheduleId, payload)
  }

  submitting.value = false

  if (result.success) {
    showSuccess.value = true
    setTimeout(() => {
      emit('success')
      emit('close')
    }, 800)
  } else {
    errors.value.submit = result.message || '保存失败，请重试'
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
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Syringe class="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ modalTitle }}</h3>
                <p v-if="currentSchedule" class="text-xs text-white/70">
                  第 {{ currentSchedule.dose }}/{{ currentSchedule.totalDoses }} 剂
                </p>
              </div>
            </div>
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
            <h4 class="text-lg font-bold text-gray-800">{{ successText }}</h4>
            <p class="text-sm text-gray-500 mt-2">接种记录已更新</p>
          </div>

          <div v-else class="p-6 overflow-y-auto">
            <div class="space-y-5">
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar class="w-4 h-4 text-pink-400" />
                  接种日期 <span class="text-red-400">*</span>
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
                  <Tag class="w-4 h-4 text-pink-400" />
                  批号 <span class="text-gray-400 text-xs">选填</span>
                </label>
                <input
                  type="text"
                  v-model="formData.batchNumber"
                  placeholder="例如：20240101-1"
                  maxlength="50"
                  @blur="validateField('batchNumber')"
                  class="w-full px-4 py-3 rounded-xl border text-gray-800 outline-none transition-colors"
                  :class="errors.batchNumber
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                />
                <p v-if="errors.batchNumber" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.batchNumber }}
                </p>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin class="w-4 h-4 text-pink-400" />
                  接种部位 <span class="text-gray-400 text-xs">选填</span>
                </label>
                <input
                  type="text"
                  v-model="formData.site"
                  placeholder="例如：左上臂"
                  maxlength="20"
                  @blur="validateField('site')"
                  class="w-full px-4 py-3 rounded-xl border text-gray-800 outline-none transition-colors"
                  :class="errors.site
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                />
                <p v-if="errors.site" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.site }}
                </p>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText class="w-4 h-4 text-pink-400" />
                  备注 <span class="text-gray-400 text-xs">选填</span>
                </label>
                <textarea
                  v-model="formData.note"
                  rows="3"
                  placeholder="接种反应、注意事项等..."
                  maxlength="200"
                  @blur="validateField('note')"
                  class="w-full px-4 py-3 rounded-xl border text-gray-800 outline-none transition-colors resize-none"
                  :class="errors.note
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-gray-50 focus:border-pink-400 focus:bg-white'"
                />
                <p v-if="errors.note" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ errors.note }}
                </p>
                <p v-if="!errors.note" class="mt-1 text-xs text-gray-400 text-right">
                  {{ formData.note.length }}/200
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
                class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-medium shadow-lg shadow-pink-200 transition-all hover:shadow-pink-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check v-if="!submitting" class="w-4 h-4" />
                {{ submitButtonText }}
              </button>
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
</style>
