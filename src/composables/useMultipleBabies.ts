import { ref, computed, watch } from 'vue'
import type { Baby, BabyInfo, BabyMeasurement, SpecialPeriod } from '../types'
import { 
  babyInfo as initialBabyInfo,
  babyMeasurements as initialMeasurements,
  specialPeriods as initialSpecialPeriods
} from '../data/mockBabyData'

const STORAGE_KEY = 'baby-growth-v2'

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

const createInitialBaby = (): Baby => ({
  id: generateId(),
  info: { ...initialBabyInfo },
  measurements: [...initialMeasurements],
  specialPeriods: [...initialSpecialPeriods]
})

const loadFromStorage = (): { babies: Baby[], currentBabyId: string } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
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
    const baby = createInitialBaby()
    return { babies: [baby], currentBabyId: baby.id }
  } catch (e) {
    console.warn('[useMultipleBabies] 读取localStorage失败，使用初始数据', e)
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
    const newBaby: Baby = {
      id: generateId(),
      info: {
        ...info,
        avatar: getDefaultAvatar(info.gender)
      },
      measurements: [],
      specialPeriods: []
    }
    babies.value.push(newBaby)
    currentBabyId.value = newBaby.id
    return newBaby
  }

  const updateBaby = (babyId: string, info: Partial<BabyInfo>) => {
    const baby = babies.value.find(b => b.id === babyId)
    if (baby) {
      baby.info = { ...baby.info, ...info }
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
    
    const birth = parseLocalDate(baby.info.birthDate)
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
    getSortedMeasurements,
    calculateAgeMonthsForBaby,
    validateDateForBaby,
    getDefaultDate,
    getMaxDate,
    getMinDate,
    getMaxAgeMonths
  }
}
