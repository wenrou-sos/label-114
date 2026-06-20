import { ref, computed } from 'vue'
import type { BabyMeasurement } from '../types'
import { 
  babyMeasurements as initialMeasurements, 
  babyInfo,
  specialPeriods 
} from '../data/mockBabyData'

const measurements = ref<BabyMeasurement[]>([...initialMeasurements])

let nextId = Number(
  Math.max(...initialMeasurements.map(m => parseInt(m.id)))
) + 1

export const useBabyData = () => {
  const sortedMeasurements = computed(() => 
    [...measurements.value].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  )

  const calculateAgeMonths = (measurementDate: string): number => {
    const birth = new Date(babyInfo.birthDate)
    const measure = new Date(measurementDate)
    
    const years = measure.getFullYear() - birth.getFullYear()
    const months = measure.getMonth() - birth.getMonth()
    const days = measure.getDate() - birth.getDate()
    
    let totalMonths = years * 12 + months
    if (days < 0) {
      totalMonths -= 1
    }
    
    const birthClone = new Date(birth)
    birthClone.setMonth(birthClone.getMonth() + totalMonths)
    const daysInMonth = new Date(
      birthClone.getFullYear(),
      birthClone.getMonth() + 1,
      0
    ).getDate()
    
    const remainingDays = days < 0 
      ? days + daysInMonth 
      : days
    
    const decimalMonths = remainingDays / daysInMonth
    
    return Math.round((totalMonths + decimalMonths) * 10) / 10
  }

  const validateDate = (dateStr: string): { valid: boolean; message?: string } => {
    if (!dateStr) {
      return { valid: false, message: '请选择测量日期' }
    }
    
    const inputDate = new Date(dateStr)
    const birthDate = new Date(babyInfo.birthDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    if (isNaN(inputDate.getTime())) {
      return { valid: false, message: '日期格式不正确' }
    }
    
    if (inputDate < birthDate) {
      return { 
        valid: false, 
        message: `测量日期不能早于出生日期（${babyInfo.birthDate}）` 
      }
    }
    
    if (inputDate > today) {
      return { valid: false, message: '测量日期不能选择未来日期' }
    }
    
    return { valid: true }
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
    
    const newMeasurement: BabyMeasurement = {
      id: String(nextId++),
      date: data.date,
      ageMonths,
      weight: data.weight,
      ...(data.height !== undefined && data.height !== null && !isNaN(data.height) 
        ? { height: data.height } 
        : {}),
      ...(data.headCircumference !== undefined && data.headCircumference !== null && !isNaN(data.headCircumference) 
        ? { headCircumference: data.headCircumference } 
        : {})
    }
    
    measurements.value.push(newMeasurement)
    
    return { 
      success: true, 
      measurement: newMeasurement,
      message: '添加成功'
    }
  }

  const maxAgeMonths = computed(() => {
    if (sortedMeasurements.value.length === 0) return 0
    return Math.max(...sortedMeasurements.value.map(m => m.ageMonths))
  })

  return {
    measurements: sortedMeasurements,
    babyInfo,
    specialPeriods,
    addMeasurement,
    validateDate,
    calculateAgeMonths,
    maxAgeMonths
  }
}
