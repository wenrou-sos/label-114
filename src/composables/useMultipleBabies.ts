import { ref, computed, watch } from 'vue'
import type { Baby, BabyInfo, BabyMeasurement, SpecialPeriod } from '../types'
import { 
  babyInfo as initialBabyInfo,
  babyMeasurements as initialMeasurements,
  specialPeriods as initialSpecialPeriods
} from '../data/mockBabyData'

const STORAGE_KEY = 'baby-growth-v2'
const OLD_STORAGE_KEY = 'baby-growth'

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

const getTodayLocal = (): Date => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

const calculateAgeFromBirthDate = (birthDate: string, measurementDate: string): number => {
  const birth = parseLocalDate(birthDate)
  const measure = parseLocalDate(measurementDate)
  
  let years = measure.getFullYear() - birth.getFullYear()
  let months = measure.getMonth() - birth.getMonth()
  let days = measure.getDate() - birth.getDate()
  
  let totalMonths = years * 12 + months
  if (days < 0) {
    totalMonths -= 1
    const prevMonth = new Date(measure.getFullYear(), measure.getMonth(), 0)
    days += prevMonth.getDate()
  }
  
  const currentMonthStart = new Date(birth.getFullYear(), birth.getMonth() + totalMonths, birth.getDate())
  const nextMonthStart = new Date(birth.getFullYear(), birth.getMonth() + totalMonths + 1, birth.getDate())
  const totalDaysInPeriod = Math.max(
    (nextMonthStart.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24),
    1
  )
  const elapsedDays = Math.max(
    (measure.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24),
    0
  )
  const decimalMonths = Math.min(elapsedDays / totalDaysInPeriod, 0.999)
  
  return Math.round((totalMonths + decimalMonths) * 10) / 10
}

const generateId = (): string => {
  return 'baby_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

const generateMeasurementId = (existingIds: string[]): string => {
  const maxNum = Math.max(...existingIds.map(id => parseInt(id, 10) || 0), 0)
  return String(maxNum + 1)
}

const getDefaultAvatar = (gender: 'boy' | 'girl'): string => {
  const prompt = gender === 'boy' 
    ? 'cute%20baby%20boy%20avatar%20cartoon%20style' 
    : 'cute%20baby%20girl%20avatar%20cartoon%20style'
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`
}

const defaultSpecialPeriods: Omit<SpecialPeriod, 'id'>[] = [
  { type: 'growthSpurt', ageMonths: 0.5, label: '猛长期', description: '2-3周猛长期，宝宝食量增加，睡眠模式改变' },
  { type: 'growthSpurt', ageMonths: 1.5, label: '猛长期', description: '6周猛长期，快速生长阶段' },
  { type: 'growthSpurt', ageMonths: 3, label: '猛长期', description: '3月龄猛长期，生长加速期' },
  { type: 'teething', ageMonths: 5, label: '出牙期', description: '开始出牙，可能伴随不适，食欲可能受影响' },
  { type: 'growthSpurt', ageMonths: 6, label: '猛长期', description: '6月龄猛长期，添加辅食阶段' },
  { type: 'teething', ageMonths: 10, label: '出牙期', description: '乳磨牙萌出' },
  { type: 'growthSpurt', ageMonths: 12, label: '猛长期', description: '1岁猛长期，学步期能量消耗大' }
]

const generateSpecialPeriodId = (existingIds: string[]): string => {
  const maxNum = Math.max(...existingIds.map(id => {
    const match = id.match(/^sp(\d+)$/)
    return match ? parseInt(match[1], 10) : 0
  }), 0)
  return `sp${maxNum + 1}`
}

const createInitialBaby = (): Baby => ({
  id: generateId(),
  info: { ...initialBabyInfo },
  measurements: [...initialMeasurements],
  specialPeriods: [...initialSpecialPeriods]
})

const migrateFromOldVersion = (): { babies: Baby[], currentBabyId: string } | null => {
  try {
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY)
    if (!oldRaw) return null

    const oldData = JSON.parse(oldRaw)
    
    if (!oldData.babyInfo || !oldData.babyMeasurements) {
      return null
    }

    const baby: Baby = {
      id: generateId(),
      info: {
        name: oldData.babyInfo.name || '宝宝',
        gender: oldData.babyInfo.gender || 'boy',
        birthDate: oldData.babyInfo.birthDate,
        avatar: oldData.babyInfo.avatar || undefined
      },
      measurements: oldData.babyMeasurements || [],
      specialPeriods: oldData.specialPeriods || []
    }

    console.info('[useMultipleBabies] 检测到旧版本数据，已成功迁移到多宝宝版本')
    
    return { babies: [baby], currentBabyId: baby.id }
  } catch (e) {
    console.warn('[useMultipleBabies] 旧版本数据迁移失败', e)
    return null
  }
}

const loadFromStorage = (): { babies: Baby[], currentBabyId: string } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const migratedData = migrateFromOldVersion()
      if (migratedData) {
        saveToStorage(migratedData)
        return migratedData
      }
      const baby = createInitialBaby()
      return { babies: [baby], currentBabyId: baby.id }
    }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.babies) && parsed.babies.length > 0 && parsed.currentBabyId) {
      const currentExists = parsed.babies.some((b: Baby) => b.id === parsed.currentBabyId)
      return {
        babies: parsed.babies,
        currentBabyId: currentExists ? parsed.currentBabyId : parsed.babies[0].id
      }
    }
    const migratedData = migrateFromOldVersion()
    if (migratedData) {
      saveToStorage(migratedData)
      return migratedData
    }
    const baby = createInitialBaby()
    return { babies: [baby], currentBabyId: baby.id }
  } catch (e) {
    console.warn('[useMultipleBabies] 读取localStorage失败，使用初始数据', e)
    const migratedData = migrateFromOldVersion()
    if (migratedData) {
      saveToStorage(migratedData)
      return migratedData
    }
    const baby = createInitialBaby()
    return { babies: [baby], currentBabyId: baby.id }
  }
}

const saveToStorage = (data: { babies: Baby[], currentBabyId: string }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[useMultipleBabies] 保存localStorage失败', e)
  }
}

const initialData = loadFromStorage()
const babies = ref<Baby[]>(initialData.babies)
const currentBabyId = ref<string>(initialData.currentBabyId)

watch(
  [babies, currentBabyId],
  () => {
    saveToStorage({ babies: babies.value, currentBabyId: currentBabyId.value })
  },
  { deep: true }
)

export const useMultipleBabies = () => {
  const currentBaby = computed(() => {
    return babies.value.find(b => b.id === currentBabyId.value) || babies.value[0]
  })

  const currentBabyInfo = computed(() => currentBaby.value.info)
  const currentMeasurements = computed(() => currentBaby.value.measurements)
  const currentSpecialPeriods = computed(() => currentBaby.value.specialPeriods)

  const switchBaby = (babyId: string) => {
    const exists = babies.value.some(b => b.id === babyId)
    if (exists) {
      currentBabyId.value = babyId
    }
  }

  const addBaby = (info: Omit<BabyInfo, 'avatar'>): Baby => {
    const today = toLocalDateString(getTodayLocal())
    const babyAgeMonths = calculateAgeFromBirthDate(info.birthDate, today)
    const periods = defaultSpecialPeriods
      .filter(sp => sp.ageMonths <= Math.max(babyAgeMonths, 0))
      .map((sp, idx) => ({
        ...sp,
        id: `sp${idx + 1}`
      }))

    const newBaby: Baby = {
      id: generateId(),
      info: {
        ...info,
        avatar: getDefaultAvatar(info.gender)
      },
      measurements: [],
      specialPeriods: periods
    }
    babies.value.push(newBaby)
    currentBabyId.value = newBaby.id
    return newBaby
  }

  const addSpecialPeriodToBaby = (
    babyId: string,
    data: Omit<SpecialPeriod, 'id'>
  ): SpecialPeriod | null => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return null

    const existingIds = baby.specialPeriods.map(sp => sp.id)
    const newPeriod: SpecialPeriod = {
      id: generateSpecialPeriodId(existingIds),
      ...data
    }
    baby.specialPeriods.push(newPeriod)
    return newPeriod
  }

  const updateSpecialPeriodForBaby = (
    babyId: string,
    periodId: string,
    data: Partial<Omit<SpecialPeriod, 'id'>>
  ): SpecialPeriod | null => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return null

    const period = baby.specialPeriods.find(sp => sp.id === periodId)
    if (!period) return null

    Object.assign(period, data)
    return period
  }

  const deleteSpecialPeriodFromBaby = (babyId: string, periodId: string): boolean => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return false

    const index = baby.specialPeriods.findIndex(sp => sp.id === periodId)
    if (index === -1) return false

    baby.specialPeriods.splice(index, 1)
    return true
  }

  const updateBaby = (babyId: string, info: Partial<BabyInfo>) => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return

    const oldBirthDate = baby.info.birthDate
    baby.info = { ...baby.info, ...info }

    if (info.birthDate && info.birthDate !== oldBirthDate) {
      const newBirthDate = parseLocalDate(info.birthDate)
      const today = getTodayLocal()

      const validMeasurements = baby.measurements.filter(m => {
        const measureDate = parseLocalDate(m.date)
        return measureDate.getTime() >= newBirthDate.getTime() && 
               measureDate.getTime() <= today.getTime()
      })

      const removedCount = baby.measurements.length - validMeasurements.length

      baby.measurements = validMeasurements.map(m => ({
        ...m,
        ageMonths: calculateAgeMonthsForBaby(babyId, m.date)
      }))

      const maxAge = baby.measurements.length > 0
        ? Math.max(...baby.measurements.map(m => m.ageMonths))
        : calculateAgeFromBirthDate(info.birthDate, toLocalDateString(getTodayLocal()))
      
      const existingPeriodIds = baby.specialPeriods.map(sp => sp.id)
      const autoPeriods = defaultSpecialPeriods
        .filter(sp => sp.ageMonths <= Math.max(maxAge, 0) && 
          !baby.specialPeriods.some(ep => ep.type === sp.type && Math.abs(ep.ageMonths - sp.ageMonths) < 0.3))
        .map((sp) => ({
          ...sp,
          id: generateSpecialPeriodId([...existingPeriodIds])
        }))
      
      baby.specialPeriods = [...baby.specialPeriods, ...autoPeriods]
        .sort((a, b) => a.ageMonths - b.ageMonths)

      if (removedCount > 0) {
        console.info(`[useMultipleBabies] 已删除 ${removedCount} 条早于新出生日期的测量记录`)
      }

      console.info('[useMultipleBabies] 出生日期更新，已重算所有测量记录的月龄')
    }
  }

  const deleteBaby = (babyId: string) => {
    const index = babies.value.findIndex(b => b.id === babyId)
    if (index === -1) return
    if (babies.value.length <= 1) return
    
    babies.value.splice(index, 1)
    
    if (currentBabyId.value === babyId) {
      currentBabyId.value = babies.value[0].id
    }
  }

  const addMeasurementToBaby = (
    babyId: string, 
    data: Omit<BabyMeasurement, 'id' | 'ageMonths'> & { ageMonths: number }
  ): BabyMeasurement | null => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return null

    const existingIds = baby.measurements.map(m => m.id)
    const newMeasurement: BabyMeasurement = {
      id: generateMeasurementId(existingIds),
      ...data
    }
    baby.measurements.push(newMeasurement)
    return newMeasurement
  }

  const updateMeasurementInBaby = (
    babyId: string,
    measurementId: string,
    data: {
      date?: string
      weight?: number
      height?: number
      headCircumference?: number
    }
  ): BabyMeasurement | null => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return null

    const measurement = baby.measurements.find(m => m.id === measurementId)
    if (!measurement) return null

    if (data.date !== undefined) {
      measurement.date = data.date
      measurement.ageMonths = calculateAgeMonthsForBaby(babyId, data.date)
    }
    if (data.weight !== undefined) measurement.weight = data.weight
    else if (Object.keys(data).includes('weight')) delete measurement.weight
    if (data.height !== undefined) measurement.height = data.height
    else if (Object.keys(data).includes('height')) delete measurement.height
    if (data.headCircumference !== undefined) measurement.headCircumference = data.headCircumference
    else if (Object.keys(data).includes('headCircumference')) delete measurement.headCircumference

    return measurement
  }

  const deleteMeasurementFromBaby = (babyId: string, measurementId: string): boolean => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return false

    const index = baby.measurements.findIndex(m => m.id === measurementId)
    if (index === -1) return false

    baby.measurements.splice(index, 1)
    return true
  }

  const getSortedMeasurements = (babyId: string) => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return []
    return [...baby.measurements].sort((a, b) => 
      parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
    )
  }

  const calculateAgeMonthsForBaby = (babyId: string, measurementDate: string): number => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return 0
    return calculateAgeFromBirthDate(baby.info.birthDate, measurementDate)
  }

  const validateDateForBaby = (babyId: string, dateStr: string): { valid: boolean; message?: string } => {
    const baby = babies.value.find(b => b.id === babyId)
    if (!baby) return { valid: false, message: '宝宝不存在' }
    
    if (!dateStr) {
      return { valid: false, message: '请选择测量日期' }
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { valid: false, message: '日期格式不正确' }
    }
    
    const inputDate = parseLocalDate(dateStr)
    
    if (isNaN(inputDate.getTime())) {
      return { valid: false, message: '日期格式不正确' }
    }
    
    const birthDate = parseLocalDate(baby.info.birthDate)
    const today = getTodayLocal()
    
    if (inputDate.getTime() < birthDate.getTime()) {
      return { 
        valid: false, 
        message: `测量日期不能早于出生日期（${baby.info.birthDate}）` 
      }
    }
    
    if (inputDate.getTime() > today.getTime()) {
      return { valid: false, message: '测量日期不能选择未来日期' }
    }
    
    return { valid: true }
  }

  const toLocalDateString = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const getDefaultDate = (): string => toLocalDateString(getTodayLocal())
  const getMaxDate = (): string => toLocalDateString(getTodayLocal())

  const getMinDate = (babyId: string): string => {
    const baby = babies.value.find(b => b.id === babyId)
    return baby ? baby.info.birthDate : ''
  }

  const getMaxAgeMonths = (babyId: string): number => {
    const sorted = getSortedMeasurements(babyId)
    if (sorted.length === 0) return 0
    return Math.max(...sorted.map(m => m.ageMonths))
  }

  return {
    babies,
    currentBabyId,
    currentBaby,
    currentBabyInfo,
    currentMeasurements,
    currentSpecialPeriods,
    switchBaby,
    addBaby,
    updateBaby,
    deleteBaby,
    addMeasurementToBaby,
    updateMeasurementInBaby,
    deleteMeasurementFromBaby,
    getSortedMeasurements,
    calculateAgeMonthsForBaby,
    validateDateForBaby,
    getDefaultDate,
    getMaxDate,
    getMinDate,
    getMaxAgeMonths,
    addSpecialPeriodToBaby,
    updateSpecialPeriodForBaby,
    deleteSpecialPeriodFromBaby
  }
}
