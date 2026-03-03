import { randomUUID } from 'crypto'

type NodeType = 'manufacturer' | 'importer' | 'distributor' | 'retailer'
	export interface GraphNode {
  id: string
  type: NodeType
  name: string
}

export interface GraphEdge {
  from: string
  to: string
  type: 'sells_to' | 'distributes' | 'competes_with'
}

const manufacturerNames = ['Harvics Foods', 'Global Snacks', 'Bluewave Beverages']
const distributorNames = ['Al Noor Distributors', 'Metro Supply', 'Premium Logistics']
const retailerNames = ['City Mart', 'Neighborhood Hub', 'Express Mart']

export const buildGraph = (countryCode: string) => {
  const upper = countryCode.trim().toUpperCase()

  const manufacturers = manufacturerNames.map((name) => ({
    id: randomUUID(),
    type: 'manufacturer' as const,
    name: `${name} ${upper}`
  }))

  const distributors = distributorNames.map((name) => ({
    id: randomUUID(),
    type: 'distributor' as const,
    name: `${name} ${upper}`
  }))

  const retailers = retailerNames.map((name) => ({
    id: randomUUID(),
    type: 'retailer' as const,
    name: `${name} ${upper}`
  }))

  const nodes = [...manufacturers, ...distributors, ...retailers]
  const edges: GraphEdge[] = []

  manufacturers.forEach((manufacturer, idx) => {
    const distributor = distributors[idx % distributors.length]
    edges.push({ from: manufacturer.id, to: distributor.id, type: 'sells_to' })
  })

  distributors.forEach((distributor, idx) => {
    const retailer = retailers[idx % retailers.length]
    edges.push({ from: distributor.id, to: retailer.id, type: 'distributes' })
  })

  return {
    countryCode: upper,
    nodes,
    edges
  }
}
