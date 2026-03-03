interface TradeFlow {
  hsCode: string
  description: string
  importValueUSD: number
  exportValueUSD: number
}

const hsCatalog: TradeFlow[] = [
  { hsCode: '2202', description: 'Beverages, non-alcoholic', importValueUSD: 0, exportValueUSD: 0 },
  { hsCode: '1704', description: 'Confectionery', importValueUSD: 0, exportValueUSD: 0 },
  { hsCode: '0403', description: 'Yogurt & cultured products', importValueUSD: 0, exportValueUSD: 0 },
  { hsCode: '1905', description: 'Bakery & cereals', importValueUSD: 0, exportValueUSD: 0 },
  { hsCode: '2106', description: 'Food preparations (energy drinks)', importValueUSD: 0, exportValueUSD: 0 }
]

const randomize = (seed: number, multiplier = 1) => {
  return Math.abs(Math.sin(seed * multiplier))
}

export const getTradeFlows = (countryCode: string) => {
  const upper = countryCode.trim().toUpperCase()
  const hsCodes = hsCatalog.map((flow, index) => {
    const importValueUSD = Math.round((randomize(index + upper.length, 1.3) + 0.3) * 80_000_000)
    const exportValueUSD = Math.round((randomize(index + upper.length * 1.1, 1.1) + 0.2) * 55_000_000)
    return {
      hsCode: flow.hsCode,
      description: flow.description,
      importValueUSD,
      exportValueUSD
    }
  })

  return {
    countryCode: upper,
    year: 2023,
    hsCodes
  }
}
