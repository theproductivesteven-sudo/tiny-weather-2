/**
 * Tiny Weather - Weather API Service
 * 
 * Handles all communication with Google Weather API (WeatherNeXT 2).
 * Features:
 * - Fetches current, hourly, and daily forecasts
 * - Caches responses for 30 minutes
 * - Transforms API responses into app-ready data
 * - Graceful error handling with retries
 */

import { API_CONFIG, STORAGE_KEYS, mapCondition, WEATHER_CONDITIONS } from '../utils/constants.js';

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Get cached weather data if still valid
 * @param {string} cacheKey 
 * @returns {import('../types/index.js').WeatherData | null}
 */
export function getCachedWeather(cacheKey = STORAGE_KEYS.WEATHER_CACHE) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const expiresAt = new Date(data.expiresAt);
    
    if (expiresAt > new Date()) {
      // Rehydrate dates
      return {
        ...data,
        fetchedAt: new Date(data.fetchedAt),
        expiresAt: new Date(data.expiresAt),
        current: {
          ...data.current,
          observationTime: new Date(data.current.observationTime),
        },
        hourly: data.hourly.map(h => ({
          ...h,
          time: new Date(h.time),
        })),
        daily: data.daily.map(d => ({
          ...d,
          date: new Date(d.date),
        })),
      };
    }
    
    // Cache expired
    localStorage.removeItem(cacheKey);
    return null;
  } catch (e) {
    console.warn('Cache read error:', e);
    return null;
  }
}

/**
 * Save weather data to cache
 * @param {import('../types/index.js').WeatherData} data 
 * @param {string} cacheKey 
 */
export function setCachedWeather(data, cacheKey = STORAGE_KEYS.WEATHER_CACHE) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

/**
 * Clear weather cache
 */
export function clearWeatherCache() {
  localStorage.removeItem(STORAGE_KEYS.WEATHER_CACHE);
}

// ============================================================================
// API UTILITIES
// ============================================================================

/**
 * Sleep for retry delays
 * @param {number} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 * @param {string} url 
 * @param {RequestInit} options 
 * @param {number} retries 
 */
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.RETRY_ATTEMPTS) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error ${response.status}: ${errorBody}`);
      }
      
      return response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Fetch attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        await sleep(API_CONFIG.RETRY_DELAY_MS * (i + 1));
      }
    }
  }
  
  throw lastError;
}

// ============================================================================
// API RESPONSE TRANSFORMERS
// ============================================================================

/**
 * Transform current conditions API response
 * @param {Object} apiResponse 
 * @returns {import('../types/index.js').CurrentConditions}
 */
function transformCurrentConditions(apiResponse) {
  const current = apiResponse.currentConditions || apiResponse;
  
  return {
    temperature: celsiusToFahrenheit(current.temperature?.degrees || current.temperature),
    feelsLike: celsiusToFahrenheit(current.apparentTemperature?.degrees || current.feelsLike || current.temperature?.degrees),
    humidity: current.humidity?.percent || current.humidity || 50,
    windSpeed: mpsToMph(current.wind?.speed?.value || current.windSpeed || 0),
    uvIndex: current.uvIndex?.index || current.uvIndex || 0,
    precipitationProbability: current.precipitationProbability?.percent || current.precipitationProbability || 0,
    condition: mapCondition(current.weatherCondition || current.condition || 'CLEAR'),
    conditionText: WEATHER_CONDITIONS[mapCondition(current.weatherCondition || current.condition || 'CLEAR')].label,
    icon: current.iconCode || 'clear',
    observationTime: new Date(current.observationTime || current.dateTime || Date.now()),
  };
}

/**
 * Transform hourly forecast API response
 * @param {Object} apiResponse 
 * @param {number} hours - How many hours to return
 * @returns {import('../types/index.js').HourlyForecast[]}
 */
function transformHourlyForecast(apiResponse, hours = API_CONFIG.HOURLY_HOURS) {
  const hourlyData = apiResponse.hourlyForecasts || apiResponse.hourly || [];
  
  return hourlyData.slice(0, hours).map(hour => {
    const conditionCode = mapCondition(hour.weatherCondition || hour.condition || 'CLEAR');
    
    return {
      time: new Date(hour.interval?.startTime || hour.dateTime || hour.time),
      temperature: celsiusToFahrenheit(hour.temperature?.degrees || hour.temperature),
      feelsLike: celsiusToFahrenheit(hour.apparentTemperature?.degrees || hour.feelsLike || hour.temperature?.degrees),
      humidity: hour.humidity?.percent || hour.humidity || 50,
      precipitationProbability: hour.precipitationProbability?.percent || hour.precipitationProbability || 0,
      uvIndex: hour.uvIndex?.index || hour.uvIndex || 0,
      windSpeed: mpsToMph(hour.wind?.speed?.value || hour.windSpeed || 0),
      condition: conditionCode,
      conditionText: WEATHER_CONDITIONS[conditionCode].label,
    };
  });
}

/**
 * Transform daily forecast API response
 * @param {Object} apiResponse 
 * @param {number} days - How many days to return
 * @returns {import('../types/index.js').DailyForecast[]}
 */
function transformDailyForecast(apiResponse, days = API_CONFIG.DAILY_DAYS) {
  const dailyData = apiResponse.dailyForecasts || apiResponse.daily || [];
  
  return dailyData.slice(0, days).map(day => {
    const conditionCode = mapCondition(day.weatherCondition || day.condition || 'CLEAR');
    
    return {
      date: new Date(day.interval?.startTime || day.dateTime || day.date),
      tempHigh: celsiusToFahrenheit(day.temperature?.max?.degrees || day.maxTemperature || day.tempHigh),
      tempLow: celsiusToFahrenheit(day.temperature?.min?.degrees || day.minTemperature || day.tempLow),
      precipitationProbability: day.precipitationProbability?.percent || day.precipitationProbability || 0,
      condition: conditionCode,
      conditionText: WEATHER_CONDITIONS[conditionCode].label,
      uvIndexMax: day.uvIndex?.max?.index || day.uvIndexMax || 0,
      sunrise: day.sun?.rise || day.sunrise || '',
      sunset: day.sun?.set || day.sunset || '',
    };
  });
}

// ============================================================================
// UNIT CONVERSIONS
// ============================================================================

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius 
 * @returns {number}
 */
function celsiusToFahrenheit(celsius) {
  if (typeof celsius !== 'number' || isNaN(celsius)) return 70; // Default
  return Math.round((celsius * 9/5) + 32);
}

/**
 * Convert meters per second to mph
 * @param {number} mps 
 * @returns {number}
 */
function mpsToMph(mps) {
  if (typeof mps !== 'number' || isNaN(mps)) return 0;
  return Math.round(mps * 2.237);
}

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

/**
 * Create the weather API service
 * @param {string} apiKey - Google Maps Weather API key
 * @returns {WeatherApiService}
 */
export function createWeatherService(apiKey) {
  const baseUrl = API_CONFIG.BASE_URL;
  
  return {
    /**
     * Fetch current weather conditions
     * @param {number} lat 
     * @param {number} lng 
     */
    async fetchCurrentConditions(lat, lng) {
      const url = `${baseUrl}/currentConditions:lookup?key=${apiKey}`;
      const body = {
        location: { latitude: lat, longitude: lng },
        unitsSystem: 'METRIC', // We'll convert to Fahrenheit
      };
      
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      return transformCurrentConditions(response);
    },
    
    /**
     * Fetch hourly forecast
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} hours 
     */
    async fetchHourlyForecast(lat, lng, hours = API_CONFIG.HOURLY_HOURS) {
      const url = `${baseUrl}/forecast/hours:lookup?key=${apiKey}`;
      const body = {
        location: { latitude: lat, longitude: lng },
        hours: hours,
        unitsSystem: 'METRIC',
      };
      
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      return transformHourlyForecast(response, hours);
    },
    
    /**
     * Fetch daily forecast
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} days 
     */
    async fetchDailyForecast(lat, lng, days = API_CONFIG.DAILY_DAYS) {
      const url = `${baseUrl}/forecast/days:lookup?key=${apiKey}`;
      const body = {
        location: { latitude: lat, longitude: lng },
        days: days,
        unitsSystem: 'METRIC',
      };
      
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      return transformDailyForecast(response, days);
    },
    
    /**
     * Fetch all weather data (current + hourly + daily)
     * @param {number} lat 
     * @param {number} lng 
     * @param {Object} options
     * @param {boolean} [options.useCache=true] - Use cached data if available
     * @param {boolean} [options.forceRefresh=false] - Ignore cache
     * @returns {Promise<import('../types/index.js').WeatherData>}
     */
    async fetchAllWeather(lat, lng, { useCache = true, forceRefresh = false } = {}) {
      // Check cache first
      if (useCache && !forceRefresh) {
        const cached = getCachedWeather();
        if (cached) {
          console.log('Using cached weather data');
          return cached;
        }
      }
      
      // Fetch all data in parallel
      const [current, hourly, daily] = await Promise.all([
        this.fetchCurrentConditions(lat, lng),
        this.fetchHourlyForecast(lat, lng),
        this.fetchDailyForecast(lat, lng),
      ]);
      
      const now = new Date();
      const weatherData = {
        current,
        hourly,
        daily,
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + API_CONFIG.CACHE_DURATION_MS),
      };
      
      // Cache the result
      if (useCache) {
        setCachedWeather(weatherData);
      }
      
      return weatherData;
    },
  };
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

/**
 * Generate realistic mock weather data for development/testing
 * @returns {import('../types/index.js').WeatherData}
 */
export function getMockWeatherData() {
  const now = new Date();
  const baseTemp = 65; // Base temperature
  
  // Generate hourly data with realistic patterns
  const hourly = [];
  for (let i = 0; i < 12; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourOfDay = hour.getHours();
    
    // Temperature curve: cooler morning, peaks afternoon
    let tempOffset = 0;
    if (hourOfDay < 8) tempOffset = -8;
    else if (hourOfDay < 12) tempOffset = (hourOfDay - 8) * 2;
    else if (hourOfDay < 16) tempOffset = 8;
    else tempOffset = 8 - (hourOfDay - 16) * 2;
    
    const temp = baseTemp + tempOffset + (Math.random() * 4 - 2);
    
    hourly.push({
      time: hour,
      temperature: Math.round(temp),
      feelsLike: Math.round(temp - 2),
      humidity: Math.round(50 + Math.random() * 30),
      precipitationProbability: hourOfDay >= 14 && hourOfDay <= 17 ? 40 : 10,
      uvIndex: hourOfDay >= 10 && hourOfDay <= 14 ? 7 : hourOfDay >= 8 && hourOfDay <= 16 ? 4 : 1,
      windSpeed: Math.round(5 + Math.random() * 10),
      condition: 'PARTLY_CLOUDY',
      conditionText: 'Partly Cloudy',
    });
  }
  
  // Generate daily data
  const daily = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    daily.push({
      date: day,
      tempHigh: Math.round(baseTemp + 10 + (Math.random() * 6 - 3)),
      tempLow: Math.round(baseTemp - 5 + (Math.random() * 4 - 2)),
      precipitationProbability: Math.round(Math.random() * 40),
      condition: ['CLEAR', 'MOSTLY_CLEAR', 'PARTLY_CLOUDY', 'CLOUDY'][Math.floor(Math.random() * 4)],
      conditionText: 'Variable',
      uvIndexMax: 6 + Math.floor(Math.random() * 3),
      sunrise: '6:45 AM',
      sunset: '7:30 PM',
    });
  }
  
  return {
    current: {
      temperature: Math.round(baseTemp + 3),
      feelsLike: Math.round(baseTemp + 1),
      humidity: 55,
      windSpeed: 8,
      uvIndex: 5,
      precipitationProbability: 15,
      condition: 'PARTLY_CLOUDY',
      conditionText: 'Partly Cloudy',
      icon: 'partly_cloudy',
      observationTime: now,
    },
    hourly,
    daily,
    fetchedAt: now,
    expiresAt: new Date(now.getTime() + API_CONFIG.CACHE_DURATION_MS),
  };
}

/**
 * @typedef {ReturnType<typeof createWeatherService>} WeatherApiService
 */
