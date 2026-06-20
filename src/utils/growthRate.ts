import type { BabyMeasurement, GrowthIndicator } from '../types'

const calculateGrowthRate = (
  measurements: BabyMeasurement[],
  currentIndex: number,
  indicator: GrowthIndicator
): { rate: number; unit: string } => {
  if (currentIndex <= 0 || currentIndex >= measurements.length) {
    return { rate: 0, unit: '' }
  }

  const current = measurements[currentIndex]
  const previous = measurements[currentIndex - 1]

  const currentValue = current[indicator]
  const previousValue = previous[indicator]

  if (currentValue === undefined || previousValue === undefined) {
    return { rate: 0, unit: '' }
  }

  const ageDiff = current.ageMonths - previous.ageMonths
  if (ageDiff <= 0) {
    return { rate: 0, unit: '' }
  }

  let rate = (currentValue - previousValue) / ageDiff

  if (indicator === 'weight') {
    return {
      rate: Math.round(rate * 1000 * 10) / 10,
      unit: 'g/月'
    }
  }

  return {
    rate: Math.round(rate * 10) / 10,
    unit: 'cm/月'
  }
}

const getIndicatorUnit = (indicator: GrowthIndicator): string => {
  switch (indicator) {
    case 'weight':
      return 'kg'
    case 'height':
      return 'cm'
    case 'headCircumference':
      return 'cm'
    default:
      return ''
  }
}

const getIndicatorLabel = (indicator: GrowthIndicator): string => {
  switch (indicator) {
    case 'weight':
      return '体重'
    case 'height':
      return '身高'
    case 'headCircumference':
      return '头围'
    default:
      return ''
  }
}

export { calculateGrowthRate, getIndicatorUnit, getIndicatorLabel }
