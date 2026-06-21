<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { GrowthIndicator, AgeRange, BabyMeasurement, SpecialPeriod, WHODataPoint, PercentileKey } from '../types'
import { getWHOData } from '../data/whoStandards'
import { useBabyData } from '../composables/useBabyData'
import { useMultipleBabies } from '../composables/useMultipleBabies'
import { Loader2, ChevronDown, Check, User } from 'lucide-vue-next'

interface Props {
  indicator: GrowthIndicator
  ageRange: AgeRange
  compareMode?: boolean
  compareBabyId?: string
}

const props = withDefaults(defineProps<Props>(), {
  compareMode: false,
  compareBabyId: ''
})
const emit = defineEmits<{
  (e: 'pointClick', measurement: BabyMeasurement, index: number): void
  (e: 'periodClick', period: SpecialPeriod): void
  (e: 'update:compareMode', value: boolean): void
  (e: 'update:compareBabyId', value: string): void
}>()

const { measurements, babyInfo, specialPeriods, currentBabyId } = useBabyData()
const { getBabyInfoById, getBabyMeasurementsById, babies } = useMultipleBabies()

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<ECharts | null>(null)
const isLoading = ref(false)

const CURRENT_BABY_COLOR = '#FF6B6B'
const COMPARE_BABY_COLOR = '#4A90D9'

const compareBabyInfo = computed(() => {
  if (!props.compareMode || !props.compareBabyId) return null
  return getBabyInfoById(props.compareBabyId)
})

const compareBabyMeasurements = computed((): BabyMeasurement[] => {
  if (!props.compareMode || !props.compareBabyId) return []
  const maxAge = props.ageRange === '0-24' ? 24 : 60
  return getBabyMeasurementsById(props.compareBabyId).filter(m => m.ageMonths <= maxAge)
})

const compareDropdownOpen = ref(false)

const otherBabies = computed(() => {
  return babies.value.filter(b => b.id !== currentBabyId.value)
})

const canCompare = computed(() => otherBabies.value.length > 0)

const handleToggleCompare = (val: boolean) => {
  if (val && !canCompare.value) return
  emit('update:compareMode', val)
  if (!val) {
    emit('update:compareBabyId', '')
  } else if (!props.compareBabyId && otherBabies.value.length > 0) {
    emit('update:compareBabyId', otherBabies.value[0].id)
  }
}

const handleSelectCompareBaby = (babyId: string) => {
  emit('update:compareBabyId', babyId)
  compareDropdownOpen.value = false
}

const toggleCompareDropdown = () => {
  compareDropdownOpen.value = !compareDropdownOpen.value
}

const closeCompareDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.compare-selector-wrapper')) {
    compareDropdownOpen.value = false
  }
}

const currentWHOData = computed((): WHODataPoint[] => {
  return getWHOData(babyInfo.value.gender, props.indicator, props.ageRange)
})

const filteredMeasurements = computed((): BabyMeasurement[] => {
  const maxAge = props.ageRange === '0-24' ? 24 : 60
  return measurements.value.filter(m => m.ageMonths <= maxAge)
})

const indicatorUnit = (): string => {
  switch (props.indicator) {
    case 'weight': return 'kg'
    case 'height': return 'cm'
    case 'headCircumference': return 'cm'
    default: return ''
  }
}

const percentileColors: Record<PercentileKey, string> = {
  P3: '#E0E0E0',
  P15: '#BDBDBD',
  P50: '#FF8FA3',
  P85: '#BDBDBD',
  P97: '#E0E0E0'
}

const generateChartOption = (): EChartsOption => {
  const whoData = currentWHOData.value
  const measurements = filteredMeasurements.value
  const maxAge = props.ageRange === '0-24' ? 24 : 60
  const isCompare = props.compareMode && compareBabyInfo.value !== null
  const currentName = babyInfo.value.name

  const percentileKeys: PercentileKey[] = isCompare ? ['P50'] : ['P3', 'P15', 'P50', 'P85', 'P97']

  const series: echarts.SeriesOption[] = percentileKeys.map(key => ({
    name: key,
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: {
      width: key === 'P50' ? 2 : 1,
      type: key === 'P50' ? 'solid' : 'dashed',
      color: percentileColors[key]
    },
    data: whoData.map(d => [d.age, d[key]]),
    emphasis: {
      disabled: true
    },
    z: 1
  }))

  // 当前宝宝曲线
  const indicatorMeasurements = measurements.filter(m => m[props.indicator] !== undefined)
  const babyData = indicatorMeasurements.map(m => [m.ageMonths, m[props.indicator]])

  if (babyData.length > 0) {
    series.push({
      name: currentName,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: CURRENT_BABY_COLOR
      },
      data: babyData,
      z: 3
    })

    series.push({
      name: `${currentName} · 数据`,
      type: 'scatter',
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: {
        color: CURRENT_BABY_COLOR,
        borderColor: '#fff',
        borderWidth: 2
      },
      data: indicatorMeasurements.map((m, i) => ({
        value: babyData[i],
        measurementId: m.id,
        babySource: 'current'
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(255, 107, 107, 0.5)'
        }
      },
      z: 5
    })
  }

  // 对比宝宝曲线
  if (isCompare && compareBabyInfo.value) {
    const compareName = compareBabyInfo.value.name
    const compareMeasurements = compareBabyMeasurements.value
    const compareFiltered = compareMeasurements.filter(m => m[props.indicator] !== undefined)
    const compareData = compareFiltered.map(m => [m.ageMonths, m[props.indicator]])

    if (compareData.length > 0) {
      series.push({
        name: compareName,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: COMPARE_BABY_COLOR,
          type: 'dashed'
        },
        data: compareData,
        z: 2
      })

      series.push({
        name: `${compareName} · 数据`,
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 11,
        itemStyle: {
          color: COMPARE_BABY_COLOR,
          borderColor: '#fff',
          borderWidth: 2
        },
        data: compareFiltered.map((m, i) => ({
          value: compareData[i],
          measurementId: m.id,
          babySource: 'compare'
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(74, 144, 217, 0.5)'
          }
        },
        z: 4
      })
    }
  }

  const filteredPeriods = specialPeriods.value.filter(sp => sp.ageMonths <= maxAge)
  const yMaxRaw = Math.max(...whoData.map(d => d.P97))
  const yMinRaw = Math.min(...whoData.map(d => d.P3))
  const yRange = Math.max(yMaxRaw - yMinRaw, 0.001)
  const hasPeriods = filteredPeriods.length > 0 && !isCompare
  const yAxisMax = hasPeriods ? yMaxRaw + yRange * 0.14 : undefined

  if (hasPeriods) {
    const markerY = yMaxRaw + yRange * 0.06

    const periodColorMap: Record<string, string> = {
      growthSpurt: '#FFB74D',
      teething: '#81C784',
      illness: '#E57373'
    }

    series.push({
      name: '特殊时期',
      type: 'scatter',
      symbol: 'roundRect',
      symbolSize: 22,
      symbolRotate: 45,
      silent: false,
      data: filteredPeriods.map(sp => ({
        name: sp.label,
        value: [sp.ageMonths, markerY],
        periodId: sp.id,
        periodType: sp.type,
        description: sp.description
      })),
      itemStyle: {
        color: (params: any) => periodColorMap[params.data.periodType] || '#999',
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'top',
        distance: 6,
        fontSize: 10,
        color: '#555',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        padding: [2, 5],
        formatter: (params: any) => params.data.name
      },
      labelLayout: {
        hideOverlap: true
      },
      tooltip: {
        formatter: (params: any) => `<div style="padding:8px;"><strong>${params.name}</strong><br/><span style="font-size:12px;color:#666;">${params.data.description}</span></div>`
      },
      z: 6
    })
  }

  const legendData = isCompare
    ? [currentName, `${compareBabyInfo.value!.name}`]
    : []

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    legend: isCompare ? {
      show: true,
      top: 8,
      right: 16,
      data: legendData.map(name => ({ name })),
      itemWidth: 20,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
        color: '#555'
      }
    } : undefined,
    grid: {
      left: 50,
      right: 20,
      top: isCompare ? 56 : 40,
      bottom: 50
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#FF8FA3',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        fontSize: 13,
        color: '#333'
      },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: '#FF8FA3',
          type: 'dashed'
        },
        label: {
          backgroundColor: '#FF8FA3',
          color: '#fff',
          padding: [4, 8],
          borderRadius: 4
        }
      },
      formatter: (params: unknown) => {
        const ps = params as Array<{ seriesName: string; value: number[]; color?: string; data?: { name?: string; description?: string } }>
        if (!ps || ps.length === 0) return ''
        const age = ps[0].value[0]
        let html = `<div style="font-weight:600;margin-bottom:8px;">月龄: ${age.toFixed(1)} 月</div>`
        ps.forEach(p => {
          if (p.seriesName === '特殊时期' && p.data?.description) {
            html += `<div style="display:flex;align-items:center;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;background:${p.color || '#999'};margin-right:8px;transform:rotate(45deg);"></span>
              <span style="font-weight:600;">${p.data.name}</span>
            </div>`
            html += `<div style="font-size:12px;color:#666;margin:2px 0 6px 18px;">${p.data.description}</div>`
          } else if (p.seriesName !== '特殊时期' && !p.seriesName.includes('数据') && p.value[1] !== undefined) {
            html += `<div style="display:flex;align-items:center;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color || '#333'};margin-right:8px;"></span>
              <span>${p.seriesName}: </span>
              <span style="font-weight:600;margin-left:4px;">${p.value[1].toFixed(2)} ${indicatorUnit()}</span>
            </div>`
          }
        })
        return html
      }
    },
    xAxis: {
      type: 'value',
      name: '月龄 (月)',
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: {
        fontSize: 12,
        color: '#666',
        fontWeight: 500
      },
      min: 0,
      max: maxAge,
      interval: maxAge === 24 ? 3 : 6,
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 11,
        color: '#666',
        formatter: (value: number) => value.toString()
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F0F0F0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: props.indicator === 'weight' ? '体重 (kg)' : 
            props.indicator === 'height' ? '身高 (cm)' : '头围 (cm)',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 12,
        color: '#666',
        fontWeight: 500
      },
      max: yAxisMax,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 11,
        color: '#666',
        formatter: (value: number) => value.toString()
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F0F0F0',
          type: 'dashed'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomLock: false,
        throttle: 50
      }
    ],
    series
  }
}

const initChart = async () => {
  if (!chartRef.value) return
  
  isLoading.value = true
  await nextTick()
  
  chartInstance.value = echarts.init(chartRef.value, undefined, {
    devicePixelRatio: window.devicePixelRatio || 2
  })

  chartInstance.value.setOption(generateChartOption())

  chartInstance.value.on('click', (params: unknown) => {
    const p = params as { 
      seriesType: string
      seriesName: string
      data: { measurementId?: string; periodId?: string; periodType?: string }
    }
    if (p.seriesType === 'scatter') {
      if (p.data?.measurementId !== undefined) {
        const measurement = measurements.value.find(m => m.id === p.data?.measurementId)
        if (measurement) {
          const index = measurements.value.findIndex(m => m.id === p.data?.measurementId)
          emit('pointClick', measurement, index)
        }
      } else if (p.data?.periodId) {
        const period = specialPeriods.value.find(sp => sp.id === p.data?.periodId)
        if (period) {
          emit('periodClick', period)
        }
      }
    }
  })

  isLoading.value = false
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

const updateChart = () => {
  if (!chartInstance.value) return
  chartInstance.value.setOption(generateChartOption(), true)
}

watch(
  () => [props.indicator, props.ageRange, currentBabyId.value],
  () => {
    updateChart()
  }
)

watch(
  () => [props.compareMode, props.compareBabyId],
  () => {
    updateChart()
  }
)

watch(
  measurements,
  () => {
    updateChart()
  },
  { deep: true }
)

watch(
  specialPeriods,
  () => {
    updateChart()
  },
  { deep: true }
)

watch(
  babyInfo,
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
  document.addEventListener('click', closeCompareDropdown)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  document.removeEventListener('click', closeCompareDropdown)
  chartInstance.value?.dispose()
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 relative overflow-visible">
    <div class="absolute top-3 right-3 z-10">
      <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
        双指缩放 · 左右滑动
      </div>
    </div>
    
    <div class="mb-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">生长曲线图</h3>
          <p class="text-xs text-gray-400">数据来源：WHO儿童生长标准</p>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-3 flex-wrap">
        <label 
          class="flex items-center gap-2 cursor-pointer select-none"
          :class="{ 'opacity-40 cursor-not-allowed': !canCompare }"
        >
          <div class="relative">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="compareMode"
              :disabled="!canCompare"
              @change="handleToggleCompare(!compareMode)"
            />
            <div class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-pink-400 transition-colors"></div>
            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
          <span class="text-sm font-medium text-gray-700">对比模式</span>
        </label>

        <div v-if="!canCompare" class="text-xs text-gray-400">
          需至少两个宝宝才能对比
        </div>

        <Transition name="fade">
          <div v-if="compareMode && canCompare" class="compare-selector-wrapper relative">
            <button
              class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              @click.stop="toggleCompareDropdown"
            >
              <span class="w-2.5 h-2.5 rounded-sm" style="background-color: #4A90D9"></span>
              <span class="text-sm font-medium text-gray-700">
                {{ compareBabyInfo?.name || '选择宝宝' }}
              </span>
              <ChevronDown 
                class="w-4 h-4 text-gray-400 transition-transform"
                :class="{ 'rotate-180': compareDropdownOpen }"
              />
            </button>

            <Transition name="dropdown">
              <div
                v-if="compareDropdownOpen"
                class="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div class="p-2">
                  <button
                    v-for="baby in otherBabies"
                    :key="baby.id"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-gray-50"
                    :class="{ 'bg-blue-50 ring-1 ring-blue-200': baby.id === compareBabyId }"
                    @click="handleSelectCompareBaby(baby.id)"
                  >
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        v-if="baby.info.avatar" 
                        :src="baby.info.avatar" 
                        :alt="baby.info.name"
                        class="w-full h-full object-cover"
                      />
                      <User v-else class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex-1 text-left min-w-0">
                      <div class="font-medium text-gray-800 text-sm truncate">
                        {{ baby.info.name }}
                      </div>
                      <div class="text-xs text-gray-400">
                        {{ baby.info.gender === 'boy' ? '男宝' : '女宝' }} · {{ baby.measurements.length }} 条
                      </div>
                    </div>
                    <Check 
                      v-if="baby.id === compareBabyId"
                      class="w-4 h-4 text-blue-500 flex-shrink-0"
                    />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>

        <div v-if="compareMode" class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-1 rounded-full" style="background-color: #FF6B6B"></span>
            <span class="text-gray-500">{{ babyInfo.name }}（当前）</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-1 rounded-full border-t-2 border-dashed" style="border-color: #4A90D9"></span>
            <span class="text-gray-500">{{ compareBabyInfo?.name || '对比' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="relative" style="height: 360px;">
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 z-20"
      >
        <div class="flex items-center gap-2 text-pink-500">
          <Loader2 class="w-5 h-5 animate-spin" />
          <span class="text-sm">加载中...</span>
        </div>
      </div>
      
      <div
        ref="chartRef"
        class="w-full h-full touch-none"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

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
