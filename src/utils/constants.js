/**
 * Tiny Weather - Constants & Configuration
 * 
 * All configurable values in one place.
 * Adjust these to tune the recommendation logic.
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: 'https://weather.googleapis.com/v1',
  CACHE_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  HOURLY_HOURS: 12,
  DAILY_DAYS: 7,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
};

// ============================================================================
// TEMPERATURE THRESHOLDS (Fahrenheit)
// ============================================================================

export const TEMP_THRESHOLDS = {
  // Core comfort zones
  FREEZING: 32,
  VERY_COLD: 40,
  COLD: 50,
  COOL: 60,
  COMFORTABLE_LOW: 65,
  COMFORTABLE_HIGH: 75,
  WARM: 80,
  HOT: 85,
  VERY_HOT: 90,
  DANGEROUS: 95,
  
  // Activity-specific
  TOO_COLD_FOR_PLAYGROUND: 45,
  IDEAL_OUTDOOR_LOW: 60,
  IDEAL_OUTDOOR_HIGH: 75,
  
  // Baby-specific (more sensitive)
  BABY_EXTRA_LAYER_BELOW: 65,
  BABY_TOO_COLD: 50,
  BABY_TOO_HOT: 85,
};

// ============================================================================
// UV INDEX THRESHOLDS
// ============================================================================

export const UV_THRESHOLDS = {
  LOW: 2,
  MODERATE: 5,
  HIGH: 7,
  VERY_HIGH: 10,
  EXTREME: 11,
  
  // Recommendations
  SUNSCREEN_NEEDED: 3,
  HAT_NEEDED: 6,
  AVOID_MIDDAY: 8,
  LIMIT_EXPOSURE: 10,
};

// ============================================================================
// RAIN PROBABILITY THRESHOLDS
// ============================================================================

export const RAIN_THRESHOLDS = {
  UNLIKELY: 10,
  SLIGHT_CHANCE: 20,
  POSSIBLE: 30,
  LIKELY: 50,
  VERY_LIKELY: 70,
  ALMOST_CERTAIN: 90,
  
  // Recommendations
  PACK_UMBRELLA: 30,
  RAIN_BOOTS_NEEDED: 50,
  AVOID_OUTDOOR: 70,
};

// ============================================================================
// HUMIDITY THRESHOLDS
// ============================================================================

export const HUMIDITY_THRESHOLDS = {
  VERY_DRY: 20,
  DRY: 30,
  COMFORTABLE_LOW: 40,
  COMFORTABLE_HIGH: 60,
  HUMID: 70,
  VERY_HUMID: 80,
  OPPRESSIVE: 90,
};

// ============================================================================
// WIND THRESHOLDS (mph)
// ============================================================================

export const WIND_THRESHOLDS = {
  CALM: 5,
  LIGHT: 10,
  MODERATE: 15,
  BREEZY: 20,
  WINDY: 25,
  VERY_WINDY: 35,
  HIGH_WIND: 45,
};

// ============================================================================
// AGE GROUP DEFINITIONS
// ============================================================================

export const AGE_GROUPS = {
  BABY: { maxMonths: 12, label: 'baby', extraLayers: 1 },
  TODDLER: { maxMonths: 36, label: 'toddler', extraLayers: 0.5 },
  PRESCHOOL: { maxMonths: 60, label: 'preschool', extraLayers: 0 },
  SCHOOL_AGE: { maxMonths: 144, label: 'school-age', extraLayers: 0 },
};

/**
 * Get age group from months
 * @param {number} ageMonths 
 * @returns {'baby' | 'toddler' | 'preschool' | 'school-age'}
 */
export function getAgeGroup(ageMonths) {
  if (ageMonths <= AGE_GROUPS.BABY.maxMonths) return 'baby';
  if (ageMonths <= AGE_GROUPS.TODDLER.maxMonths) return 'toddler';
  if (ageMonths <= AGE_GROUPS.PRESCHOOL.maxMonths) return 'preschool';
  return 'school-age';
}

/**
 * Get extra layers needed for age
 * @param {number} ageMonths 
 * @returns {number}
 */
export function getExtraLayers(ageMonths) {
  if (ageMonths <= AGE_GROUPS.BABY.maxMonths) return AGE_GROUPS.BABY.extraLayers;
  if (ageMonths <= AGE_GROUPS.TODDLER.maxMonths) return AGE_GROUPS.TODDLER.extraLayers;
  return 0;
}

// ============================================================================
// ACTIVITY SCORING WEIGHTS
// ============================================================================

export const ACTIVITY_WEIGHTS = {
  TEMPERATURE: 0.35,
  RAIN_CHANCE: 0.30,
  UV_INDEX: 0.15,
  HUMIDITY: 0.10,
  WIND: 0.10,
};

export const ACTIVITY_QUALITY_THRESHOLDS = {
  PERFECT: 85,
  GOOD: 70,
  FAIR: 50,
  // Below 50 = skip
};

// ============================================================================
// TIME CONFIGURATIONS
// ============================================================================

export const TIME_CONFIG = {
  // Typical parent schedule windows
  MORNING_START: 6,
  MORNING_END: 9,
  MIDDAY_START: 11,
  MIDDAY_END: 14,
  AFTERNOON_START: 14,
  AFTERNOON_END: 18,
  
  // School-related
  DROPOFF_HOUR: 8,
  PICKUP_HOUR: 15,
  
  // Activity windows to analyze
  OUTDOOR_HOURS_START: 7,
  OUTDOOR_HOURS_END: 19,
};

// ============================================================================
// CONDITION MAPPINGS
// ============================================================================

export const WEATHER_CONDITIONS = {
  CLEAR: { emoji: '☀️', label: 'Clear', isGood: true },
  MOSTLY_CLEAR: { emoji: '🌤️', label: 'Mostly Clear', isGood: true },
  PARTLY_CLOUDY: { emoji: '⛅', label: 'Partly Cloudy', isGood: true },
  CLOUDY: { emoji: '☁️', label: 'Cloudy', isGood: true },
  OVERCAST: { emoji: '🌥️', label: 'Overcast', isGood: true },
  FOG: { emoji: '🌫️', label: 'Foggy', isGood: false },
  LIGHT_RAIN: { emoji: '🌦️', label: 'Light Rain', isGood: false },
  RAIN: { emoji: '🌧️', label: 'Rain', isGood: false },
  HEAVY_RAIN: { emoji: '⛈️', label: 'Heavy Rain', isGood: false },
  THUNDERSTORM: { emoji: '⛈️', label: 'Thunderstorm', isGood: false },
  SNOW: { emoji: '🌨️', label: 'Snow', isGood: false },
  SLEET: { emoji: '🌨️', label: 'Sleet', isGood: false },
  HAIL: { emoji: '🌨️', label: 'Hail', isGood: false },
  WINDY: { emoji: '💨', label: 'Windy', isGood: false },
};

/**
 * Map API condition code to our condition
 * @param {string} apiCondition 
 * @returns {keyof typeof WEATHER_CONDITIONS}
 */
export function mapCondition(apiCondition) {
  const normalized = (apiCondition || '').toUpperCase().replace(/[^A-Z]/g, '_');
  
  if (normalized.includes('THUNDER')) return 'THUNDERSTORM';
  if (normalized.includes('HEAVY_RAIN') || normalized.includes('DOWNPOUR')) return 'HEAVY_RAIN';
  if (normalized.includes('RAIN') || normalized.includes('DRIZZLE') || normalized.includes('SHOWER')) {
    return normalized.includes('LIGHT') ? 'LIGHT_RAIN' : 'RAIN';
  }
  if (normalized.includes('SNOW') || normalized.includes('FLURR')) return 'SNOW';
  if (normalized.includes('SLEET') || normalized.includes('ICE')) return 'SLEET';
  if (normalized.includes('HAIL')) return 'HAIL';
  if (normalized.includes('FOG') || normalized.includes('MIST')) return 'FOG';
  if (normalized.includes('OVERCAST')) return 'OVERCAST';
  if (normalized.includes('CLOUD')) {
    if (normalized.includes('PARTLY')) return 'PARTLY_CLOUDY';
    return 'CLOUDY';
  }
  if (normalized.includes('CLEAR')) {
    if (normalized.includes('MOSTLY')) return 'MOSTLY_CLEAR';
    return 'CLEAR';
  }
  if (normalized.includes('SUNNY') || normalized.includes('FAIR')) return 'CLEAR';
  
  return 'PARTLY_CLOUDY'; // Default
}

// ============================================================================
// CLOTHING ITEMS DATABASE
// ============================================================================

export const CLOTHING_ITEMS = {
  // Base layers
  ONESIE: { id: 'onesie', name: 'Onesie', layer: 'base', emoji: '👶' },
  TSHIRT: { id: 'tshirt', name: 'T-shirt', layer: 'base', emoji: '👕' },
  LONG_SLEEVE: { id: 'long-sleeve', name: 'Long sleeve shirt', layer: 'base', emoji: '👔' },
  TANK_TOP: { id: 'tank', name: 'Tank top', layer: 'base', emoji: '🎽' },
  
  // Bottoms
  SHORTS: { id: 'shorts', name: 'Shorts', layer: 'base', emoji: '🩳' },
  PANTS: { id: 'pants', name: 'Pants', layer: 'base', emoji: '👖' },
  LEGGINGS: { id: 'leggings', name: 'Leggings', layer: 'base', emoji: '🦵' },
  
  // Mid layers
  LIGHT_SWEATER: { id: 'light-sweater', name: 'Light sweater', layer: 'mid', emoji: '🧥' },
  FLEECE: { id: 'fleece', name: 'Fleece jacket', layer: 'mid', emoji: '🧥' },
  HOODIE: { id: 'hoodie', name: 'Hoodie', layer: 'mid', emoji: '🧥' },
  
  // Outer layers
  LIGHT_JACKET: { id: 'light-jacket', name: 'Light jacket', layer: 'outer', emoji: '🧥' },
  RAIN_JACKET: { id: 'rain-jacket', name: 'Rain jacket', layer: 'outer', emoji: '🌧️' },
  WINTER_COAT: { id: 'winter-coat', name: 'Winter coat', layer: 'outer', emoji: '🧥' },
  PUFFER: { id: 'puffer', name: 'Puffer jacket', layer: 'outer', emoji: '🧥' },
  
  // Footwear
  SANDALS: { id: 'sandals', name: 'Sandals', layer: 'footwear', emoji: '🩴' },
  SNEAKERS: { id: 'sneakers', name: 'Sneakers', layer: 'footwear', emoji: '👟' },
  BOOTS: { id: 'boots', name: 'Boots', layer: 'footwear', emoji: '🥾' },
  RAIN_BOOTS: { id: 'rain-boots', name: 'Rain boots', layer: 'footwear', emoji: '🥾' },
  WINTER_BOOTS: { id: 'winter-boots', name: 'Winter boots', layer: 'footwear', emoji: '🥾' },
  
  // Accessories
  SUN_HAT: { id: 'sun-hat', name: 'Sun hat', layer: 'accessory', emoji: '👒' },
  WINTER_HAT: { id: 'winter-hat', name: 'Winter hat', layer: 'accessory', emoji: '🧢' },
  SUNGLASSES: { id: 'sunglasses', name: 'Sunglasses', layer: 'accessory', emoji: '🕶️' },
  SUNSCREEN: { id: 'sunscreen', name: 'Sunscreen', layer: 'accessory', emoji: '🧴' },
  MITTENS: { id: 'mittens', name: 'Mittens', layer: 'accessory', emoji: '🧤' },
  GLOVES: { id: 'gloves', name: 'Gloves', layer: 'accessory', emoji: '🧤' },
  SCARF: { id: 'scarf', name: 'Scarf', layer: 'accessory', emoji: '🧣' },
  UMBRELLA: { id: 'umbrella', name: 'Umbrella', layer: 'accessory', emoji: '☂️' },
};

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  WEATHER_CACHE: 'tinyweather_cache',
  USER_PREFERENCES: 'tinyweather_prefs',
  CHILDREN: 'tinyweather_children',
  LAST_LOCATION: 'tinyweather_location',
};
