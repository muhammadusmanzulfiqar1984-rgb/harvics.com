import { Router } from 'express'
import { buildWhiteSpaceReport } from './satellite.service'

const satelliteRouter = Router()

satelliteRouter.get('/whitespaces/:country', (req, res) => {
  const { country } = req.params
  if (!country) {
    return res.status(400).json({ error: 'Country parameter is required' })
  }

  const report = buildWhiteSpaceReport(country)
  return res.json(report)
})

export default satelliteRouter
