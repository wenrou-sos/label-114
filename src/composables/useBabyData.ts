import { computed } from 'vue'
import type { BabyMeasurement } from '../types'
import { useMultipleBabies } from './useMultipleBabies'

export const useBabyData = () => {
  const {
    currentBaby,
    currentBabyInfo,
    currentMeasurements,
    currentSpecialPeriods,
    currentBabyId,
    getSortedMeasurements,
    calculateAgeMonthsForBaby,
    validateDateForBaby,
    addMeasurementToBaby,
    getDefaultDate,
    getMaxDate,
    getMinDate,
    getMaxAgeMonths
  } = useMultipleBabies()

  const measurements = computed(() => 
    getSortedMeasurements(currentBabyId.value)
  )

  const babyInfo = computed(() => currentBabyInfo.value)
  const specialPeriods = computed(() => currentSpecialPeriods.value)

  const calculateAgeMonths = (measurementDate: string): number => {
    return calculateAgeMonthsForBaby(currentBabyId.value, measurementDate)
  }

  const validateDate = (dateStr: string): { valid: boolean; message?: string } => {
    return validateDateForBaby(currentBabyId.value, dateStr)
  }

  const addMeasurement = (data: {
    date: string
    weight?: number
    height?: number
    headCircumference?: number
  }): { success: boolean; message?: string; measurement?: BabyMeasurement } => {
    const dateValidation = validateDate(data.date)
    if (!dateValidation.valid) {
      return { success: false, message: dateValidation.message }
    }
    
    if (data.weight === undefined || data.weight === null || isNaN(data.weight)) {
      return { success: false, message: '请填写体重（必填）' }
    }
    
    if (data.weight <= 0 || data.weight > 50) {
      return { success: false, message: '体重数值不在合理范围内（0-50kg）' }
    }
    
    if (data.height !== undefined && data.height !== null && !isNaN(data.height)) {
      if (data.height <= 0 || data.height > 200) {
        return { success: false, message: '身高数值不在合理范围内（0-200cm）' }
      }
    }
    
    if (data.headCircumference !== undefined && data.headCircumference !== null && !isNaN(data.headCircumference)) {
      if (data.headCircumference <= 0 || data.headCircumference > 100) {
        return { success: false, message: '头围数值不在合理范围内（0-100cm）' }
      }
    }
    
    const ageMonths = calculateAgeMonths(data.date)
    
    const measurement = addMeasurementToBaby(currentBabyId.value, {
      date: data.date,
      ageMonths,
      weight: data.weight,
      ...(data.height !== undefined && data.height !== null && !isNaN(data.height) 
        ? { height: data.height } 
        : {}),
      ...(data.headCircumference !== undefined && data.headCircumference !== null && !isNaN(data.headCircumference) 
        ? { headCircumference: data.headCircumference } 
        : {})
    })
    
    if (measurement) {
      return { success: true, measurement, message: '添加成功' }
    }
    
    return { success: false, message: '添加失败' }
  }

  const maxAgeMonths = computed(() => {
    return getMaxAgeMonths(currentBabyId.value)
  })

  const getMinDateForCurrentBaby = (): string => {
    return getMinDate(currentBabyId.value)
  }

  return {
    measurements,
    babyInfo,
    specialPeriods,
    currentBaby,
    currentBabyId,
    addMeasurement,
    validateDate,
    calculateAgeMonths,
    maxAgeMonths,
    getDefaultDate,
    getMaxDate,
    getMinDate: getMinDateForCurrentBaby
  }
}
