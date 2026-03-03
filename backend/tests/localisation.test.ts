import request from 'supertest'
import app from '../src/index'

describe('Localisation API', () => {
  it('returns country profile for PK', async () => {
    const response = await request(app).get('/api/localisation/country/PK')
    expect(response.status).toBe(200)
    expect(response.body.countryCode).toBe('PK')
    expect(response.body).toHaveProperty('marketScore')
    expect(response.body).toHaveProperty('priceBand')
  })
})
