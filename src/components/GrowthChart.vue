<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { GrowthIndicator, AgeRange, BabyMeasurement, SpecialPeriod, WHODataPoint, PercentileKey } from '../types'
import { getWHOData } from '../data/whoStandards'
import { useBabyData } from '../composables/useBabyData'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  indicator: GrowthIndicator
  ageRange: AgeRange
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'pointClick', measurement: BabyMeasurement, index: number): void
  (e: 'periodClick', period: SpecialPeriod): void
}>()

const { measurements, babyInfo, specialPeriods, currentBabyId } = useBabyData()

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<ECharts | null>(null)
const isLoading = ref(false)

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

  const percentileKeys: PercentileKey[] = ['P3', 'P15', 'P50', 'P85', 'P97']

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

  const babyData = measurements
    .filter(m => m[props.indicator] !== undefined)
    .map(m => [m.ageMonths, m[props.indicator]])

  if (babyData.length > 0) {
    series.push({
      name: '生长趋势',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: '#FF6B6B'
      },
      data: babyData,
      z: 3
    })

    series.push({
      name: '测量数据',
      type: 'scatter',
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: {
        color: '#FF6B6B',
        borderColor: '#fff',
        borderWidth: 2
      },
      data: babyData.map((d, i) => ({
        value: d,
        measurementIndex: i
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

  const filteredPeriods = specialPeriods.value.filter(sp => sp.ageMonths <= maxAge)
  const yMaxRaw = Math.max(...whoData.map(d => d.P97))
  const yMinRaw = Math.min(...whoData.map(d => d.P3))
  const yRange = Math.max(yMaxRaw - yMinRaw, 0.001)
  const hasPeriods = filteredPeriods.length > 0
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

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    grid: {
      left: 50,
      right: 20,
      top: 40,
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
          } else if (p.seriesName !== '特殊时期' && p.seriesName !== '测量数据' && p.value[1] !== undefined) {
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
      data: { measurementIndex?: number; periodId?: string; periodType?: string }
    }
    if (p.seriesType === 'scatter') {
      if (p.data?.measurementIndex !== undefined) {
        const measurement = filteredMeasurements.value[p.data.measurementIndex]
        if (measurement) {
          emit('pointClick', measurement, p.data.measurementIndex)
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
  () => [props.indicator, props.ageRange, measurements.value.length, currentBabyId.value],
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 relative overflow-hidden">
    <div class="absolute top-3 right-3 z-10">
      <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
        双指缩放 · 左右滑动
      </div>
    </div>
    
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-gray-800">生长曲线图</h3>
      <p class="text-xs text-gray-400">数据来源：WHO儿童生长标准</p>
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
