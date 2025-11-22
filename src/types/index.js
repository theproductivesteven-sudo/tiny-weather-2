/**
 * Tiny Weather - Type Definitions
 * 
 * JSDoc types for clean separation between logic and UI.
 * These types define the "contract" between the brains and your Figma designs.
 */

// ============================================================================
// CHILD & USER TYPES
// ============================================================================

/**
 * @typedef {Object} Child
 * @property {string} id - Unique identifier
 * @property {string} name - Child's name
 * @property {number} ageMonths - Age in months (for baby/toddler logic)
 * @property {'baby' | 'toddler' | 'preschool' | 'school-age'} ageGroup - Computed age category
 */

/**
 * @typedef {Object} UserPreferences
 * @property {boolean} useCelsius - Temperature unit preference
 * @property {Child[]} children - Array of child profiles
 * @property {{lat: number, lng: number}} location - User's location
 * @property {string} [locationName] - Human-readable location name
 */

// ============================================================================
// WEATHER DATA TYPES (from WeatherNeXT 2 API)
// ============================================================================

/**
 * @typedef {Object} CurrentConditions
 * @property {number} temperature - Temperature in Fahrenheit
 * @property {number} feelsLike - Feels like temperature
 * @property {number} humidity - Humidity percentage (0-100)
 * @property {number} windSpeed - Wind speed in mph
 * @property {number} uvIndex - UV index (0-11+)
 * @property {number} precipitationProbability - Rain chance (0-100)
 * @property {string} condition - Weather condition code
 * @property {string} conditionText - Human-readable condition
 * @property {string} icon - Icon code for condition
 * @property {Date} observationTime - When data was observed
 */

/**
 * @typedef {Object} HourlyForecast
 * @property {Date} time - Hour timestamp
 * @property {number} temperature - Temperature in Fahrenheit
 * @property {number} feelsLike - Feels like temperature
 * @property {number} humidity - Humidity percentage
 * @property {number} precipitationProbability - Rain chance (0-100)
 * @property {number} uvIndex - UV index
 * @property {number} windSpeed - Wind speed in mph
 * @property {string} condition - Weather condition code
 * @property {string} conditionText - Human-readable condition
 */

/**
 * @typedef {Object} DailyForecast
 * @property {Date} date - Day date
 * @property {number} tempHigh - High temperature
 * @property {number} tempLow - Low temperature
 * @property {number} precipitationProbability - Rain chance for day
 * @property {string} condition - Primary weather condition
 * @property {string} conditionText - Human-readable condition
 * @property {number} uvIndexMax - Max UV for the day
 * @property {string} sunrise - Sunrise time
 * @property {string} sunset - Sunset time
 */

/**
 * @typedef {Object} WeatherData
 * @property {CurrentConditions} current - Current conditions
 * @property {HourlyForecast[]} hourly - 12-hour forecast
 * @property {DailyForecast[]} daily - 7-day forecast
 * @property {Date} fetchedAt - When data was fetched
 * @property {Date} expiresAt - When cache expires
 */

// ============================================================================
// OUTFIT RECOMMENDATION TYPES
// ============================================================================

/**
 * @typedef {'base' | 'mid' | 'outer' | 'accessory' | 'footwear'} ClothingLayer
 */

/**
 * @typedef {Object} ClothingItem
 * @property {string} id - Unique identifier
 * @property {string} name - Item name (e.g., "Light jacket")
 * @property {ClothingLayer} layer - Which layer this belongs to
 * @property {string} emoji - Visual representation
 * @property {boolean} required - Is this essential vs optional
 * @property {string} [reason] - Why this is recommended
 */

/**
 * @typedef {Object} OutfitRecommendation
 * @property {string} childId - Which child this is for
 * @property {string} childName - Child's name
 * @property {string} ageGroup - Age category
 * @property {ClothingItem[]} items - Recommended clothing items
 * @property {string[]} tips - Context-specific tips
 * @property {string} summary - One-line summary
 * @property {'cold' | 'cool' | 'comfortable' | 'warm' | 'hot'} tempCategory
 * @property {boolean} needsRainGear - Should pack rain gear
 * @property {boolean} needsSunProtection - High UV day
 * @property {number} morningTemp - Morning temperature
 * @property {number} afternoonTemp - Afternoon temperature
 * @property {number} tempSwing - Temperature change throughout day
 */

// ============================================================================
// ACTIVITY WINDOW TYPES
// ============================================================================

/**
 * @typedef {'perfect' | 'good' | 'fair' | 'skip'} ActivityQuality
 */

/**
 * @typedef {Object} ActivityHour
 * @property {Date} time - Hour timestamp
 * @property {number} temperature - Temperature
 * @property {number} feelsLike - Feels like temp
 * @property {ActivityQuality} quality - How good for outdoor activities
 * @property {number} score - Numeric score (0-100)
 * @property {string} reason - Why this rating
 * @property {number} rainChance - Precipitation probability
 * @property {number} uvIndex - UV index
 * @property {string} emoji - Visual indicator
 */

/**
 * @typedef {Object} ActivityWindow
 * @property {Date} startTime - Window start
 * @property {Date} endTime - Window end
 * @property {ActivityQuality} quality - Overall quality
 * @property {number} avgScore - Average score for window
 * @property {string} label - Human-readable label (e.g., "9am - 11am")
 * @property {string} description - Why this is the rating
 * @property {number} avgTemp - Average temperature
 */

/**
 * @typedef {Object} ActivityAnalysis
 * @property {ActivityHour[]} hours - Hour-by-hour breakdown
 * @property {ActivityWindow[]} windows - Grouped activity windows
 * @property {ActivityWindow | null} bestWindow - Best time to go outside
 * @property {string} daySummary - Overall day assessment
 * @property {boolean} hasGoodWindows - Are there any good outdoor times
 */

// ============================================================================
// SMART TIPS TYPES
// ============================================================================

/**
 * @typedef {'alert' | 'info' | 'tip' | 'warning'} TipType
 */

/**
 * @typedef {'high' | 'medium' | 'low'} TipPriority
 */

/**
 * @typedef {Object} SmartTip
 * @property {string} id - Unique identifier
 * @property {TipType} type - Type of tip
 * @property {TipPriority} priority - How important
 * @property {string} title - Short title
 * @property {string} message - Full tip message
 * @property {string} emoji - Visual indicator
 * @property {string} [actionText] - Optional CTA text
 * @property {string} [category] - Tip category for grouping
 */

/**
 * @typedef {Object} SmartTipsResult
 * @property {SmartTip[]} tips - All generated tips
 * @property {SmartTip | null} primaryTip - Most important tip to show
 * @property {SmartTip[]} alerts - High-priority alerts only
 */

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * @typedef {Object} UseWeatherResult
 * @property {WeatherData | null} data - Weather data
 * @property {boolean} isLoading - Loading state
 * @property {Error | null} error - Any error
 * @property {() => Promise<void>} refresh - Force refresh
 * @property {boolean} isStale - Is data older than cache duration
 * @property {Date | null} lastUpdated - When data was last fetched
 */

/**
 * @typedef {Object} UseOutfitsResult
 * @property {OutfitRecommendation[]} outfits - One per child
 * @property {boolean} isLoading - Loading state
 * @property {Error | null} error - Any error
 */

/**
 * @typedef {Object} UseActivityResult
 * @property {ActivityAnalysis | null} analysis - Full activity analysis
 * @property {boolean} isLoading - Loading state
 * @property {Error | null} error - Any error
 */

/**
 * @typedef {Object} UseTipsResult
 * @property {SmartTipsResult | null} tips - Generated tips
 * @property {boolean} isLoading - Loading state
 * @property {Error | null} error - Any error
 */

/**
 * @typedef {Object} TinyWeatherState
 * @property {WeatherData | null} weather - Raw weather data
 * @property {OutfitRecommendation[]} outfits - Outfit recommendations per child
 * @property {ActivityAnalysis | null} activities - Activity window analysis
 * @property {SmartTipsResult | null} tips - Smart tips
 * @property {boolean} isLoading - Overall loading state
 * @property {Error | null} error - Any error
 * @property {() => Promise<void>} refresh - Force refresh all data
 * @property {Date | null} lastUpdated - When data was last fetched
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * @typedef {Object} WeatherApiConfig
 * @property {string} apiKey - Google Maps Weather API key
 * @property {string} baseUrl - API base URL
 * @property {number} cacheDurationMs - How long to cache (default 30 min)
 * @property {number} hourlyHours - How many hours of forecast (default 12)
 * @property {number} dailyDays - How many days of forecast (default 7)
 */

export const Types = {};
