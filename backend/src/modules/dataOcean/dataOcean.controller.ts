import { Router } from 'express'
import { getDataOceanSummary, getDataOceanFlows } from './dataOcean.service'

const dataOceanRouter = Router()

dataOceanRouter.get('/summary/:countryCode', (req, res) => {
  const { countryCode } = req.params
  const summary = getDataOceanSummary(countryCode.toUpperCase())
  return res.json({ countryCode: summary.countryCode, summary })
})

dataOceanRouter.get('/flows/:countryCode', (req, res) => {
  const { countryCode } = req.params
  const flows = getDataOceanFlows(countryCode.toUpperCase())
  return res.json({ countryCode: countryCode.toUpperCase(), flows })
})

export default dataOceanRouter

