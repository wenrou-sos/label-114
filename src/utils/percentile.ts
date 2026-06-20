import type { WHODataPoint, PercentileKey } from '../types'

const normalCDF = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - prob : prob
}

const normalInv = (p: number): number => {
  if (p <= 0 || p >= 1) return NaN
  if (p < 0.5) return -normalInv(1 - p)
  const t = Math.sqrt(-2 * Math.log(1 - p))
  return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / 
         (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)
}

const getPercentileKey = (percentile: number): PercentileKey => {
  if (percentile < 3) return 'P3'
  if (percentile < 15) return 'P15'
  if (percentile < 85) return 'P50'
  if (percentile < 97) return 'P85'
  return 'P97'
}

const getPercentileLabel = (percentile: number): string => {
  const key = getPercentileKey(percentile)
  const labels: Record<PercentileKey, string> = {
    P3: '低于第3百分位，生长偏低',
    P15: '第3-15百分位，中下水平',
    P50: '第15-85百分位，正常水平',
    P85: '第85-97百分位，中上水平',
    P97: '高于第97百分位，生长偏高'
  }
  return labels[key]
}

const getPercentileRange = (percentile: number): string => {
  if (percentile < 3) return '低于P3'
  if (percentile < 15) return 'P3-P15'
  if (percentile < 85) return 'P15-P85'
  if (percentile < 97) return 'P85-P97'
  return '高于P97'
}

const interpolateData = (data: WHODataPoint[], age: number): WHODataPoint | null => {
  if (data.length === 0) return null
  
  if (age <= data[0].age) return data[0]
  if (age >= data[data.length - 1].age) return data[data.length - 1]
  
  for (let i = 0; i < data.length - 1; i++) {
    if (age >= data[i].age && age <= data[i + 1].age) {
      const ratio = (age - data[i].age) / (data[i + 1].age - data[i].age)
      return {
        age,
        P3: data[i].P3 + (data[i + 1].P3 - data[i].P3) * ratio,
        P15: data[i].P15 + (data[i + 1].P15 - data[i].P15) * ratio,
        P50: data[i].P50 + (data[i + 1].P50 - data[i].P50) * ratio,
        P85: data[i].P85 + (data[i + 1].P85 - data[i].P85) * ratio,
        P97: data[i].P97 + (data[i + 1].P97 - data[i].P97) * ratio
      }
    }
  }
  
  return null
}

const calculatePercentile = (value: number, whoData: WHODataPoint[], ageMonths: number): number => {
  const point = interpolateData(whoData, ageMonths)
  if (!point) return 50
  
  const z3 = normalInv(0.03)
  const z97 = normalInv(0.97)
  const s = (point.P97 - point.P3) / (z97 - z3)
  const m = point.P50
  
  if (s <= 0) return 50
  
  const z = (value - m) / s
  return Math.round(normalCDF(z) * 100 * 10) / 10
}

export {
  normalCDF,
  normalInv,
  interpolateData,
  calculatePercentile,
  getPercentileKey,
  getPercentileLabel,
  getPercentileRange
}
