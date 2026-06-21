<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Settings, User } from 'lucide-vue-next'
import { useMultipleBabies } from '../composables/useMultipleBabies'
import type { Baby } from '../types'

defineProps<{
  showManageButton?: boolean
}>()

const emit = defineEmits<{
  manage: []
  select: [baby: Baby]
}>()

const { babies, currentBabyId, switchBaby } = useMultipleBabies()

const dropdownOpen = ref(false)

const currentBaby = computed(() => {
  return babies.value.find(b => b.id === currentBabyId.value) || babies.value[0]
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleSelect = (baby: Baby) => {
  if (baby.id === currentBabyId.value) {
    dropdownOpen.value = false
    return
  }
  switchBaby(baby.id)
  emit('select', baby)
  dropdownOpen.value = false
}

const handleManage = () => {
  dropdownOpen.value = false
  emit('manage')
}

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.baby-selector-wrapper')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="baby-selector-wrapper relative">
    <button
      class="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm"
      @click.stop="toggleDropdown"
    >
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center overflow-hidden flex-shrink-0">
        <img 
          v-if="currentBaby?.info.avatar" 
          :src="currentBaby.info.avatar" 
          :alt="currentBaby.info.name"
          class="w-full h-full object-cover"
        />
        <User v-else class="w-5 h-5 text-white" />
      </div>
      <div class="text-left min-w-0">
        <div class="font-semibold text-gray-800 text-sm truncate max-w-[100px]">
          {{ currentBaby?.info.name }}
        </div>
        <div class="text-xs text-gray-500">
          {{ currentBaby?.info.gender === 'boy' ? '男宝' : '女宝' }}
        </div>
      </div>
      <ChevronDown 
        class="w-4 h-4 text-gray-500 transition-transform duration-200" 
        :class="{ 'rotate-180': dropdownOpen }"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="dropdownOpen"
        class="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
      >
        <div class="p-2">
          <button
            v-for="baby in babies"
            :key="baby.id"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
            :class="{ 
              'bg-pink-50 ring-1 ring-pink-200': baby.id === currentBabyId 
            }"
            @click="handleSelect(baby)"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                v-if="baby.info.avatar" 
                :src="baby.info.avatar" 
                :alt="baby.info.name"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1 text-left min-w-0">
              <div class="font-medium text-gray-800 text-sm truncate">
                {{ baby.info.name }}
                <span 
                  v-if="baby.id === currentBabyId" 
                  class="ml-2 text-pink-500 text-xs"
                >
                  · 当前
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ baby.info.gender === 'boy' ? '男宝' : '女宝' }} · {{ baby.info.birthDate }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ baby.measurements.length }} 条记录
              </div>
            </div>
          </button>
        </div>
        
        <div class="border-t border-gray-100">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
            @click="handleManage"
          >
            <Settings class="w-4 h-4" />
            <span class="text-sm font-medium">管理宝宝</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
