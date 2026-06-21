<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, Syringe, Trash2, Tag } from 'lucide-vue-next'
import { useVaccination, type ScheduledVaccination } from '../composables/useVaccination'
import type { VaccinationRecord } from '../types'

interface Props {
  visible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'mark', scheduleId: string): void
  (e: 'edit', record: VaccinationRecord): void
  (e: 'delete', recordId: string): void
}>()

const { scheduledList, deleteVaccination } = useVaccination()

const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const longPressId = ref<string | null>(null)

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

const statusConfig = {
  done: { label: '已接种', bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
  due: { label: '待接种', bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' },
  overdue: { label: '已逾期', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  upcoming: { label: '未到时间', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }
}

const groupedList = computed(() => {
  const groups: Record<string, ScheduledVaccination[]> = {}
  scheduledList.value.forEach(item => {
    const key = formatAge(item.schedule.ageMonths)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })
  return Object.entries(groups).map(([age, items]) => ({ age, items }))
})

const handleItemClick = (item: ScheduledVaccination) => {
  if (longPressId.value) {
    longPressId.value = null
    return
  }
  if (item.status === 'done' && item.record) {
    emit('edit', item.record)
  } else if (item.status === 'due' || item.status === 'overdue') {
    emit('mark', item.schedule.id)
  }
}

const handleTouchStart = (recordId: string) => {
  longPressTimer.value = setTimeout(() => {
    longPressId.value = recordId
  }, 500)
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleDelete = (recordId: string) => {
  deleteVaccination(recordId)
  emit('delete', recordId)
  longPressId.value = null
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
                <h3 class="text-lg font-bold text-white">接种计划</h3>
                <p class="text-xs text-white/70">国家免疫规划疫苗</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto pb-6">
            <div v-for="group in groupedList" :key="group.age" class="mb-5 last:mb-0">
              <div class="flex items-center gap-2 mb-2.5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-pink-400 to-rose-400"></div>
                <span class="text-sm font-bold text-gray-700">{{ group.age }}</span>
                <div class="flex-1 h-px bg-gray-100"></div>
              </div>

              <div class="space-y-2">
                <div
                  v-for="item in group.items"
                  :key="item.schedule.id"
                  class="relative group"
                  @click="handleItemClick(item)"
                  @touchstart="item.record && handleTouchStart(item.record.id)"
                  @touchend="handleTouchEnd"
                  @touchcancel="handleTouchEnd"
                >
                  <div
                    class="p-3.5 rounded-2xl border transition-all"
                    :class="[
                      item.status === 'done'
                        ? 'bg-green-50/50 border-green-100 hover:border-green-200 cursor-pointer'
                        : item.status === 'overdue'
                        ? 'bg-red-50/50 border-red-100 hover:border-red-200 cursor-pointer'
                        : item.status === 'due'
                        ? 'bg-orange-50/50 border-orange-100 hover:border-orange-200 cursor-pointer'
                        : 'bg-gray-50/50 border-gray-100'
                    ]"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        :class="[
                          item.status === 'done'
                            ? 'bg-green-100'
                            : item.status === 'overdue'
                            ? 'bg-red-100'
                            : item.status === 'due'
                            ? 'bg-orange-100'
                            : 'bg-gray-100'
                        ]"
                      >
                        <Syringe
                          class="w-4.5 h-4.5"
                          :class="[
                            item.status === 'done'
                              ? 'text-green-600'
                              : item.status === 'overdue'
                              ? 'text-red-600'
                              : item.status === 'due'
                              ? 'text-orange-600'
                              : 'text-gray-500'
                          ]"
                        />
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-sm font-semibold text-gray-800">{{ item.schedule.vaccineName }}</span>
                          <span
                            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1"
                            :class="[statusConfig[item.status].bg, statusConfig[item.status].text]"
                          >
                            <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[item.status].dot"></span>
                            {{ statusConfig[item.status].label }}
                          </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5">
                          第 {{ item.schedule.dose }}/{{ item.schedule.totalDoses }} 剂
                          <span v-if="item.schedule.description" class="text-gray-400"> · {{ item.schedule.description }}</span>
                        </p>

                        <div v-if="item.record" class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          <div class="flex items-center gap-1 text-[11px] text-gray-600">
                            <Tag class="w-3 h-3 text-gray-400" />
                            {{ item.record.date }}
                          </div>
                          <div v-if="item.record.batchNumber" class="flex items-center gap-1 text-[11px] text-gray-600">
                            <Tag class="w-3 h-3 text-gray-400" />
                            批号：{{ item.record.batchNumber }}
                          </div>
                          <div v-if="item.record.site" class="flex items-center gap-1 text-[11px] text-gray-600">
                            <Tag class="w-3 h-3 text-gray-400" />
                            部位：{{ item.record.site }}
                          </div>
                        </div>
                      </div>

                      <button
                        v-if="item.record && (longPressId === item.record.id)"
                        @click.stop="handleDelete(item.record!.id)"
                        class="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                      <button
                        v-else-if="item.record"
                        @click.stop="handleDelete(item.record!.id)"
                        class="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 leading-relaxed">
                <strong class="text-gray-700">操作提示：</strong>
                点击<span class="text-orange-500 font-medium">待接种</span>或<span class="text-red-500 font-medium">已逾期</span>条目可标记接种；
                点击<span class="text-green-500 font-medium">已接种</span>条目可编辑记录；
                长按或悬停已接种条目可删除。
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
</style>
