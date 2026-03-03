/**
 * Weather Service
 * Uses OpenWeatherMap API (FREE tier available)
 * https://openweathermap.org/api
 */

import { request } from 'undici';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number; // Temperature in Celsius
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  main: string; // Main weather condition (Clear, Clouds, Rain, etc.)
  icon: string;
  windSpeed: number;
  windDir: number;
  visibility: number;
  clouds: number;
}

let cachedWeather: Map<string, { data: WeatherData; timestamp: number }> = new Map();
const CACHE_DURATION = 1800000; // 30 minutes in milliseconds

export async function getWeatherByCity(cityName: string, countryCode?: string): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured. Weather data unavailable.');
    return null;
  }

  try {
    const cacheKey = `${cityName}_${countryCode || ''}`;
    const cached = cachedWeather.get(cacheKey);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    const query = countryCode ? `${cityName},${countryCode}` : cityName;
    const url = `${OPENWEATHER_URL}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const response = await request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as any;
      
      const weatherData: WeatherData = {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        windSpeed: data.wind?.speed || 0,
        windDir: data.wind?.deg || 0,
        visibility: data.visibility ? data.visibility / 1000 : 10, // Convert to km
        clouds: data.clouds?.all || 0,
      };

      // Cache the result
      cachedWeather.set(cacheKey, { data: weatherData, timestamp: now });
      
      return weatherData;
    } else {
      const errorBody = await response.body.text();
      console.error(`OpenWeatherMap API error: ${response.statusCode} - ${errorBody}`);
      return cached?.data || null; // Return cached if available
    }
  } catch (error) {
    console.error(`Failed to fetch weather for ${cityName}:`, error);
    const cached = cachedWeather.get(`${cityName}_${countryCode || ''}`);
    return cached?.data || null; // Return cached if available
  }
}

export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured. Weather data unavailable.');
    return null;
  }

  try {
    const cacheKey = `${lat}_${lon}`;
    const cached = cachedWeather.get(cacheKey);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    const url = `${OPENWEATHER_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const response = await request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as any;
      
      const weatherData: WeatherData = {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        windSpeed: data.wind?.speed || 0,
        windDir: data.wind?.deg || 0,
        visibility: data.visibility ? data.visibility / 1000 : 10,
        clouds: data.clouds?.all || 0,
      };

      // Cache the result
      cachedWeather.set(cacheKey, { data: weatherData, timestamp: now });
      
      return weatherData;
    } else {
      const errorBody = await response.body.text();
      console.error(`OpenWeatherMap API error: ${response.statusCode} - ${errorBody}`);
      return cached?.data || null;
    }
  } catch (error) {
    console.error(`Failed to fetch weather for coordinates ${lat}, ${lon}:`, error);
    const cached = cachedWeather.get(`${lat}_${lon}`);
    return cached?.data || null;
  }
}

// Helper to get capital city weather for a country
export async function getCountryWeather(countryCode: string): Promise<WeatherData | null> {
  // Common capital cities by country code
  const capitalCities: Record<string, string> = {
    'PK': 'Islamabad',
    'US': 'Washington',
    'AE': 'Abu Dhabi',
    'SA': 'Riyadh',
    'GB': 'London',
    'FR': 'Paris',
    'DE': 'Berlin',
    'IN': 'New Delhi',
    'CN': 'Beijing',
    'JP': 'Tokyo',
  };

  const city = capitalCities[countryCode.toUpperCase()];
  if (!city) {
    return null;
  }

  return getWeatherByCity(city, countryCode);
}

