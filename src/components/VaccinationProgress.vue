<script setup lang="ts">
import { computed } from 'vue'
import { Syringe, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-vue-next'
import { useVaccination } from '../composables/useVaccination'

const emit = defineEmits<{
  (e: 'openList'): void
}>()

const { progress, nextDue } = useVaccination()

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
  done: { label: '已完成', bg: 'bg-green-100', text: 'text-green-600' },
  due: { label: '待接种', bg: 'bg-orange-100', text: 'text-orange-600' },
  overdue: { label: '已逾期', bg: 'bg-red-100', text: 'text-red-600' },
  upcoming: { label: '即将到来', bg: 'bg-gray-100', text: 'text-gray-500' }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
          <Syringe class="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">疫苗接种</h3>
          <p class="text-xs text-gray-400">国家免疫规划</p>
        </div>
      </div>
      <button
        @click="emit('openList')"
        class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-500 text-xs font-medium hover:bg-pink-100 transition-colors"
      >
        查看全部
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold text-gray-800">{{ progress.done }}</span>
          <span class="text-sm text-gray-400">/ {{ progress.total }} 剂</span>
        </div>
        <span class="text-sm font-semibold text-pink-500">{{ progress.percentage }}%</span>
      </div>
      <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
          :style="{ width: `${progress.percentage}%` }"
        />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="p-2.5 rounded-xl bg-green-50 text-center">
        <div class="w-5 h-5 mx-auto mb-1 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 class="w-3 h-3 text-green-600" />
        </div>
        <div class="text-lg font-bold text-green-600">{{ progress.done }}</div>
        <div class="text-[10px] text-green-500">已完成</div>
      </div>
      <div class="p-2.5 rounded-xl bg-orange-50 text-center">
        <div class="w-5 h-5 mx-auto mb-1 rounded-full bg-orange-100 flex items-center justify-center">
          <Clock class="w-3 h-3 text-orange-600" />
        </div>
        <div class="text-lg font-bold text-orange-600">{{ progress.due }}</div>
        <div class="text-[10px] text-orange-500">待接种</div>
      </div>
      <div class="p-2.5 rounded-xl bg-red-50 text-center">
        <div class="w-5 h-5 mx-auto mb-1 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle class="w-3 h-3 text-red-600" />
        </div>
        <div class="text-lg font-bold text-red-600">{{ progress.overdue }}</div>
        <div class="text-[10px] text-red-500">已逾期</div>
      </div>
    </div>

    <div v-if="nextDue && (nextDue.status === 'due' || nextDue.status === 'overdue')">
      <div
        class="p-3 rounded-xl flex items-center gap-3"
        :class="nextDue.status === 'overdue' ? 'bg-red-50' : 'bg-orange-50'"
      >
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="nextDue.status === 'overdue' ? 'bg-red-100' : 'bg-orange-100'"
        >
          <component
            :is="nextDue.status === 'overdue' ? AlertCircle : Clock"
            class="w-4.5 h-4.5"
            :class="nextDue.status === 'overdue' ? 'text-red-600' : 'text-orange-600'"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-800">下一针：{{ nextDue.schedule.vaccineName }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              :class="[statusConfig[nextDue.status].bg, statusConfig[nextDue.status].text]"
            >
              {{ statusConfig[nextDue.status].label }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            建议月龄：{{ formatAge(nextDue.schedule.ageMonths) }} · 第 {{ nextDue.schedule.dose }}/{{ nextDue.schedule.totalDoses }} 剂
          </p>
        </div>
        <button
          @click="emit('openList')"
          class="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex-shrink-0 transition-colors"
          :class="nextDue.status === 'overdue' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'"
        >
          标记
        </button>
      </div>
    </div>

    <div v-else-if="nextDue && nextDue.status === 'upcoming'" class="p-3 rounded-xl bg-gray-50 flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Clock class="w-4.5 h-4.5 text-gray-500" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-700">下一针：{{ nextDue.schedule.vaccineName }}</div>
        <p class="text-xs text-gray-400 mt-0.5">
          建议月龄：{{ formatAge(nextDue.schedule.ageMonths) }} · 第 {{ nextDue.schedule.dose }}/{{ nextDue.schedule.totalDoses }} 剂
        </p>
      </div>
    </div>
  </div>
</template>
