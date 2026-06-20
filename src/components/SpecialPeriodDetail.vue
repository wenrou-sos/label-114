<script setup lang="ts">
import { X, Star, Baby, Thermometer, Clock, AlertCircle } from 'lucide-vue-next'
import type { SpecialPeriod, SpecialPeriodType } from '../types'

defineOptions({
  inheritAttrs: false
})

interface Props {
  visible: boolean
  period: SpecialPeriod | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const periodConfig: Record<SpecialPeriodType, { 
  label: string
  color: string
  icon: typeof Star
  bgColor: string
  tips: string[]
}> = {
  growthSpurt: {
    label: '猛长期',
    color: '#FFB74D',
    icon: Star,
    bgColor: '#FFF8E1',
    tips: [
      '宝宝食量明显增加，喂奶次数变多',
      '睡眠模式可能改变，夜醒次数增加',
      '情绪可能烦躁不安，更容易哭闹',
      '体重增长速度明显加快',
      '这是正常生理现象，按需喂养即可'
    ]
  },
  teething: {
    label: '出牙期',
    color: '#81C784',
    icon: Baby,
    bgColor: '#E8F5E9',
    tips: [
      '牙龈肿胀、发红，宝宝喜欢咬东西',
      '可能出现流口水增多的情况',
      '可能伴有轻微体温升高（不超过38℃）',
      '食欲可能受到一定影响',
      '可以使用牙胶缓解不适，注意口腔清洁'
    ]
  },
  illness: {
    label: '生病期',
    color: '#E57373',
    icon: Thermometer,
    bgColor: '#FFEBEE',
    tips: [
      '生病期间食欲下降，体重增长可能放缓',
      '疾病恢复后会出现追赶性生长',
      '注意观察宝宝精神状态和尿量',
      '持续高热或症状加重请及时就医',
      '病愈后注意营养补充，帮助恢复'
    ]
  }
}

const formatAge = (ageMonths: number): string => {
  if (ageMonths < 1) {
    const weeks = Math.round(ageMonths * 4.33)
    return `${weeks}周`
  }
  if (Number.isInteger(ageMonths)) {
    return `${ageMonths}个月`
  }
  return `${ageMonths.toFixed(1)}个月`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible && period"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>
        
        <div class="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-hidden shadow-2xl transform transition-all">
          <div 
            class="sticky top-0 px-6 py-4 flex items-center justify-between"
            :style="{ backgroundColor: periodConfig[period.type].color }"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <component 
                  :is="periodConfig[period.type].icon" 
                  class="w-5 h-5 text-white"
                />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ period.label }}</h3>
                <p class="text-xs text-white/80">{{ formatAge(period.ageMonths) }}</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto">
            <div 
              class="rounded-2xl p-4 mb-6"
              :style="{ backgroundColor: periodConfig[period.type].bgColor }"
            >
              <div class="flex items-start gap-3">
                <AlertCircle 
                  class="w-5 h-5 flex-shrink-0 mt-0.5" 
                  :style="{ color: periodConfig[period.type].color }"
                />
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 mb-1">时期说明</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    {{ period.description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center gap-2 mb-3">
                <Clock class="w-4 h-4 text-gray-400" />
                <span class="text-sm font-medium text-gray-700">出现时间</span>
              </div>
              <div class="flex items-center gap-3">
                <div 
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :style="{ backgroundColor: periodConfig[period.type].bgColor }"
                >
                  <span 
                    class="text-lg font-bold"
                    :style="{ color: periodConfig[period.type].color }"
                  >
                    {{ Math.floor(period.ageMonths) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">月龄</p>
                  <p class="text-xs text-gray-500">{{ formatAge(period.ageMonths) }}左右</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">表现特征与护理建议</h4>
              <ul class="space-y-2">
                <li 
                  v-for="(tip, idx) in periodConfig[period.type].tips" 
                  :key="idx"
                  class="flex items-start gap-2"
                >
                  <span 
                    class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white mt-0.5"
                    :style="{ backgroundColor: periodConfig[period.type].color }"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span class="text-sm text-gray-600 leading-relaxed">{{ tip }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 leading-relaxed">
                <strong class="text-gray-700">温馨提示：</strong>
                每个宝宝的发育节奏都有个体差异，以上为普遍参考。
                如对宝宝的生长发育有任何疑虑，
                请咨询专业儿科医生。
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
