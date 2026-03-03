import { Router } from 'express'
import { getProcurementMap } from './procurement.service'

const procurementRouter = Router()

procurementRouter.get('/map/:country', (req, res) => {
  const { country } = req.params
  if (!country) {
    return res.status(400).json({ error: 'Country parameter is required' })
  }

  const data = getProcurementMap(country)
  return res.json(data)
})

export default procurementRouter
