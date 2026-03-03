import { Router } from 'express'
import { buildGraph } from './graph.service'

const graphRouter = Router()

graphRouter.get('/:country', (req, res) => {
  const { country } = req.params
  if (!country) {
    return res.status(400).json({ error: 'Country parameter is required' })
  }

  const data = buildGraph(country)
  return res.json(data)
})

export default graphRouter
