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

// GPS Overview - aggregated dashboard data
gpsRouter.get('/overview/:country', (req, res) => {
  const { country } = req.params;
  const retailers = getRetailersByCountry(country);
  const heatmap = getHeatmapByCountry(country);
  const routes = getDistributorRoutes(country);
  
  return res.json({
    countryCode: country.trim().toUpperCase(),
    totalRetailers: retailers.totalRetailers,
    totalMonthlySales: retailers.totalMonthlySales,
    coverageAreas: heatmap.coverageAreas,
    activeRoutes: routes.length,
    totalVehicles: routes.length, // Each route has a vehicle
    activeWarehouses: Math.ceil(retailers.totalRetailers / 10)
  });
});

// GPS Vehicles - derive from routes
gpsRouter.get('/vehicles/:country', (req, res) => {
  const { country } = req.params;
  const routes = getDistributorRoutes(country);
  
  const vehicles = routes.map((route, idx) => ({
    id: `VH-${country.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
    vehicleNumber: `VH-${idx + 1}`,
    driver: route.distributor || 'Unassigned',
    status: 'active',
    currentLocation: route.path && route.path[0] ? { lat: route.path[0][0], lng: route.path[0][1] } : { lat: 0, lng: 0 },
    routeId: route.routeId
  }));
  
  return res.json({
    countryCode: country.trim().toUpperCase(),
    totalVehicles: vehicles.length,
    vehicles
  });
});

// GPS Warehouses - derive from retailer clusters
gpsRouter.get('/warehouses/:country', (req, res) => {
  const { country } = req.params;
  const retailers = getRetailersByCountry(country);
  
  // Group retailers by city to create warehouse locations
  const cityGroups = new Map<string, typeof retailers.retailers>();
  retailers.retailers.forEach(r => {
    const existing = cityGroups.get(r.city) || [];
    cityGroups.set(r.city, [...existing, r]);
  });
  
  const warehouses = Array.from(cityGroups.entries()).map(([city, retailers], idx) => ({
    id: `WH-${country.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
    name: `${city} Distribution Center`,
    city,
    countryCode: country.trim().toUpperCase(),
    capacity: retailers.length * 1000,
    currentStock: Math.floor(retailers.length * 750),
    coordinates: {
      lat: retailers[0].lat,
      lng: retailers[0].lng
    },
    retailersServed: retailers.length
  }));
  
  return res.json({
    countryCode: country.trim().toUpperCase(),
    totalWarehouses: warehouses.length,
    warehouses
  });
});

// GPS Analytics - performance metrics
gpsRouter.get('/analytics/:country', (req, res) => {
  const { country } = req.params;
  const retailers = getRetailersByCountry(country);
  const routes = getDistributorRoutes(country);
  
  return res.json({
    countryCode: country.trim().toUpperCase(),
    metrics: {
      totalRetailers: retailers.totalRetailers,
      totalMonthlySales: retailers.totalMonthlySales,
      averageSalesPerRetailer: retailers.totalRetailers > 0 
        ? Math.round(retailers.totalMonthlySales / retailers.totalRetailers)
        : 0,
      totalRoutes: routes.length,
      routeEfficiency: routes.length > 0 ? 0.85 : 0, // Mock efficiency
      coveragePercentage: Math.min(95, retailers.totalRetailers * 2)
    },
    topRetailers: retailers.retailers
      .sort((a, b) => b.monthlySales - a.monthlySales)
      .slice(0, 5)
      .map(r => ({
        name: r.outletName,
        city: r.city,
        sales: r.monthlySales,
        type: r.outletType
      }))
  });
});

export default gpsRouter;

