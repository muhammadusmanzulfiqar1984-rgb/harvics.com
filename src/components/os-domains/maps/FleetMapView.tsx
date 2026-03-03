'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import GoogleMapComponent from './GoogleMap'

interface EmployeeLocation {
  employee_id: string
  lat: number
  lng: number
  last_update: string
}

export default function FleetMapView() {
  const [employees, setEmployees] = useState<EmployeeLocation[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }) // Dubai default
  const [zoom, setZoom] = useState(10)

  useEffect(() => {
    loadEmployees()
    const interval = setInterval(loadEmployees, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await apiClient.getEmployeesLocations()
      if (response.data) {
        const employees = (response.data as any) || []
        setEmployees(employees)
        if (employees.length > 0) {
          // Center map on first employee
          setMapCenter({ lat: employees[0].lat, lng: employees[0].lng })
        }
      }
    } catch (error) {
      // Error loading employees - will retry on next interval
      console.error('Failed to load employee locations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-black200 px-6 py-4">
        <h1 className="text-2xl font-bold text-black">Fleet Map View</h1>
        <p className="text-sm text-black mt-1">Real-time tracking of sales officers and delivery vehicles</p>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-black200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Active Employees ({employees.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-black mt-2">Loading...</p>
              </div>
            ) : employees.length === 0 ? (
              <p className="text-black text-center py-8">No active employees</p>
            ) : (
              <div className="space-y-2">
                {employees.map((emp) => (
                  <button
                    key={emp.employee_id}
                    onClick={() => {
                      setSelectedEmployee(emp.employee_id)
                      setMapCenter({ lat: emp.lat, lng: emp.lng })
                      setZoom(15)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEmployee === emp.employee_id
                        ? 'border-white bg-white/10'
                        : 'border-black200 hover:border-white/50'
                    }`}
                  >
                    <div className="font-semibold text-black">{emp.employee_id}</div>
                    <div className="text-sm text-black mt-1">
                      {new Date(emp.last_update).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-black mt-1">
                      {emp.lat.toFixed(4)}, {emp.lng.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <GoogleMapComponent
            center={mapCenter}
            zoom={zoom}
            markers={employees.map(emp => ({
              lat: emp.lat,
              lng: emp.lng,
              label: emp.employee_id.charAt(0),
              info: `Employee: ${emp.employee_id}\nLast Update: ${new Date(emp.last_update).toLocaleString()}`
            }))}
            selectedMarker={selectedEmployee ? employees.findIndex(e => e.employee_id === selectedEmployee) : null}
            onMarkerClick={(index) => {
              if (index >= 0 && index < employees.length) {
                setSelectedEmployee(employees[index].employee_id)
                setMapCenter({ lat: employees[index].lat, lng: employees[index].lng })
                setZoom(15)
              } else {
                setSelectedEmployee(null)
              }
            }}
            height="100%"
            mapTypeId="roadmap"
          />
        </div>
      </div>
    </div>
  )
}

