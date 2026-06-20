import type { BabyMeasurement, SpecialPeriod, BabyInfo } from '../types'

export const babyInfo: BabyInfo = {
  name: '小明',
  gender: 'boy',
  birthDate: '2024-01-15',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20baby%20avatar%20cartoon%20style&image_size=square'
}

export const babyMeasurements: BabyMeasurement[] = [
  { id: '1', date: '2024-01-15', ageMonths: 0, weight: 3.4, height: 50.5, headCircumference: 34.8 },
  { id: '2', date: '2024-02-15', ageMonths: 1, weight: 4.6, height: 54.2, headCircumference: 36.5 },
  { id: '3', date: '2024-03-15', ageMonths: 2, weight: 5.8, height: 57.5, headCircumference: 38.0 },
  { id: '4', date: '2024-04-15', ageMonths: 3, weight: 6.5, height: 60.0, headCircumference: 39.2 },
  { id: '5', date: '2024-05-15', ageMonths: 4, weight: 7.2, height: 62.0, headCircumference: 40.3 },
  { id: '6', date: '2024-06-15', ageMonths: 5, weight: 7.8, height: 64.0, headCircumference: 41.2 },
  { id: '7', date: '2024-07-15', ageMonths: 6, weight: 8.3, height: 65.5, headCircumference: 42.0 },
  { id: '8', date: '2024-08-15', ageMonths: 7, weight: 8.7, height: 67.0, headCircumference: 42.8 },
  { id: '9', date: '2024-09-15', ageMonths: 8, weight: 9.0, height: 68.5, headCircumference: 43.4 },
  { id: '10', date: '2024-10-15', ageMonths: 9, weight: 9.3, height: 70.0, headCircumference: 44.0 },
  { id: '11', date: '2024-11-15', ageMonths: 10, weight: 9.6, height: 71.5, headCircumference: 44.5 },
  { id: '12', date: '2024-12-15', ageMonths: 11, weight: 9.9, height: 72.8, headCircumference: 45.0 },
  { id: '13', date: '2025-01-15', ageMonths: 12, weight: 10.1, height: 74.0, headCircumference: 45.4 },
  { id: '14', date: '2025-02-15', ageMonths: 13, weight: 10.3, height: 75.2, headCircumference: 45.8 },
  { id: '15', date: '2025-03-15', ageMonths: 14, weight: 10.5, height: 76.3, headCircumference: 46.1 },
  { id: '16', date: '2025-04-15', ageMonths: 15, weight: 10.7, height: 77.3, headCircumference: 46.4 },
  { id: '17', date: '2025-05-15', ageMonths: 16, weight: 10.9, height: 78.3, headCircumference: 46.7 },
  { id: '18', date: '2025-06-15', ageMonths: 17, weight: 11.1, height: 79.2, headCircumference: 46.9 },
  { id: '19', date: '2025-07-15', ageMonths: 18, weight: 11.2, height: 80.0, headCircumference: 47.1 },
  { id: '20', date: '2025-08-15', ageMonths: 19, weight: 11.4, height: 80.8, headCircumference: 47.3 },
  { id: '21', date: '2025-09-15', ageMonths: 20, weight: 11.5, height: 81.5, headCircumference: 47.5 },
  { id: '22', date: '2025-10-15', ageMonths: 21, weight: 11.7, height: 82.2, headCircumference: 47.7 },
  { id: '23', date: '2025-11-15', ageMonths: 22, weight: 11.8, height: 82.9, headCircumference: 47.9 },
  { id: '24', date: '2025-12-15', ageMonths: 23, weight: 12.0, height: 83.5, headCircumference: 48.1 },
  { id: '25', date: '2026-01-15', ageMonths: 24, weight: 12.2, height: 84.1, headCircumference: 48.3 },
  { id: '26', date: '2026-02-15', ageMonths: 25, weight: 12.3, height: 84.7, headCircumference: 48.5 },
  { id: '27', date: '2026-03-15', ageMonths: 26, weight: 12.5, height: 85.2, headCircumference: 48.6 },
  { id: '28', date: '2026-04-15', ageMonths: 27, weight: 12.6, height: 85.7, headCircumference: 48.7 },
  { id: '29', date: '2026-05-15', ageMonths: 28, weight: 12.7, height: 86.2, headCircumference: 48.8 },
  { id: '30', date: '2026-06-15', ageMonths: 29, weight: 12.9, height: 86.7, headCircumference: 48.9 }
]

export const specialPeriods: SpecialPeriod[] = [
  { id: 'sp1', type: 'growthSpurt', ageMonths: 0.5, label: '猛长期', description: '2-3周猛长期，宝宝食量增加，睡眠模式改变' },
  { id: 'sp2', type: 'growthSpurt', ageMonths: 1.5, label: '猛长期', description: '6周猛长期，快速生长阶段' },
  { id: 'sp3', type: 'growthSpurt', ageMonths: 3, label: '猛长期', description: '3月龄猛长期，生长加速期' },
  { id: 'sp4', type: 'teething', ageMonths: 5, label: '出牙期', description: '开始出牙，可能伴随不适，食欲可能受影响' },
  { id: 'sp5', type: 'growthSpurt', ageMonths: 6, label: '猛长期', description: '6月龄猛长期，添加辅食阶段' },
  { id: 'sp6', type: 'illness', ageMonths: 8, label: '生病期', description: '幼儿急疹，发热后体重增长放缓' },
  { id: 'sp7', type: 'teething', ageMonths: 10, label: '出牙期', description: '乳磨牙萌出' },
  { id: 'sp8', type: 'growthSpurt', ageMonths: 12, label: '猛长期', description: '1岁猛长期，学步期能量消耗大' }
]
