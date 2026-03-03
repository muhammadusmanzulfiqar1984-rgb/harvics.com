import fs from 'fs'
import path from 'path'

type JsonCache = Record<string, any>

const cache: JsonCache = {}

const loadMockFile = (file: string) => {
  if (!cache[file]) {
    const filePath = path.join(__dirname, 'data', file)
    const contents = fs.readFileSync(filePath, 'utf-8')
    cache[file] = JSON.parse(contents)
  }
  return cache[file]
}

export const mockProvidersEnabled = () => process.env.USE_MOCK_PROVIDERS !== 'false'

export const getMockFxRates = () => loadMockFile('fx.json')

export const getMockPopulation = (countryCode: string) => {
  const data = loadMockFile('population.json')
  return data[countryCode] || null
}

export const getMockGDP = (countryCode: string) => {
  const data = loadMockFile('gdp.json')
  return data[countryCode] || null
}

export const getMockFoodImports = (countryCode: string) => {
  const data = loadMockFile('fnbImports.json')
  return data[countryCode] || null
}

export const getMockWeather = (countryCode: string) => {
  const data = loadMockFile('weather.json')
  return data[countryCode] || null
}

export const getMockMapData = (countryCode: string) => {
  const data = loadMockFile('mapsRouting.json')
  return data[countryCode] || null
}

export const getMockSatelliteData = (countryCode: string) => {
  const data = loadMockFile('satelliteTiles.json')
  return data[countryCode] || null
}

export const getMockLocalizationIntel = (countryCode: string) => {
  const data = loadMockFile('localisationIntel.json')
  return data[countryCode] || null
}

export const getMockDataOcean = (countryCode: string) => {
  const data = loadMockFile('dataOcean.json')
  return data[countryCode] || null
}
