/**
 * Tiny Weather - Main Entry Point
 * 
 * This file exports everything you need to build your Figma-designed UI.
 * 
 * Quick Start:
 * ```jsx
 * import { useTinyWeather } from './lib/tiny-weather';
 * 
 * function App() {
 *   const { weather, outfits, activities, tips, isLoading } = useTinyWeather({
 *     apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
 *     useMockData: true, // For development
 *   });
 *   
 *   if (isLoading) return <YourLoadingComponent />;
 *   
 *   return <YourFigmaDesignedUI data={{ weather, outfits, activities, tips }} />;
 * }
 * ```
 */

// ============================================================================
// HOOKS - The main way to integrate with your UI
// ============================================================================

export {
  // Master hook - use this for most cases
  useTinyWeather,
  
  // Individual hooks if you need more control
  useWeather,
  useOutfits,
  useActivityWindows,
  useSmartTips,
  useGeolocation,
  useChildren,
  
  // Utility hooks for formatting and gestures
  useTemperatureFormatter,
  useTimeFormatter,
  useSwipeGesture,
} from './hooks/index.js';

// ============================================================================
// SERVICES - Low-level access to the brains
// ============================================================================

export {
  createWeatherService,
  getMockWeatherData,
  getCachedWeather,
  setCachedWeather,
  clearWeatherCache,
} from './services/weatherApi.js';

export {
  generateOutfitRecommendation,
  generateAllOutfitRecommendations,
  getTempCategory,
  analyzeDayTemperatures,
} from './services/outfitEngine.js';

export {
  analyzeActivityWindows,
  getActivitySummary,
} from './services/activityCalc.js';

export {
  generateSmartTips,
  getPrimaryTipMessage,
} from './services/smartTips.js';

// ============================================================================
// CONSTANTS - Configuration and thresholds
// ============================================================================

export {
  API_CONFIG,
  TEMP_THRESHOLDS,
  UV_THRESHOLDS,
  RAIN_THRESHOLDS,
  HUMIDITY_THRESHOLDS,
  WIND_THRESHOLDS,
  AGE_GROUPS,
  ACTIVITY_WEIGHTS,
  ACTIVITY_QUALITY_THRESHOLDS,
  TIME_CONFIG,
  WEATHER_CONDITIONS,
  CLOTHING_ITEMS,
  STORAGE_KEYS,
  getAgeGroup,
  getExtraLayers,
  mapCondition,
} from './utils/constants.js';

// ============================================================================
// TYPES - For TypeScript users or documentation
// ============================================================================

// Types are exported via JSDoc in ./types/index.js
// Import like: /** @type {import('./lib/tiny-weather/types').WeatherData} */
