'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface GPSTrackingDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const gpsData = {
  overview: { totalVehicles: 45, activeVehicles: 38, totalRoutes: 156, activeRoutes: 23, coveragePercent: 78, totalRetailers: 1247, trackedRetailers: 972 },
  vehicles: [
    { id: 'VH-001', vehicleNumber: 'HRV-2024-001', driver: 'John Smith', status: 'In Transit', currentLocation: 'Route A - City Center', speed: 45, route: 'Route-001', destination: 'Retailer A', eta: '15 min', lastUpdate: '2 min ago' },
    { id: 'VH-002', vehicleNumber: 'HRV-2024-002', driver: 'Jane Doe', status: 'Delivering', currentLocation: 'Route B - Market District', speed: 0, route: 'Route-002', destination: 'Retailer B', eta: 'Arrived', lastUpdate: '1 min ago' },
    { id: 'VH-003', vehicleNumber: 'HRV-2024-003', driver: 'Mike Johnson', status: 'Returning', currentLocation: 'Route C - Highway', speed: 65, route: 'Route-003', destination: 'Warehouse', eta: '25 min', lastUpdate: '3 min ago' },
    { id: 'VH-004', vehicleNumber: 'HRV-2024-004', driver: 'Sarah Williams', status: 'Parked', currentLocation: 'Warehouse', speed: 0, route: '—', destination: '—', eta: '—', lastUpdate: '10 min ago' }
  ],
  routes: [
    { id: 'RT-001', name: 'North Region Route', distance: 120, duration: 180, status: 'Active', vehicles: 3, deliveries: 12, efficiency: 92, startPoint: 'Warehouse A', endPoint: 'North Hub' },
    { id: 'RT-002', name: 'South Region Route', distance: 95, duration: 150, status: 'Active', vehicles: 2, deliveries: 8, efficiency: 88, startPoint: 'Warehouse A', endPoint: 'South Hub' },
    { id: 'RT-003', name: 'City Center Route', distance: 45, duration: 90, status: 'Active', vehicles: 4, deliveries: 15, efficiency: 95, startPoint: 'Warehouse B', endPoint: 'City Center' },
    { id: 'RT-004', name: 'Market District Route', distance: 60, duration: 120, status: 'Completed', vehicles: 2, deliveries: 10, efficiency: 90, startPoint: 'Warehouse B', endPoint: 'Market District' }
  ],
  warehouses: [
    { id: 'WH-001', name: 'Main Warehouse', location: 'City A', capacity: 10000, currentStock: 7500, coverage: 'North, Central' },
    { id: 'WH-002', name: 'Distribution Hub B', location: 'City B', capacity: 8000, currentStock: 6200, coverage: 'South, East' },
    { id: 'WH-003', name: 'Regional Hub C', location: 'City C', capacity: 6000, currentStock: 4800, coverage: 'West' }
  ],
  analytics: { onTimeDelivery: 94.5, averageDeliveryTime: 2.3, routeEfficiency: 89.2, fuelConsumption: 1250, totalDistance: 15600, coverageGaps: 23 }
}

function GPSOverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Vehicles" value={gpsData.overview.totalVehicles} icon="" />
        <KPICard label="Active Routes" value={gpsData.overview.activeRoutes} icon="️" />
        <KPICard label="Coverage" value={`${gpsData.overview.coveragePercent}%`} icon="" />
        <KPICard label="On-Time Delivery" value={`${gpsData.analytics.onTimeDelivery}%`} icon="⏱️" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">️ Real-Time Map View</h4>
        <div className="bg-[#F5F5F7] h-64 flex items-center justify-center border-2 border-dashed border-[#E5E5EA]/30" style={{ borderRadius: 0 }}>
          <div className="text-center">
            <div className="text-4xl mb-2">️</div>
            <div className="font-semibold text-[#1A1A1A]">Interactive GPS Map</div>
            <div className="text-sm text-[#8E8E93] mt-1">{gpsData.overview.activeVehicles} active vehicles across {gpsData.overview.activeRoutes} routes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VehicleTrackingScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Real-Time Vehicle Tracking</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Vehicle #</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Driver</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Location</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Speed</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Destination</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETA</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Updated</th>
            </tr></thead>
            <tbody>
              {gpsData.vehicles.map((v, i) => (
                <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{v.id}</td>
                  <td className="px-4 py-3 font-mono text-[#8E8E93]">{v.vehicleNumber}</td>
                  <td className="px-4 py-3">{v.driver}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${v.status === 'In Transit' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : v.status === 'Delivering' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : v.status === 'Returning' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{v.status}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{v.currentLocation}</td>
                  <td className="px-4 py-3 text-right">{v.speed} km/h</td>
                  <td className="px-4 py-3">{v.destination}</td>
                  <td className="px-4 py-3">{v.eta}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{v.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RouteManagementScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">️ Route Management</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Distance</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Duration</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Vehicles</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Deliveries</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Efficiency</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Start</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">End</th>
            </tr></thead>
            <tbody>
              {gpsData.routes.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.id}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 text-right">{r.distance} km</td>
                  <td className="px-4 py-3 text-right">{r.duration} min</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${r.status === 'Active' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{r.status}</span></td>
                  <td className="px-4 py-3 text-right">{r.vehicles}</td>
                  <td className="px-4 py-3 text-right">{r.deliveries}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{r.efficiency}%</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{r.startPoint}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{r.endPoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DistributionNetworkScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Warehouses & Distribution Centers</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gpsData.warehouses.map(wh => (
            <div key={wh.id} className="border border-[#E5E5EA]/20 p-4" style={{ borderRadius: 0 }}>
              <div className="font-semibold text-[#1A1A1A] mb-2">{wh.name}</div>
              <div className="text-sm text-[#8E8E93]">Location: {wh.location}</div>
              <div className="text-sm text-[#8E8E93]">Capacity: {wh.capacity.toLocaleString()} units</div>
              <div className="text-sm text-[#8E8E93]">Stock: {wh.currentStock.toLocaleString()} units</div>
              <div className="text-xs text-[#8E8E93] mt-1">Coverage: {wh.coverage}</div>
              <div className="mt-2 w-full bg-[#F5F5F7] h-2" style={{ borderRadius: 0 }}>
                <div className="bg-harvics-burgundy h-2" style={{ width: `${(wh.currentStock / wh.capacity) * 100}%`, borderRadius: 0 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GPSAnalyticsScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="On-Time Delivery" value={`${gpsData.analytics.onTimeDelivery}%`} icon="⏱️" />
        <KPICard label="Avg Delivery Time" value={`${gpsData.analytics.averageDeliveryTime} hrs`} icon="" />
        <KPICard label="Route Efficiency" value={`${gpsData.analytics.routeEfficiency}%`} icon="" />
        <KPICard label="Total Distance" value={`${gpsData.analytics.totalDistance.toLocaleString()} km`} icon="️" />
        <KPICard label="Fuel Consumption" value={`${gpsData.analytics.fuelConsumption.toLocaleString()} L`} icon="" />
        <KPICard label="Coverage Gaps" value={gpsData.analytics.coverageGaps} icon="" />
      </div>
    </div>
  )
}

export default function GPSTrackingDomainContent({ persona, locale }: GPSTrackingDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    { id: 'gps-overview', label: 'GPS Dashboard', icon: '', description: 'Fleet overview, coverage, and real-time map', component: <GPSOverviewScreen />, tier3Screens: [{ id: 'overview', label: 'Overview', icon: '', component: <GPSOverviewScreen /> }] },
    { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: '', description: 'Real-time vehicle location, speed, and ETA', component: <VehicleTrackingScreen />, tier3Screens: [{ id: 'vehicles', label: 'Active Vehicles', icon: '', component: <VehicleTrackingScreen /> }] },
    { id: 'route-management', label: 'Route Management', icon: '️', description: 'Route optimization, efficiency tracking, and coverage', component: <RouteManagementScreen />, tier3Screens: [{ id: 'routes', label: 'Routes', icon: '️', component: <RouteManagementScreen /> }] },
    { id: 'distribution-network', label: 'Distribution Network', icon: '', description: 'Warehouses, distribution centers, and retailer network', component: <DistributionNetworkScreen />, tier3Screens: [{ id: 'network', label: 'Network', icon: '', component: <DistributionNetworkScreen /> }] },
    { id: 'gps-analytics', label: 'Analytics', icon: '', description: 'Delivery performance, fuel efficiency, and coverage analytics', component: <GPSAnalyticsScreen />, tier3Screens: [{ id: 'analytics', label: 'Performance', icon: '', component: <GPSAnalyticsScreen /> }] }
  ]

  return (
    <OSDomainTierStructure
      domainId="gps-tracking"
      domainName="GPS Tracking & Digital Mapping OS"
      tier2Modules={tier2Modules}
      defaultModule="gps-overview"
    />
  )
}
