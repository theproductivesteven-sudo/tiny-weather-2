/**
 * Tiny Weather - Activity Window Calculator
 * 
 * Analyzes hourly forecasts to identify the best times for outdoor activities.
 * Scores each hour and groups them into activity windows.
 * 
 * Scoring factors:
 * - Temperature (35% weight) - ideal 60-75°F
 * - Rain probability (30% weight) - lower is better
 * - UV index (15% weight) - moderate is ideal
 * - Humidity (10% weight) - 40-60% is comfortable
 * - Wind (10% weight) - calm to light is best
 */

import {
  TEMP_THRESHOLDS,
  UV_THRESHOLDS,
  RAIN_THRESHOLDS,
  HUMIDITY_THRESHOLDS,
  WIND_THRESHOLDS,
  ACTIVITY_WEIGHTS,
  ACTIVITY_QUALITY_THRESHOLDS,
  TIME_CONFIG,
  WEATHER_CONDITIONS,
} from '../utils/constants.js';

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Score temperature (0-100)
 * Ideal: 60-75°F
 * @param {number} temp 
 * @returns {number}
 */
function scoreTemperature(temp) {
  // Perfect range
  if (temp >= TEMP_THRESHOLDS.IDEAL_OUTDOOR_LOW && temp <= TEMP_THRESHOLDS.IDEAL_OUTDOOR_HIGH) {
    return 100;
  }
  
  // Too cold
  if (temp < TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND) {
    return Math.max(0, 30 - (TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND - temp) * 3);
  }
  
  // Cool but acceptable
  if (temp < TEMP_THRESHOLDS.IDEAL_OUTDOOR_LOW) {
    const range = TEMP_THRESHOLDS.IDEAL_OUTDOOR_LOW - TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND;
    const position = temp - TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND;
    return 50 + (position / range) * 50;
  }
  
  // Warm but acceptable
  if (temp <= TEMP_THRESHOLDS.WARM) {
    const range = TEMP_THRESHOLDS.WARM - TEMP_THRESHOLDS.IDEAL_OUTDOOR_HIGH;
    const position = temp - TEMP_THRESHOLDS.IDEAL_OUTDOOR_HIGH;
    return 100 - (position / range) * 30;
  }
  
  // Hot
  if (temp <= TEMP_THRESHOLDS.HOT) {
    return 50;
  }
  
  // Very hot
  if (temp <= TEMP_THRESHOLDS.VERY_HOT) {
    return 30;
  }
  
  // Dangerous
  return 10;
}

/**
 * Score rain probability (0-100)
 * Lower rain chance = higher score
 * @param {number} rainChance 
 * @returns {number}
 */
function scoreRainProbability(rainChance) {
  if (rainChance <= RAIN_THRESHOLDS.UNLIKELY) return 100;
  if (rainChance <= RAIN_THRESHOLDS.SLIGHT_CHANCE) return 90;
  if (rainChance <= RAIN_THRESHOLDS.POSSIBLE) return 70;
  if (rainChance <= RAIN_THRESHOLDS.LIKELY) return 40;
  if (rainChance <= RAIN_THRESHOLDS.VERY_LIKELY) return 20;
  return 5;
}

/**
 * Score UV index (0-100)
 * Moderate UV is fine, extreme is bad
 * @param {number} uvIndex 
 * @returns {number}
 */
function scoreUVIndex(uvIndex) {
  if (uvIndex <= UV_THRESHOLDS.LOW) return 100;
  if (uvIndex <= UV_THRESHOLDS.MODERATE) return 90;
  if (uvIndex <= UV_THRESHOLDS.HIGH) return 70;
  if (uvIndex <= UV_THRESHOLDS.VERY_HIGH) return 40;
  return 20;
}

/**
 * Score humidity (0-100)
 * 40-60% is comfortable
 * @param {number} humidity 
 * @returns {number}
 */
function scoreHumidity(humidity) {
  if (humidity >= HUMIDITY_THRESHOLDS.COMFORTABLE_LOW && humidity <= HUMIDITY_THRESHOLDS.COMFORTABLE_HIGH) {
    return 100;
  }
  
  if (humidity < HUMIDITY_THRESHOLDS.COMFORTABLE_LOW) {
    // Too dry - mildly uncomfortable
    return 80 - (HUMIDITY_THRESHOLDS.COMFORTABLE_LOW - humidity);
  }
  
  // Too humid
  if (humidity <= HUMIDITY_THRESHOLDS.HUMID) return 70;
  if (humidity <= HUMIDITY_THRESHOLDS.VERY_HUMID) return 50;
  return 30;
}

/**
 * Score wind speed (0-100)
 * Calm to light is best
 * @param {number} windSpeed 
 * @returns {number}
 */
function scoreWind(windSpeed) {
  if (windSpeed <= WIND_THRESHOLDS.CALM) return 100;
  if (windSpeed <= WIND_THRESHOLDS.LIGHT) return 90;
  if (windSpeed <= WIND_THRESHOLDS.MODERATE) return 75;
  if (windSpeed <= WIND_THRESHOLDS.BREEZY) return 50;
  if (windSpeed <= WIND_THRESHOLDS.WINDY) return 30;
  return 10;
}

/**
 * Calculate overall activity score for an hour
 * @param {import('../types/index.js').HourlyForecast} hour 
 * @returns {number}
 */
function calculateHourScore(hour) {
  const tempScore = scoreTemperature(hour.temperature);
  const rainScore = scoreRainProbability(hour.precipitationProbability);
  const uvScore = scoreUVIndex(hour.uvIndex);
  const humidityScore = scoreHumidity(hour.humidity);
  const windScore = scoreWind(hour.windSpeed);
  
  const weightedScore = 
    tempScore * ACTIVITY_WEIGHTS.TEMPERATURE +
    rainScore * ACTIVITY_WEIGHTS.RAIN_CHANCE +
    uvScore * ACTIVITY_WEIGHTS.UV_INDEX +
    humidityScore * ACTIVITY_WEIGHTS.HUMIDITY +
    windScore * ACTIVITY_WEIGHTS.WIND;
  
  return Math.round(weightedScore);
}

/**
 * Get quality rating from score
 * @param {number} score 
 * @returns {import('../types/index.js').ActivityQuality}
 */
function getQualityFromScore(score) {
  if (score >= ACTIVITY_QUALITY_THRESHOLDS.PERFECT) return 'perfect';
  if (score >= ACTIVITY_QUALITY_THRESHOLDS.GOOD) return 'good';
  if (score >= ACTIVITY_QUALITY_THRESHOLDS.FAIR) return 'fair';
  return 'skip';
}

/**
 * Get emoji for quality
 * @param {import('../types/index.js').ActivityQuality} quality 
 * @returns {string}
 */
function getQualityEmoji(quality) {
  switch (quality) {
    case 'perfect': return '✨';
    case 'good': return '✓';
    case 'fair': return '~';
    case 'skip': return '✗';
    default: return '•';
  }
}

/**
 * Get reason for hour rating
 * @param {import('../types/index.js').HourlyForecast} hour 
 * @param {number} score 
 * @returns {string}
 */
function getHourReason(hour, score) {
  const issues = [];
  
  // Temperature issues
  if (hour.temperature < TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND) {
    issues.push('Too cold');
  } else if (hour.temperature < TEMP_THRESHOLDS.COOL) {
    issues.push('Chilly');
  } else if (hour.temperature > TEMP_THRESHOLDS.HOT) {
    issues.push('Too hot');
  } else if (hour.temperature > TEMP_THRESHOLDS.WARM) {
    issues.push('Warm');
  }
  
  // Rain issues
  if (hour.precipitationProbability >= RAIN_THRESHOLDS.VERY_LIKELY) {
    issues.push('Rain likely');
  } else if (hour.precipitationProbability >= RAIN_THRESHOLDS.LIKELY) {
    issues.push('Chance of rain');
  }
  
  // UV issues
  if (hour.uvIndex >= UV_THRESHOLDS.VERY_HIGH) {
    issues.push('Extreme UV');
  } else if (hour.uvIndex >= UV_THRESHOLDS.HIGH) {
    issues.push('High UV');
  }
  
  // Humidity issues
  if (hour.humidity >= HUMIDITY_THRESHOLDS.OPPRESSIVE) {
    issues.push('Very humid');
  } else if (hour.humidity >= HUMIDITY_THRESHOLDS.VERY_HUMID) {
    issues.push('Humid');
  }
  
  // Wind issues
  if (hour.windSpeed >= WIND_THRESHOLDS.WINDY) {
    issues.push('Very windy');
  } else if (hour.windSpeed >= WIND_THRESHOLDS.BREEZY) {
    issues.push('Breezy');
  }
  
  if (issues.length === 0) {
    if (score >= ACTIVITY_QUALITY_THRESHOLDS.PERFECT) {
      return 'Perfect conditions';
    }
    return 'Good conditions';
  }
  
  return issues.join(', ');
}

// ============================================================================
// WINDOW GROUPING
// ============================================================================

/**
 * Group consecutive hours into activity windows
 * @param {import('../types/index.js').ActivityHour[]} hours 
 * @returns {import('../types/index.js').ActivityWindow[]}
 */
function groupIntoWindows(hours) {
  if (hours.length === 0) return [];
  
  const windows = [];
  let currentWindow = null;
  
  for (const hour of hours) {
    // Skip hours outside of typical outdoor activity times
    const hourOfDay = hour.time.getHours();
    if (hourOfDay < TIME_CONFIG.OUTDOOR_HOURS_START || hourOfDay > TIME_CONFIG.OUTDOOR_HOURS_END) {
      if (currentWindow) {
        windows.push(currentWindow);
        currentWindow = null;
      }
      continue;
    }
    
    // Check if this hour can be added to current window
    if (currentWindow) {
      // Same quality and consecutive
      if (hour.quality === currentWindow.quality) {
        currentWindow.endTime = hour.time;
        currentWindow.hours.push(hour);
      } else {
        // Quality changed - save current window and start new one
        windows.push(currentWindow);
        currentWindow = {
          startTime: hour.time,
          endTime: hour.time,
          quality: hour.quality,
          hours: [hour],
        };
      }
    } else {
      // Start new window
      currentWindow = {
        startTime: hour.time,
        endTime: hour.time,
        quality: hour.quality,
        hours: [hour],
      };
    }
  }
  
  // Don't forget the last window
  if (currentWindow) {
    windows.push(currentWindow);
  }
  
  // Calculate window stats and format
  return windows.map(w => {
    const avgScore = Math.round(w.hours.reduce((sum, h) => sum + h.score, 0) / w.hours.length);
    const avgTemp = Math.round(w.hours.reduce((sum, h) => sum + h.temperature, 0) / w.hours.length);
    
    const startHour = w.startTime.getHours();
    const endHour = w.endTime.getHours() + 1;
    
    const formatHour = (h) => {
      const ampm = h >= 12 ? 'pm' : 'am';
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${hour12}${ampm}`;
    };
    
    return {
      startTime: w.startTime,
      endTime: new Date(w.endTime.getTime() + 60 * 60 * 1000), // Add 1 hour to make it inclusive
      quality: w.quality,
      avgScore,
      avgTemp,
      label: `${formatHour(startHour)} - ${formatHour(endHour)}`,
      description: getWindowDescription(w.quality, avgTemp, w.hours),
    };
  });
}

/**
 * Get description for a window
 * @param {import('../types/index.js').ActivityQuality} quality 
 * @param {number} avgTemp 
 * @param {import('../types/index.js').ActivityHour[]} hours 
 * @returns {string}
 */
function getWindowDescription(quality, avgTemp, hours) {
  const hasRain = hours.some(h => h.rainChance >= RAIN_THRESHOLDS.LIKELY);
  const hasHighUV = hours.some(h => h.uvIndex >= UV_THRESHOLDS.HIGH);
  
  switch (quality) {
    case 'perfect':
      return `Perfect for outdoor play (${avgTemp}°)`;
    case 'good':
      if (hasHighUV) return `Good with sun protection (${avgTemp}°, high UV)`;
      if (avgTemp > TEMP_THRESHOLDS.WARM) return `Good but warm (${avgTemp}°)`;
      if (avgTemp < TEMP_THRESHOLDS.COOL) return `Good but cool (${avgTemp}°)`;
      return `Good for outdoor activities (${avgTemp}°)`;
    case 'fair':
      if (hasRain) return `Possible but rain risk (${avgTemp}°)`;
      if (avgTemp > TEMP_THRESHOLDS.HOT) return `Hot - limit time outdoors (${avgTemp}°)`;
      if (avgTemp < TEMP_THRESHOLDS.TOO_COLD_FOR_PLAYGROUND) return `Cold - bundle up well (${avgTemp}°)`;
      return `Fair conditions (${avgTemp}°)`;
    case 'skip':
      if (hasRain) return 'Skip - rain likely';
      if (avgTemp > TEMP_THRESHOLDS.VERY_HOT) return 'Skip - too hot';
      if (avgTemp < TEMP_THRESHOLDS.FREEZING) return 'Skip - too cold';
      return 'Not recommended';
    default:
      return `${avgTemp}°`;
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze weather data for activity windows
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').ActivityAnalysis}
 */
export function analyzeActivityWindows(weather) {
  const { hourly } = weather;
  
  // Score each hour
  const hours = hourly.map(h => {
    const score = calculateHourScore(h);
    const quality = getQualityFromScore(score);
    
    return {
      time: h.time,
      temperature: h.temperature,
      feelsLike: h.feelsLike,
      quality,
      score,
      reason: getHourReason(h, score),
      rainChance: h.precipitationProbability,
      uvIndex: h.uvIndex,
      emoji: getQualityEmoji(quality),
    };
  });
  
  // Group into windows
  const windows = groupIntoWindows(hours);
  
  // Find best window
  const goodWindows = windows.filter(w => w.quality === 'perfect' || w.quality === 'good');
  const bestWindow = goodWindows.length > 0 
    ? goodWindows.reduce((best, w) => w.avgScore > best.avgScore ? w : best)
    : null;
  
  // Generate day summary
  const perfectCount = hours.filter(h => h.quality === 'perfect').length;
  const goodCount = hours.filter(h => h.quality === 'good').length;
  const skipCount = hours.filter(h => h.quality === 'skip').length;
  
  let daySummary;
  if (perfectCount >= 4) {
    daySummary = 'Great day for outdoor activities!';
  } else if (perfectCount + goodCount >= 4) {
    daySummary = 'Good opportunities for outdoor time today';
  } else if (perfectCount + goodCount >= 2) {
    daySummary = 'Limited outdoor windows today';
  } else if (skipCount > hours.length / 2) {
    daySummary = 'Challenging day - plan indoor activities';
  } else {
    daySummary = 'Mixed conditions - check hourly forecast';
  }
  
  return {
    hours,
    windows,
    bestWindow,
    daySummary,
    hasGoodWindows: goodWindows.length > 0,
  };
}

/**
 * Get a simple text summary of best outdoor times
 * @param {import('../types/index.js').ActivityAnalysis} analysis 
 * @returns {string}
 */
export function getActivitySummary(analysis) {
  if (!analysis.hasGoodWindows) {
    return 'No ideal outdoor windows today';
  }
  
  if (analysis.bestWindow) {
    return `Best time: ${analysis.bestWindow.label} (${analysis.bestWindow.avgTemp}°)`;
  }
  
  const goodWindows = analysis.windows.filter(w => w.quality !== 'skip' && w.quality !== 'fair');
  if (goodWindows.length === 1) {
    return `Good window: ${goodWindows[0].label}`;
  }
  
  return `${goodWindows.length} good windows today`;
}
