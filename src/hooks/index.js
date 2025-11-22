/**
 * Tiny Weather - React Hooks
 * 
 * These hooks connect the brains (services) to your Figma UI.
 * They handle loading states, error handling, and data transformation.
 * 
 * Usage in your components:
 * const { weather, outfits, activities, tips, isLoading } = useTinyWeather();
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createWeatherService, getMockWeatherData, getCachedWeather } from '../services/weatherApi.js';
import { generateAllOutfitRecommendations } from '../services/outfitEngine.js';
import { analyzeActivityWindows } from '../services/activityCalc.js';
import { generateSmartTips } from '../services/smartTips.js';
import { STORAGE_KEYS, getAgeGroup } from '../utils/constants.js';

// ============================================================================
// GEOLOCATION HOOK
// ============================================================================

/**
 * Hook to get user's location
 * @returns {{location: {lat: number, lng: number} | null, error: Error | null, isLoading: boolean}}
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get cached location first
    const cached = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setLocation(parsed);
        setIsLoading(false);
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Get fresh location
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(loc);
        setIsLoading(false);
        localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(loc));
      },
      (err) => {
        setError(new Error(`Location error: ${err.message}`));
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, error, isLoading };
}

// ============================================================================
// CHILDREN MANAGEMENT HOOK
// ============================================================================

/**
 * Hook to manage children profiles
 * @returns {{
 *   children: import('../types/index.js').Child[],
 *   addChild: (name: string, ageMonths: number) => void,
 *   removeChild: (id: string) => void,
 *   updateChild: (id: string, updates: Partial<import('../types/index.js').Child>) => void,
 * }}
 */
export function useChildren() {
  const [children, setChildren] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  }, [children]);

  const addChild = useCallback((name, ageMonths) => {
    const newChild = {
      id: `child-${Date.now()}`,
      name,
      ageMonths,
      ageGroup: getAgeGroup(ageMonths),
    };
    setChildren(prev => [...prev, newChild]);
  }, []);

  const removeChild = useCallback((id) => {
    setChildren(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateChild = useCallback((id, updates) => {
    setChildren(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };
      if (updates.ageMonths !== undefined) {
        updated.ageGroup = getAgeGroup(updates.ageMonths);
      }
      return updated;
    }));
  }, []);

  return { children, addChild, removeChild, updateChild };
}

// ============================================================================
// WEATHER DATA HOOK
// ============================================================================

/**
 * Hook to fetch and manage weather data
 * @param {string} apiKey - Google Maps Weather API key
 * @param {{lat: number, lng: number} | null} location
 * @param {Object} options
 * @param {boolean} [options.useMockData=false] - Use mock data for development
 * @returns {import('../types/index.js').UseWeatherResult}
 */
export function useWeather(apiKey, location, { useMockData = false } = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const weatherService = useMemo(() => {
    if (!apiKey) return null;
    return createWeatherService(apiKey);
  }, [apiKey]);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    // Use mock data in development
    if (useMockData) {
      const mockData = getMockWeatherData();
      setData(mockData);
      setLastUpdated(mockData.fetchedAt);
      setIsLoading(false);
      return;
    }

    if (!weatherService || !location) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const weatherData = await weatherService.fetchAllWeather(
        location.lat,
        location.lng,
        { forceRefresh }
      );

      setData(weatherData);
      setLastUpdated(weatherData.fetchedAt);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err);
      
      // Try to use cached data as fallback
      const cached = getCachedWeather();
      if (cached) {
        setData(cached);
        setLastUpdated(cached.fetchedAt);
      }
    } finally {
      setIsLoading(false);
    }
  }, [weatherService, location, useMockData]);

  // Initial fetch
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!data?.expiresAt) return false;
    return new Date() > new Date(data.expiresAt);
  }, [data]);

  const refresh = useCallback(() => fetchWeather(true), [fetchWeather]);

  return { data, isLoading, error, refresh, isStale, lastUpdated };
}

// ============================================================================
// OUTFITS HOOK
// ============================================================================

/**
 * Hook to get outfit recommendations
 * @param {import('../types/index.js').WeatherData | null} weather
 * @param {import('../types/index.js').Child[]} children
 * @returns {import('../types/index.js').UseOutfitsResult}
 */
export function useOutfits(weather, children) {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weather || children.length === 0) {
      setOutfits([]);
      setIsLoading(false);
      return;
    }

    try {
      const recommendations = generateAllOutfitRecommendations(children, weather);
      setOutfits(recommendations);
      setError(null);
    } catch (err) {
      console.error('Outfit generation error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [weather, children]);

  return { outfits, isLoading, error };
}

// ============================================================================
// ACTIVITY WINDOWS HOOK
// ============================================================================

/**
 * Hook to get activity window analysis
 * @param {import('../types/index.js').WeatherData | null} weather
 * @returns {import('../types/index.js').UseActivityResult}
 */
export function useActivityWindows(weather) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weather) {
      setAnalysis(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = analyzeActivityWindows(weather);
      setAnalysis(result);
      setError(null);
    } catch (err) {
      console.error('Activity analysis error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [weather]);

  return { analysis, isLoading, error };
}

// ============================================================================
// SMART TIPS HOOK
// ============================================================================

/**
 * Hook to get smart tips
 * @param {import('../types/index.js').WeatherData | null} weather
 * @returns {import('../types/index.js').UseTipsResult}
 */
export function useSmartTips(weather) {
  const [tips, setTips] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weather) {
      setTips(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = generateSmartTips(weather);
      setTips(result);
      setError(null);
    } catch (err) {
      console.error('Tips generation error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [weather]);

  return { tips, isLoading, error };
}

// ============================================================================
// MASTER HOOK - COMBINES EVERYTHING
// ============================================================================

/**
 * Master hook that combines all Tiny Weather functionality
 * 
 * @param {Object} config
 * @param {string} config.apiKey - Google Maps Weather API key
 * @param {boolean} [config.useMockData=false] - Use mock data for development
 * @returns {import('../types/index.js').TinyWeatherState & {
 *   children: import('../types/index.js').Child[],
 *   addChild: (name: string, ageMonths: number) => void,
 *   removeChild: (id: string) => void,
 *   location: {lat: number, lng: number} | null,
 *   locationError: Error | null,
 * }}
 */
export function useTinyWeather({ apiKey, useMockData = false }) {
  // Get location
  const { location, error: locationError, isLoading: locationLoading } = useGeolocation();

  // Manage children
  const { children, addChild, removeChild, updateChild } = useChildren();

  // Fetch weather
  const { 
    data: weather, 
    isLoading: weatherLoading, 
    error: weatherError, 
    refresh,
    lastUpdated,
    isStale,
  } = useWeather(apiKey, location, { useMockData });

  // Generate recommendations (these run automatically when weather updates)
  const { outfits, isLoading: outfitsLoading } = useOutfits(weather, children);
  const { analysis: activities, isLoading: activitiesLoading } = useActivityWindows(weather);
  const { tips, isLoading: tipsLoading } = useSmartTips(weather);

  // Combined loading state
  const isLoading = locationLoading || weatherLoading || outfitsLoading || activitiesLoading || tipsLoading;

  // Combined error state
  const error = locationError || weatherError;

  return {
    // Weather data
    weather,
    
    // Derived data
    outfits,
    activities,
    tips,
    
    // State
    isLoading,
    error,
    refresh,
    lastUpdated,
    isStale,
    
    // Children management
    children,
    addChild,
    removeChild,
    updateChild,
    
    // Location
    location,
    locationError,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to format temperatures based on user preference
 * @param {boolean} useCelsius 
 */
export function useTemperatureFormatter(useCelsius = false) {
  const format = useCallback((tempF) => {
    if (useCelsius) {
      const tempC = Math.round((tempF - 32) * 5 / 9);
      return `${tempC}°C`;
    }
    return `${Math.round(tempF)}°F`;
  }, [useCelsius]);

  const formatShort = useCallback((tempF) => {
    if (useCelsius) {
      return `${Math.round((tempF - 32) * 5 / 9)}°`;
    }
    return `${Math.round(tempF)}°`;
  }, [useCelsius]);

  return { format, formatShort };
}

/**
 * Hook to format time
 */
export function useTimeFormatter() {
  const formatHour = useCallback((date) => {
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hour12}${ampm}`;
  }, []);

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const formatRelative = useCallback((date) => {
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) return 'now';
    if (diffMins < 60) return `in ${diffMins}m`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `in ${diffHours}h`;
    
    return formatHour(date);
  }, [formatHour]);

  return { formatHour, formatTime, formatRelative };
}

/**
 * Hook for swipe gesture handling (for your swipeable cards)
 * @param {Object} options
 * @param {() => void} [options.onSwipeUp]
 * @param {() => void} [options.onSwipeDown]
 * @param {() => void} [options.onSwipeLeft]
 * @param {() => void} [options.onSwipeRight]
 * @param {number} [options.threshold=50]
 */
export function useSwipeGesture({ onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = useCallback((e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;

    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setTouchStart(null);
  }, [touchStart, threshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
