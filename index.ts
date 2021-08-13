import data from './data/region'
import province from './data/province'

type Region = typeof data
type Province = typeof province

type Entries<T extends object> = {
  [P in keyof T]: [P, T[P]]
}[keyof T]
type Regions = Array<Entries<Region>>

const region = Object.entries(data) as Regions

type ProvinceNames = {
  [P in Province[number][1]]: P extends `${infer One}${infer Two}${string}`
    ? `${One}${Two}`
    : never
}

// type ProvinceByName<O = {}> = {
//   [P in keyof ProvinceNames]: P extends Province[number][1]
//     ? 
//     : never
// }

const sliceName = (x: Province[number]) => x[1].slice(0, 2)
const provinceByName = keyBy(province, sliceName)

const sliceAlias = (x: Province[number]) => x[2]
const provinceByAlias = keyBy(province, sliceAlias)

function keyBy<
  F extends (x: Province[number]) => string
>(collection: Province, f: F) {
  return collection.reduce((acc, x) => {
    acc[f(x)] = x
    return acc
  }, {} as any)
}

export function getAllRegions () {
  return region.map(([code, name]) => ({ code, name }))
}

type GetProvince<T extends object> = {
  [P in keyof T & string]: P extends `${string}0000`
    ? {
      code: P,
      name: T[P]
    }
    : never
}
type Provinces = GetProvince<Region>[keyof Region]

export function getProvinces (): Provinces {
  return region.filter(([code]) => code.endsWith('0000')).map(([code, name]) => ({ code, name })) as any
}

export function getCodeByProvinceName (name: string): string | null {
  const alias = name.slice(0, 2)
  return provinceByAlias[alias]?.[0] || provinceByName[alias]?.[0] || null
}

export function getPrefectures (provinceCode?: string) {
  return region
    // 最后两位是 00，而中间两位不是 00 的是为地级行政区
    .filter(([code]) => code.endsWith('00') && code.slice(2, 4) !== '00')
    .filter(([code]) => provinceCode ? code.slice(0, 2) === provinceCode.slice(0, 2) : true)
    .map(([code, name]) => ({ code, name }))
}

export function getCounties (regionCode?: string) {
  return region
    .filter(([code]) => !code.endsWith('00'))
    .filter(([code]) => {
      if (!regionCode) {
        return true
      }
      if (regionCode.slice(2, 4) === '00') {
        return code.slice(0, 2) ===regionCode.slice(0, 2)
      }
      return code.slice(0, 4) ===regionCode.slice(0, 4)
    })
    .map(([code, name]) => ({ code, name }))
}

// 省管市
export function getSpecialCounties (regionCode?: string) {
  return region
    // 省管市中间区号为 00
    .filter(([code]) => !code.endsWith('00') && code.slice(2, 4) === '90')
    .filter(([code]) => {
      if (!regionCode) {
        return true
      }
      if (regionCode.slice(2, 4) === '00') {
        return code.slice(0, 2) ===regionCode.slice(0, 2)
      }
      return code.slice(0, 4) ===regionCode.slice(0, 4)
    })
    .map(([code, name]) => ({ code, name }))
}

export function info<T extends keyof Region> (code: T) {
  const provinceCode = code.slice(0, 2) + '0000' as T extends `${infer One}${infer Two}${string}`
    ? `${One}${Two}0000`
    : never
  const prefectureCode = code.slice(0, 4) + '00' as T extends `${infer One}${infer Two}${infer Three}${infer Four}${string}`
    ? `${One}${Two}${Three}${Four}00` extends keyof Region
      ? `${One}${Two}${Three}${Four}00`
      : never
    : never
  const name = data[code]
  if (!name) { return null }
  return {
    name,
    code,
    prefecture: data[prefectureCode] || null,
    province: data[provinceCode] || null
  } 
}
