import request from 'supertest'
import app from '../src/index'

describe('GPS Retailer API', () => {
  const payload = {
    countryCode: 'PK',
    city: 'Lahore',
    outletName: 'Al Madina Store',
    outletType: 'kirana',
    lat: 31.5204,
    lng: 74.3587,
    monthlySales: 1200.5,
    distributorId: 1
  }

  it('saves new retailer telemetry', async () => {
    const response = await request(app).post('/api/gps/retailers').send(payload)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.status).toBe('saved')
  })

  it('fetches retailers for a country', async () => {
    const response = await request(app).get('/api/gps/retailers/PK')
    expect(response.status).toBe(200)
    expect(response.body.countryCode).toBe('PK')
    expect(Array.isArray(response.body.retailers)).toBe(true)
  })
})
