import { Router } from 'express'
import { getTradeFlows } from './trade.service'

const tradeRouter = Router()

tradeRouter.get('/flows/:country', (req, res) => {
  const { country } = req.params
  if (!country) {
    return res.status(400).json({ error: 'Country parameter is required' })
  }

  const data = getTradeFlows(country)
  return res.json(data)
})

export default tradeRouter
