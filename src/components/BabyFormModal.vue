<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, User, Calendar, Baby as BabyIcon } from 'lucide-vue-next'
import type { BabyInfo, Baby } from '../types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  baby?: Baby | null
}>()

const emit = defineEmits<{
  close: []
  submit: [data: Omit<BabyInfo, 'avatar'>]
}>()

defineOptions({
  inheritAttrs: false
})

const formData = ref({
  name: '',
  gender: 'boy' as 'boy' | 'girl',
  birthDate: ''
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getTodayLocal = (): string => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return toLocalDateString(now)
}

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

const maxDate = computed(() => getTodayLocal())

const modalTitle = computed(() => 
  props.mode === 'add' ? '添加宝宝' : '编辑宝宝'
)

const submitButtonText = computed(() => 
  isSubmitting.value ? '保存中...' : (props.mode === 'add' ? '添加宝宝' : '保存修改')
)

watch(() => props.visible, (val) => {
  if (val && props.mode === 'edit' && props.baby) {
    formData.value = {
      name: props.baby.info.name,
      gender: props.baby.info.gender,
      birthDate: props.baby.info.birthDate
    }
  } else if (val && props.mode === 'add') {
    formData.value = {
      name: '',
      gender: 'boy',
      birthDate: getTodayLocal()
    }
  }
  errors.value = {}
})

const validate = (): boolean => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = '请输入宝宝姓名'
  } else if (formData.value.name.length > 20) {
    errors.value.name = '姓名不能超过20个字符'
  }
  
  if (!formData.value.birthDate) {
    errors.value.birthDate = '请选择出生日期'
  } else {
    const birthDate = parseLocalDate(formData.value.birthDate)
    const today = parseLocalDate(getTodayLocal())
    if (birthDate.getTime() > today.getTime()) {
      errors.value.birthDate = '出生日期不能是未来日期'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  
  isSubmitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  emit('submit', {
    name: formData.value.name.trim(),
    gender: formData.value.gender,
    birthDate: formData.value.birthDate
  })
  
  isSubmitting.value = false
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

const handleMaskClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        @click="handleMaskClick"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        <div 
          class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          :class="{ 'animate-slide-up': visible }"
        >
          <div class="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
            <h3 class="text-lg font-bold text-gray-800">{{ modalTitle }}</h3>
            <button
              class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 pb-8 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <User class="w-4 h-4 inline mr-1 -mt-0.5" />
                宝宝姓名
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="请输入宝宝姓名"
                class="w-full px-4 py-3 text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 transition-all"
                :class="{ 'border-red-300 bg-red-50 focus:border-red-300': errors.name }"
                :disabled="isSubmitting"
                maxlength="20"
              />
              <p v-if="errors.name" class="mt-1.5 text-sm text-red-500">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <BabyIcon class="w-4 h-4 inline mr-1 -mt-0.5" />
                性别
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  :class="[
                    formData.gender === 'boy'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                  :disabled="isSubmitting"
                  @click="formData.gender = 'boy'"
                >
                  男宝宝
                </button>
                <button
                  type="button"
                  class="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  :class="[
                    formData.gender === 'girl'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                  :disabled="isSubmitting"
                  @click="formData.gender = 'girl'"
                >
                  女宝宝
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <Calendar class="w-4 h-4 inline mr-1 -mt-0.5" />
                出生日期
              </label>
              <input
                v-model="formData.birthDate"
                type="date"
                class="w-full px-4 py-3 text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 transition-all appearance-none"
                :class="{ 'border-red-300 bg-red-50 focus:border-red-300': errors.birthDate }"
                :max="maxDate"
                :disabled="isSubmitting"
              />
              <p v-if="errors.birthDate" class="mt-1.5 text-sm text-red-500">{{ errors.birthDate }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
            <div class="flex gap-3">
              <button
                class="flex-1 py-3.5 px-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                :disabled="isSubmitting"
                @click="handleClose"
              >
                取消
              </button>
              <button
                class="flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-all"
                :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }"
                :disabled="isSubmitting"
                @click="handleSubmit"
              >
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

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@media (min-width: 640px) {
  @keyframes slideUp {
    from {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
</style>
