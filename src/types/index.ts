export type GrowthIndicator = 'weight' | 'height' | 'headCircumference'

export type AgeRange = '0-24' | '0-60'

export type PercentileKey = 'P3' | 'P15' | 'P50' | 'P85' | 'P97'

export interface WHODataPoint {
  age: number
  P3: number
  P15: number
  P50: number
  P85: number
  P97: number
}

export interface WHOStandard {
  boys: Record<GrowthIndicator, WHODataPoint[]>
  girls: Record<GrowthIndicator, WHODataPoint[]>
}

export interface BabyMeasurement {
  id: string
  date: string
  ageMonths: number
  weight?: number
  height?: number
  headCircumference?: number
}

export type SpecialPeriodType = 'growthSpurt' | 'teething' | 'illness'

export interface SpecialPeriod {
  id: string
  type: SpecialPeriodType
  ageMonths: number
  label: string
  description: string
}

export interface MeasurementDetail {
  date: string
  ageMonths: number
  value: number
  unit: string
  percentile: number
  percentileKey: PercentileKey
  percentileLabel: string
  percentileRange: string
  growthRate: number
  growthRateUnit: string
}

export interface BabyInfo {
  name: string
  gender: 'boy' | 'girl'
  birthDate: string
  avatar?: string
}

export interface Baby {
  id: string
  info: BabyInfo
  measurements: BabyMeasurement[]
  specialPeriods: SpecialPeriod[]
}

export interface BabyStore {
  babies: Baby[]
  currentBabyId: string
}
