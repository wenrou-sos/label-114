<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { X, Plus, Edit2, Trash2, User, Check, AlertTriangle } from 'lucide-vue-next'
import { useMultipleBabies } from '../composables/useMultipleBabies'
import BabyFormModal from './BabyFormModal.vue'
import type { Baby, BabyInfo } from '../types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

defineOptions({
  inheritAttrs: false
})

const { babies, currentBabyId, switchBaby, addBaby, updateBaby, deleteBaby } = useMultipleBabies()

const formModalVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingBaby = ref<Baby | null>(null)

const confirmDeleteId = ref<string | null>(null)
const isDeleting = ref(false)

const canDelete = computed(() => babies.value.length > 1)

const handleAdd = () => {
  formMode.value = 'add'
  editingBaby.value = null
  formModalVisible.value = true
}

const handleEdit = (baby: Baby) => {
  formMode.value = 'edit'
  editingBaby.value = baby
  formModalVisible.value = true
}

const handleSwitch = (baby: Baby) => {
  if (baby.id !== currentBabyId.value) {
    switchBaby(baby.id)
  }
}

const handleDeleteClick = (baby: Baby) => {
  if (!canDelete.value) return
  confirmDeleteId.value = baby.id
}

const handleCancelDelete = () => {
  confirmDeleteId.value = null
}

const handleConfirmDelete = async () => {
  if (!confirmDeleteId.value || !canDelete.value) return
  
  isDeleting.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  
  deleteBaby(confirmDeleteId.value)
  confirmDeleteId.value = null
  isDeleting.value = false
}

const handleFormSubmit = (data: Omit<BabyInfo, 'avatar'>) => {
  if (formMode.value === 'add') {
    addBaby(data)
  } else if (formMode.value === 'edit' && editingBaby.value) {
    updateBaby(editingBaby.value.id, data)
  }
  formModalVisible.value = false
}

const handleClose = () => {
  if (!formModalVisible.value && !confirmDeleteId.value) {
    emit('close')
  }
}

const handleMaskClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget && !confirmDeleteId.value) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    if (confirmDeleteId.value) {
      handleCancelDelete()
    } else if (!formModalVisible.value) {
      handleClose()
    }
  }
}

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

const calculateAge = (birthDate: string): string => {
  const birth = parseLocalDate(birthDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + 
               (now.getMonth() - birth.getMonth())
  let days = now.getDate() - birth.getDate()
  
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  
  if (months >= 12) {
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    if (remainMonths === 0) {
      return `${years}岁`
    }
    return `${years}岁${remainMonths}月`
  }
  return `${months}月${days}天`
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
          class="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          :class="{ 'animate-slide-up': visible }"
        >
          <div class="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
            <h3 class="text-lg font-bold text-gray-800">管理宝宝</h3>
            <button
              class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-3">
              <button
                v-for="baby in babies"
                :key="baby.id"
                class="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                :class="{ 'ring-2 ring-pink-400 bg-pink-50': baby.id === currentBabyId }"
                @click="handleSwitch(baby)"
              >
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center overflow-hidden">
                      <img 
                        v-if="baby.info.avatar" 
                        :src="baby.info.avatar" 
                        :alt="baby.info.name"
                        class="w-full h-full object-cover"
                      />
                      <User v-else class="w-7 h-7 text-white" />
                    </div>
                    <div 
                      v-if="baby.id === currentBabyId"
                      class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      <Check class="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div class="flex-1 text-left min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-gray-800">{{ baby.info.name }}</span>
                      <span 
                        class="px-2 py-0.5 text-xs rounded-full"
                        :class="[
                          baby.info.gender === 'boy' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-pink-100 text-pink-600'
                        ]"
                      >
                        {{ baby.info.gender === 'boy' ? '男宝' : '女宝' }}
                      </span>
                      <span 
                        v-if="baby.id === currentBabyId"
                        class="text-xs text-pink-500 font-medium"
                      >
                        当前
                      </span>
                    </div>
                    <div class="text-sm text-gray-500 mt-0.5">
                      {{ calculateAge(baby.info.birthDate) }} · {{ baby.info.birthDate }}
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5">
                      {{ baby.measurements.length }} 条测量记录 · {{ baby.specialPeriods.length }} 个特殊时期
                    </div>
                  </div>

                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      @click.stop="handleEdit(baby)"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button
                      class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      :class="{ 'opacity-30 cursor-not-allowed': !canDelete }"
                      :disabled="!canDelete"
                      @click.stop="handleDeleteClick(baby)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </button>
            </div>

            <p 
              v-if="!canDelete" 
              class="mt-4 text-xs text-gray-400 text-center"
            >
              至少需要保留一个宝宝档案
            </p>
          </div>

          <div class="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
            <button
              class="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-all flex items-center justify-center gap-2"
              @click="handleAdd"
            >
              <Plus class="w-5 h-5" />
              添加宝宝
            </button>
          </div>
        </div>

        <Transition name="fade">
          <div
            v-if="confirmDeleteId"
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
                    删除后，该宝宝的所有测量记录和数据将永久清除，无法恢复。确定要删除吗？
                  </p>
                  <div class="flex gap-3">
                    <button
                      class="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      :disabled="isDeleting"
                      @click="handleCancelDelete"
                    >
                      取消
                    </button>
                    <button
                      class="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                      :class="{ 'opacity-70': isDeleting }"
                      :disabled="isDeleting"
                      @click="handleConfirmDelete"
                    >
                      {{ isDeleting ? '删除中...' : '删除' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <BabyFormModal
      :visible="formModalVisible"
      :mode="formMode"
      :baby="editingBaby"
      @close="formModalVisible = false"
      @submit="handleFormSubmit"
    />
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
.modal-enter-from > div:nth-child(2),
.modal-leave-to > div:nth-child(2) {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .modal-enter-from > div:nth-child(2),
  .modal-leave-to > div:nth-child(2) {
    transform: translateY(20px) scale(0.95);
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
