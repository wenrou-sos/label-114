import type { VaccineSchedule } from '../types'

export const nationalImmunizationSchedule: VaccineSchedule[] = [
  { id: 'bcg-1', vaccineId: 'bcg', vaccineName: '卡介苗', shortName: '卡介苗', ageMonths: 0, dose: 1, totalDoses: 1, description: '预防结核病' },
  { id: 'hepb-1', vaccineId: 'hepb', vaccineName: '乙肝疫苗', shortName: '乙肝', ageMonths: 0, dose: 1, totalDoses: 3, description: '预防乙型肝炎' },
  { id: 'hepb-2', vaccineId: 'hepb', vaccineName: '乙肝疫苗', shortName: '乙肝', ageMonths: 1, dose: 2, totalDoses: 3 },
  { id: 'ipv-1', vaccineId: 'ipv', vaccineName: '脊髓灰质炎灭活疫苗', shortName: '脊灰', ageMonths: 2, dose: 1, totalDoses: 4, description: '预防脊髓灰质炎（小儿麻痹）' },
  { id: 'ipv-2', vaccineId: 'ipv', vaccineName: '脊髓灰质炎灭活疫苗', shortName: '脊灰', ageMonths: 3, dose: 2, totalDoses: 4 },
  { id: 'dtap-1', vaccineId: 'dtap', vaccineName: '百白破疫苗', shortName: '百白破', ageMonths: 3, dose: 1, totalDoses: 4, description: '预防百日咳、白喉、破伤风' },
  { id: 'bopv-3', vaccineId: 'bopv', vaccineName: '脊髓灰质炎减毒活疫苗', shortName: '脊灰', ageMonths: 4, dose: 3, totalDoses: 4 },
  { id: 'dtap-2', vaccineId: 'dtap', vaccineName: '百白破疫苗', shortName: '百白破', ageMonths: 4, dose: 2, totalDoses: 4 },
  { id: 'dtap-3', vaccineId: 'dtap', vaccineName: '百白破疫苗', shortName: '百白破', ageMonths: 5, dose: 3, totalDoses: 4 },
  { id: 'hepb-3', vaccineId: 'hepb', vaccineName: '乙肝疫苗', shortName: '乙肝', ageMonths: 6, dose: 3, totalDoses: 3 },
  { id: 'mcv-a1', vaccineId: 'mcv-a', vaccineName: 'A群流脑多糖疫苗', shortName: 'A群流脑', ageMonths: 6, dose: 1, totalDoses: 2, description: '预防A群流行性脑脊髓膜炎' },
  { id: 'je-1', vaccineId: 'je', vaccineName: '乙脑减毒活疫苗', shortName: '乙脑', ageMonths: 8, dose: 1, totalDoses: 2, description: '预防流行性乙型脑炎' },
  { id: 'mmr-1', vaccineId: 'mmr', vaccineName: '麻腮风疫苗', shortName: '麻腮风', ageMonths: 8, dose: 1, totalDoses: 2, description: '预防麻疹、腮腺炎、风疹' },
  { id: 'mcv-a2', vaccineId: 'mcv-a', vaccineName: 'A群流脑多糖疫苗', shortName: 'A群流脑', ageMonths: 9, dose: 2, totalDoses: 2 },
  { id: 'dtap-4', vaccineId: 'dtap', vaccineName: '百白破疫苗', shortName: '百白破', ageMonths: 18, dose: 4, totalDoses: 4 },
  { id: 'mmr-2', vaccineId: 'mmr', vaccineName: '麻腮风疫苗', shortName: '麻腮风', ageMonths: 18, dose: 2, totalDoses: 2 },
  { id: 'hepa', vaccineId: 'hepa', vaccineName: '甲肝减毒活疫苗', shortName: '甲肝', ageMonths: 18, dose: 1, totalDoses: 1, description: '预防甲型肝炎' },
  { id: 'je-2', vaccineId: 'je', vaccineName: '乙脑减毒活疫苗', shortName: '乙脑', ageMonths: 24, dose: 2, totalDoses: 2 },
  { id: 'mcv-ac1', vaccineId: 'mcv-ac', vaccineName: 'A群C群流脑多糖疫苗', shortName: 'A+C群流脑', ageMonths: 36, dose: 1, totalDoses: 2, description: '预防A群和C群流行性脑脊髓膜炎' },
  { id: 'bopv-4', vaccineId: 'bopv', vaccineName: '脊髓灰质炎减毒活疫苗', shortName: '脊灰', ageMonths: 48, dose: 4, totalDoses: 4 },
  { id: 'mcv-ac2', vaccineId: 'mcv-ac', vaccineName: 'A群C群流脑多糖疫苗', shortName: 'A+C群流脑', ageMonths: 72, dose: 2, totalDoses: 2 },
  { id: 'dt', vaccineId: 'dt', vaccineName: '白破二联疫苗', shortName: '白破', ageMonths: 72, dose: 1, totalDoses: 1, description: '预防白喉、破伤风' }
]
