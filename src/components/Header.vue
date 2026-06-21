<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, User } from 'lucide-vue-next'
import { useBabyData } from '../composables/useBabyData'
import BabySelector from './BabySelector.vue'

const emit = defineEmits<{
  manage: []
}>()

const { babyInfo } = useBabyData()

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const calculateAge = computed(() => {
  const birth = parseLocalDate(babyInfo.value.birthDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  birth.setHours(0, 0, 0, 0)
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + 
               (now.getMonth() - birth.getMonth())
  let days = now.getDate() - birth.getDate()
  
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  
  return `${months}月${days}天`
})

const genderText = computed(() => babyInfo.value.gender === 'boy' ? '男宝宝' : '女宝宝')

const handleManage = () => {
  emit('manage')
}
</script>

<template>
  <div class="bg-gradient-to-r from-pink-100 via-rose-50 to-orange-50 rounded-2xl p-4 shadow-sm mb-4">
    <div class="flex items-center gap-4">
      <div class="relative">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-md overflow-hidden">
          <img 
            v-if="babyInfo.avatar" 
            :src="babyInfo.avatar" 
            :alt="babyInfo.name"
            class="w-full h-full object-cover"
          />
          <User v-else class="w-8 h-8 text-white" />
        </div>
        <div class="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-0.5 text-xs font-medium text-pink-500 shadow-sm">
          {{ genderText }}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold text-gray-800 mb-1 truncate">{{ babyInfo.name }}</h1>
          <BabySelector @manage="handleManage" />
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Calendar class="w-4 h-4 flex-shrink-0" />
          <span>{{ calculateAge }}</span>
        </div>
        <div class="text-xs text-gray-400 mt-1">
          出生日期: {{ babyInfo.birthDate }}
        </div>
      </div>
    </div>
  </div>
</template>
