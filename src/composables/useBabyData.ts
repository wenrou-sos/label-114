import { computed } from 'vue'
import type { BabyMeasurement, SpecialPeriod, SpecialPeriodType } from '../types'
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
    updateMeasurementInBaby,
    deleteMeasurementFromBaby,
    getDefaultDate,
    getMaxDate,
    getMinDate,
    getMaxAgeMonths,
    addSpecialPeriodToBaby,
    updateSpecialPeriodForBaby,
    deleteSpecialPeriodFromBaby
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

  const addSpecialPeriod = (data: Omit<SpecialPeriod, 'id'>): { success: boolean; message?: string; period?: SpecialPeriod } => {
    if (!data.type || !['growthSpurt', 'teething', 'illness'].includes(data.type)) {
      return { success: false, message: '请选择特殊时期类型' }
    }
    if (data.ageMonths === undefined || data.ageMonths < 0) {
      return { success: false, message: '请填写有效的月龄' }
    }
    if (!data.label?.trim()) {
      return { success: false, message: '请填写时期标签' }
    }
    
    const period = addSpecialPeriodToBaby(currentBabyId.value, data)
    if (period) {
      return { success: true, period, message: '添加成功' }
    }
    return { success: false, message: '添加失败' }
  }

  const updateSpecialPeriod = (periodId: string, data: Partial<Omit<SpecialPeriod, 'id'>>): { success: boolean; message?: string; period?: SpecialPeriod } => {
    const period = updateSpecialPeriodForBaby(currentBabyId.value, periodId, data)
    if (period) {
      return { success: true, period, message: '更新成功' }
    }
    return { success: false, message: '更新失败' }
  }

  const deleteSpecialPeriod = (periodId: string): { success: boolean; message?: string } => {
    const success = deleteSpecialPeriodFromBaby(currentBabyId.value, periodId)
    if (success) {
      return { success: true, message: '删除成功' }
    }
    return { success: false, message: '删除失败' }
  }

  const updateMeasurement = (
    measurementId: string,
    data: {
      date: string
      weight?: number
      height?: number
      headCircumference?: number
    }
  ): { success: boolean; message?: string; measurement?: BabyMeasurement } => {
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
    
    const measurement = updateMeasurementInBaby(currentBabyId.value, measurementId, {
      date: data.date,
      weight: data.weight,
      height: data.height !== undefined && data.height !== null && !isNaN(data.height) 
        ? data.height 
        : undefined,
      headCircumference: data.headCircumference !== undefined && data.headCircumference !== null && !isNaN(data.headCircumference) 
        ? data.headCircumference 
        : undefined
    })
    
    if (measurement) {
      return { success: true, measurement, message: '更新成功' }
    }
    
    return { success: false, message: '更新失败' }
  }

  const deleteMeasurement = (measurementId: string): { success: boolean; message?: string } => {
    const success = deleteMeasurementFromBaby(currentBabyId.value, measurementId)
    if (success) {
      return { success: true, message: '删除成功' }
    }
    return { success: false, message: '删除失败，记录不存在' }
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
    getMinDate: getMinDateForCurrentBaby,
    addSpecialPeriod,
    updateSpecialPeriod,
    deleteSpecialPeriod,
    updateMeasurement,
    deleteMeasurement
  }
}
