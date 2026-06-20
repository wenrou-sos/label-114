import { computed } from 'vue'
import type { GrowthIndicator, BabyMeasurement } from '../types'
import { getWHOData } from '../data/whoStandards'
import { babyInfo } from '../data/mockBabyData'
import { useBabyData } from './useBabyData'
import { calculatePercentile, getPercentileLabel, getPercentileKey, getPercentileRange } from '../utils/percentile'
import { calculateGrowthRate, getIndicatorUnit, getIndicatorLabel } from '../utils/growthRate'

export const usePercentile = () => {
  const { measurements } = useBabyData()

  const getMeasurementDetail = (
    measurement: BabyMeasurement,
    index: number,
    indicator: GrowthIndicator
  ) => {
    const whoData = getWHOData(babyInfo.gender, indicator, '0-60')
    const value = measurement[indicator]

    if (value === undefined) {
      return null
    }

    const percentile = calculatePercentile(value, whoData, measurement.ageMonths)
    const percentileLabel = getPercentileLabel(percentile)
    const growthRateResult = calculateGrowthRate(measurements.value, index, indicator)

    return {
      date: measurement.date,
      ageMonths: measurement.ageMonths,
      value,
      unit: getIndicatorUnit(indicator),
      indicatorLabel: getIndicatorLabel(indicator),
      percentile,
      percentileKey: getPercentileKey(percentile),
      percentileRange: getPercentileRange(percentile),
      percentileLabel,
      growthRate: growthRateResult.rate,
      growthRateUnit: growthRateResult.unit
    }
  }

  const getGrowthStatus = (percentile: number) => {
    if (percentile < 3) return { status: '偏低', color: '#E57373', level: 'warning' }
    if (percentile < 15) return { status: '中下', color: '#FFB74D', level: 'info' }
    if (percentile < 85) return { status: '正常', color: '#81C784', level: 'success' }
    if (percentile < 97) return { status: '中上', color: '#64B5F6', level: 'info' }
    return { status: '偏高', color: '#BA68C8', level: 'warning' }
  }

  const latestMeasurement = computed(() => {
    return measurements.value[measurements.value.length - 1]
  })

  const getLatestPercentile = (indicator: GrowthIndicator) => {
    const latest = latestMeasurement.value
    if (!latest) return null
    return getMeasurementDetail(latest, measurements.value.length - 1, indicator)
  }

  return {
    getMeasurementDetail,
    getGrowthStatus,
    latestMeasurement,
    getLatestPercentile
  }
}
