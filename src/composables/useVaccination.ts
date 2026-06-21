import { computed } from 'vue'
import type { VaccinationRecord, VaccineSchedule } from '../types'
import { useMultipleBabies } from './useMultipleBabies'
import { nationalImmunizationSchedule } from '../data/nationalImmunizationSchedule'

export type VaccinationStatus = 'done' | 'due' | 'overdue' | 'upcoming'

export interface ScheduledVaccination {
  schedule: VaccineSchedule
  record: VaccinationRecord | null
  status: VaccinationStatus
}

export interface VaccinationProgress {
  total: number
  done: number
  due: number
  overdue: number
  upcoming: number
  percentage: number
}

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000

const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

export const useVaccination = () => {
  const {
    currentBabyId,
    currentBabyInfo,
    currentVaccinations,
    addVaccinationToBaby,
    updateVaccinationInBaby,
    deleteVaccinationFromBaby,
    getDefaultDate,
    getMinDate,
    getMaxDate
  } = useMultipleBabies()

  const getAgeMonthsNow = (): number => {
    if (!currentBabyInfo.value?.birthDate) return 0
    const birth = parseDate(currentBabyInfo.value.birthDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return (today.getTime() - birth.getTime()) / MONTH_MS
  }

  const scheduledList = computed<ScheduledVaccination[]>(() => {
    const ageNow = getAgeMonthsNow()
    return nationalImmunizationSchedule
      .map(schedule => {
        const record = currentVaccinations.value.find(v => v.scheduleId === schedule.id) || null
        let status: VaccinationStatus
        if (record) {
          status = 'done'
        } else if (ageNow >= schedule.ageMonths + 1) {
          status = 'overdue'
        } else if (ageNow >= schedule.ageMonths - 0.01) {
          status = 'due'
        } else {
          status = 'upcoming'
        }
        return { schedule, record, status }
      })
      .sort((a, b) => a.schedule.ageMonths - b.schedule.ageMonths)
  })

  const progress = computed<VaccinationProgress>(() => {
    const total = scheduledList.value.length
    const done = scheduledList.value.filter(s => s.status === 'done').length
    const overdue = scheduledList.value.filter(s => s.status === 'overdue').length
    const due = scheduledList.value.filter(s => s.status === 'due').length
    const upcoming = scheduledList.value.filter(s => s.status === 'upcoming').length
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, due, overdue, upcoming, percentage }
  })

  const nextDue = computed<ScheduledVaccination | null>(() => {
    return scheduledList.value.find(s => s.status === 'due' || s.status === 'overdue')
      || scheduledList.value.find(s => s.status === 'upcoming')
      || null
  })

  const validateVaccinationDate = (dateStr: string): { valid: boolean; message?: string } => {
    if (!dateStr) return { valid: false, message: '请选择接种日期' }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return { valid: false, message: '日期格式不正确' }
    const input = parseDate(dateStr)
    if (isNaN(input.getTime())) return { valid: false, message: '日期格式不正确' }
    const minStr = getMinDate(currentBabyId.value)
    if (minStr && parseDate(minStr).getTime() > input.getTime()) {
      return { valid: false, message: `接种日期不能早于出生日期（${minStr}）` }
    }
    const maxStr = getMaxDate()
    if (parseDate(maxStr).getTime() < input.getTime()) {
      return { valid: false, message: '接种日期不能选择未来日期' }
    }
    return { valid: true }
  }

  const markVaccinated = (
    scheduleId: string,
    data: { date: string; batchNumber?: string; site?: string; note?: string }
  ): { success: boolean; message?: string } => {
    const validation = validateVaccinationDate(data.date)
    if (!validation.valid) return { success: false, message: validation.message }
    const existing = currentVaccinations.value.find(v => v.scheduleId === scheduleId)
    if (existing) return { success: false, message: '该剂次已存在接种记录' }
    const result = addVaccinationToBaby(currentBabyId.value, { scheduleId, ...data })
    return result ? { success: true } : { success: false, message: '记录失败，请重试' }
  }

  const updateVaccination = (
    recordId: string,
    data: { date?: string; batchNumber?: string; site?: string; note?: string }
  ): { success: boolean; message?: string } => {
    if (data.date !== undefined) {
      const validation = validateVaccinationDate(data.date)
      if (!validation.valid) return { success: false, message: validation.message }
    }
    const result = updateVaccinationInBaby(currentBabyId.value, recordId, data)
    return result ? { success: true } : { success: false, message: '更新失败，请重试' }
  }

  const deleteVaccination = (recordId: string): { success: boolean; message?: string } => {
    const result = deleteVaccinationFromBaby(currentBabyId.value, recordId)
    return result ? { success: true } : { success: false, message: '删除失败，请重试' }
  }

  return {
    scheduledList,
    progress,
    nextDue,
    markVaccinated,
    updateVaccination,
    deleteVaccination,
    validateVaccinationDate,
    getDefaultDate,
    getMinDate: () => getMinDate(currentBabyId.value),
    getMaxDate
  }
}
