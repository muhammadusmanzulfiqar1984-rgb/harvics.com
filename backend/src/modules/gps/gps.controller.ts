import { Router } from 'express';
import { addRetailer, getRetailersByCountry, getHeatmapByCountry, getDistributorRoutes } from './gps.service';
import { CreateRetailerPayload } from './gps.types';

const gpsRouter = Router();

gpsRouter.post('/retailers', (req, res) => {
  const payload = req.body as Partial<CreateRetailerPayload>;

  if (
    !payload?.countryCode ||
    !payload?.city ||
    !payload?.outletName ||
    !payload?.outletType ||
    typeof payload.lat !== 'number' ||
    typeof payload.lng !== 'number' ||
    typeof payload.monthlySales !== 'number'
  ) {
    return res.status(400).json({
      error: 'Invalid payload. Required: countryCode, city, outletName, outletType, lat, lng, monthlySales'
    });
  }

  const retailer = addRetailer(payload as CreateRetailerPayload);
  return res.status(201).json({
    id: retailer.id,
    status: 'saved'
  });
});

gpsRouter.get('/retailers/:country', (req, res) => {
  const { country } = req.params;
  const payload = getRetailersByCountry(country);
  return res.json({
    countryCode: payload.countryCode,
    totalRetailers: payload.totalRetailers,
    totalMonthlySales: payload.totalMonthlySales,
    retailers: payload.retailers
  });
});

gpsRouter.get('/heatmap/:country', (req, res) => {
  const { country } = req.params;
  const heatmap = getHeatmapByCountry(country);
  return res.json(heatmap);
});

gpsRouter.get('/routes/:country', (req, res) => {
  const { country } = req.params;
  const routes = getDistributorRoutes(country);
  return res.json({
    countryCode: country.trim().toUpperCase(),
    routes
  });
});

export default gpsRouter;

