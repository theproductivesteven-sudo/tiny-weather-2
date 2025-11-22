/**
 * Tiny Weather - Smart Tips Generator
 * 
 * Generates parent-specific tips and alerts based on weather conditions.
 * 
 * Tip categories:
 * - Temperature swing alerts
 * - Rain timing for pickup/dropoff
 * - Playground condition warnings
 * - Weekend planning suggestions
 * - Safety reminders
 */

import {
  TEMP_THRESHOLDS,
  UV_THRESHOLDS,
  RAIN_THRESHOLDS,
  HUMIDITY_THRESHOLDS,
  WIND_THRESHOLDS,
  TIME_CONFIG,
} from '../utils/constants.js';

// ============================================================================
// TIP DEFINITIONS
// ============================================================================

/**
 * Create a tip object
 * @param {Partial<import('../types/index.js').SmartTip>} tip 
 * @returns {import('../types/index.js').SmartTip}
 */
function createTip(tip) {
  return {
    id: `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'info',
    priority: 'medium',
    emoji: '💡',
    ...tip,
  };
}

// ============================================================================
// TIP GENERATORS
// ============================================================================

/**
 * Generate temperature-related tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateTemperatureTips(weather) {
  const tips = [];
  const { current, hourly, daily } = weather;
  
  // Calculate temperature swing
  const temps = hourly.map(h => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const swing = maxTemp - minTemp;
  
  // Big temperature swing alert
  if (swing >= 25) {
    tips.push(createTip({
      type: 'alert',
      priority: 'high',
      title: 'Major Temperature Swing',
      message: `Huge ${swing}° swing today: ${minTemp}° to ${maxTemp}°. Dress in layers you can add/remove easily.`,
      emoji: '🌡️',
      category: 'temperature',
    }));
  } else if (swing >= 18) {
    tips.push(createTip({
      type: 'warning',
      priority: 'medium',
      title: 'Temperature Swing',
      message: `${swing}° swing today (${minTemp}° → ${maxTemp}°). Use removable layers.`,
      emoji: '🌡️',
      category: 'temperature',
    }));
  } else if (swing >= 12) {
    tips.push(createTip({
      type: 'info',
      priority: 'low',
      title: 'Moderate Temperature Change',
      message: `Starts at ${minTemp}°, warms to ${maxTemp}°. Pack a layer to shed.`,
      emoji: '📊',
      category: 'temperature',
    }));
  }
  
  // Extreme cold warning
  if (current.temperature < TEMP_THRESHOLDS.FREEZING) {
    tips.push(createTip({
      type: 'alert',
      priority: 'high',
      title: 'Freezing Temperatures',
      message: 'Bundle up! Limit outdoor time and watch for signs of cold stress.',
      emoji: '🥶',
      category: 'temperature',
    }));
  } else if (current.temperature < TEMP_THRESHOLDS.VERY_COLD) {
    tips.push(createTip({
      type: 'warning',
      priority: 'medium',
      title: 'Very Cold Outside',
      message: `Only ${current.temperature}° right now. Add extra layer for little ones.`,
      emoji: '❄️',
      category: 'temperature',
    }));
  }
  
  // Extreme heat warning
  if (current.temperature >= TEMP_THRESHOLDS.DANGEROUS) {
    tips.push(createTip({
      type: 'alert',
      priority: 'high',
      title: 'Dangerous Heat',
      message: 'Heat advisory! Avoid outdoor activities. Risk of heat stroke.',
      emoji: '🔥',
      category: 'temperature',
    }));
  } else if (current.temperature >= TEMP_THRESHOLDS.VERY_HOT) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Very Hot Today',
      message: `${current.temperature}° - Plan activities for early morning or late afternoon only.`,
      emoji: '☀️',
      category: 'temperature',
    }));
  } else if (current.temperature >= TEMP_THRESHOLDS.HOT) {
    tips.push(createTip({
      type: 'info',
      priority: 'medium',
      title: 'Hot Weather',
      message: 'Bring extra water and plan for shade breaks.',
      emoji: '🌡️',
      category: 'temperature',
    }));
  }
  
  return tips;
}

/**
 * Generate rain-related tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateRainTips(weather) {
  const tips = [];
  const { hourly } = weather;
  
  // Find hours with high rain probability
  const rainyHours = hourly.filter(h => h.precipitationProbability >= RAIN_THRESHOLDS.LIKELY);
  
  if (rainyHours.length === 0) {
    // Check if yesterday had rain (wet playground)
    // For now, just check early hours for lingering wetness
    const earlyHours = hourly.slice(0, 3);
    const hadEarlyRain = earlyHours.some(h => h.precipitationProbability >= RAIN_THRESHOLDS.POSSIBLE);
    
    if (hadEarlyRain) {
      tips.push(createTip({
        type: 'info',
        priority: 'low',
        title: 'Wet Morning',
        message: 'Playground equipment may be wet from early moisture. Pack backup clothes.',
        emoji: '💧',
        category: 'rain',
      }));
    }
    
    return tips;
  }
  
  // Find rain timing
  const firstRainyHour = rainyHours[0];
  const rainStartHour = firstRainyHour.time.getHours();
  
  // Rain during dropoff (7-9am)
  if (rainStartHour >= TIME_CONFIG.MORNING_START && rainStartHour <= TIME_CONFIG.MORNING_END) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Rain at Dropoff',
      message: `${firstRainyHour.precipitationProbability}% chance of rain during morning dropoff. Have rain gear ready!`,
      emoji: '🌧️',
      category: 'rain',
    }));
  }
  
  // Rain during pickup (2-4pm)
  const pickupRain = hourly.filter(h => {
    const hour = h.time.getHours();
    return hour >= TIME_CONFIG.PICKUP_HOUR - 1 && 
           hour <= TIME_CONFIG.PICKUP_HOUR + 1 && 
           h.precipitationProbability >= RAIN_THRESHOLDS.LIKELY;
  });
  
  if (pickupRain.length > 0) {
    const maxChance = Math.max(...pickupRain.map(h => h.precipitationProbability));
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Rain at Pickup Time',
      message: `${maxChance}% chance of rain around pickup. Keep rain gear in the car!`,
      emoji: '☔',
      category: 'rain',
      actionText: 'Set reminder',
    }));
  }
  
  // Afternoon rain (outdoor activity impact)
  const afternoonRain = hourly.filter(h => {
    const hour = h.time.getHours();
    return hour >= TIME_CONFIG.AFTERNOON_START && 
           hour <= TIME_CONFIG.AFTERNOON_END && 
           h.precipitationProbability >= RAIN_THRESHOLDS.LIKELY;
  });
  
  if (afternoonRain.length > 0 && pickupRain.length === 0) {
    tips.push(createTip({
      type: 'info',
      priority: 'medium',
      title: 'Afternoon Rain Expected',
      message: 'Rain likely this afternoon. Plan outdoor activities for morning.',
      emoji: '🌦️',
      category: 'rain',
    }));
  }
  
  // All day rain
  if (rainyHours.length >= hourly.length * 0.6) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Rainy Day',
      message: 'Rain expected most of the day. Plan indoor activities and pack full rain gear.',
      emoji: '☔',
      category: 'rain',
    }));
  }
  
  return tips;
}

/**
 * Generate UV-related tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateUVTips(weather) {
  const tips = [];
  const { hourly } = weather;
  
  const maxUV = Math.max(...hourly.map(h => h.uvIndex));
  
  if (maxUV >= UV_THRESHOLDS.EXTREME) {
    tips.push(createTip({
      type: 'alert',
      priority: 'high',
      title: 'Extreme UV',
      message: 'UV index extremely high! Avoid outdoor play 10am-4pm. Use SPF 50+ and protective clothing.',
      emoji: '⚠️',
      category: 'uv',
    }));
  } else if (maxUV >= UV_THRESHOLDS.VERY_HIGH) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Very High UV',
      message: 'Strong sun today. Apply sunscreen every 2 hours and use sun hat.',
      emoji: '☀️',
      category: 'uv',
    }));
  } else if (maxUV >= UV_THRESHOLDS.HIGH) {
    tips.push(createTip({
      type: 'info',
      priority: 'medium',
      title: 'High UV Today',
      message: 'Sunscreen and hat recommended. Seek shade during midday.',
      emoji: '🌤️',
      category: 'uv',
    }));
  }
  
  return tips;
}

/**
 * Generate humidity and comfort tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateComfortTips(weather) {
  const tips = [];
  const { current, hourly } = weather;
  
  // High humidity + heat = feels hotter
  if (current.humidity >= HUMIDITY_THRESHOLDS.VERY_HUMID && 
      current.temperature >= TEMP_THRESHOLDS.WARM) {
    tips.push(createTip({
      type: 'warning',
      priority: 'medium',
      title: 'Humid & Hot',
      message: `${current.humidity}% humidity makes ${current.temperature}° feel much hotter. Bring extra water and take breaks.`,
      emoji: '💦',
      category: 'comfort',
    }));
  } else if (current.humidity >= HUMIDITY_THRESHOLDS.OPPRESSIVE) {
    tips.push(createTip({
      type: 'info',
      priority: 'low',
      title: 'Very Humid',
      message: 'Muggy day - dress in breathable fabrics.',
      emoji: '😓',
      category: 'comfort',
    }));
  }
  
  // Wind considerations
  const maxWind = Math.max(...hourly.map(h => h.windSpeed));
  
  if (maxWind >= WIND_THRESHOLDS.VERY_WINDY) {
    tips.push(createTip({
      type: 'warning',
      priority: 'medium',
      title: 'Very Windy',
      message: 'Strong winds today. Secure loose items and avoid flying debris areas.',
      emoji: '💨',
      category: 'wind',
    }));
  } else if (maxWind >= WIND_THRESHOLDS.WINDY && current.temperature < TEMP_THRESHOLDS.COOL) {
    tips.push(createTip({
      type: 'info',
      priority: 'medium',
      title: 'Wind Chill Factor',
      message: 'Wind makes it feel colder than the thermometer shows. Add a windbreaker layer.',
      emoji: '🌬️',
      category: 'wind',
    }));
  }
  
  return tips;
}

/**
 * Generate playground-specific tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generatePlaygroundTips(weather) {
  const tips = [];
  const { current, hourly } = weather;
  
  // Hot playground equipment
  if (current.temperature >= TEMP_THRESHOLDS.HOT) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Hot Playground Equipment',
      message: 'Metal slides and surfaces can burn! Check with your hand before letting kids play.',
      emoji: '🔥',
      category: 'playground',
    }));
  }
  
  // Wet/slippery conditions
  const recentRain = hourly.slice(0, 4).some(h => h.precipitationProbability >= RAIN_THRESHOLDS.VERY_LIKELY);
  if (recentRain) {
    tips.push(createTip({
      type: 'info',
      priority: 'medium',
      title: 'Wet Playground',
      message: 'Equipment may be slippery from rain. Pack extra outfit for wet clothes.',
      emoji: '💧',
      category: 'playground',
    }));
  }
  
  // Frozen conditions
  if (current.temperature < TEMP_THRESHOLDS.FREEZING) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Icy Conditions',
      message: 'Playground surfaces may be icy. Watch for slipping hazards.',
      emoji: '🧊',
      category: 'playground',
    }));
  }
  
  return tips;
}

/**
 * Generate weekend planning tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateWeekendTips(weather) {
  const tips = [];
  const { daily } = weather;
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Only generate weekend tips on Thursday/Friday
  if (dayOfWeek !== 4 && dayOfWeek !== 5) {
    return tips;
  }
  
  // Find Saturday and Sunday in the forecast
  const saturday = daily.find(d => d.date.getDay() === 6);
  const sunday = daily.find(d => d.date.getDay() === 0);
  
  if (!saturday || !sunday) return tips;
  
  // Compare weekend days
  const satScore = scoreDay(saturday);
  const sunScore = scoreDay(sunday);
  
  if (satScore >= 80 && sunScore >= 80) {
    tips.push(createTip({
      type: 'tip',
      priority: 'low',
      title: 'Great Weekend Ahead!',
      message: `Both Saturday (${saturday.tempHigh}°) and Sunday (${sunday.tempHigh}°) look perfect for outdoor activities.`,
      emoji: '🎉',
      category: 'weekend',
    }));
  } else if (satScore >= 70 && sunScore < 50) {
    tips.push(createTip({
      type: 'tip',
      priority: 'medium',
      title: 'Plan for Saturday',
      message: `Saturday looks better for outdoor plans. Sunday has ${sunday.precipitationProbability}% rain chance.`,
      emoji: '📅',
      category: 'weekend',
    }));
  } else if (sunScore >= 70 && satScore < 50) {
    tips.push(createTip({
      type: 'tip',
      priority: 'medium',
      title: 'Plan for Sunday',
      message: `Sunday looks better for outdoor plans. Saturday has ${saturday.precipitationProbability}% rain chance.`,
      emoji: '📅',
      category: 'weekend',
    }));
  } else if (satScore < 50 && sunScore < 50) {
    tips.push(createTip({
      type: 'info',
      priority: 'low',
      title: 'Indoor Weekend',
      message: 'Both weekend days look challenging. Time to plan indoor activities!',
      emoji: '🏠',
      category: 'weekend',
    }));
  }
  
  return tips;
}

/**
 * Simple day scoring for weekend comparison
 * @param {import('../types/index.js').DailyForecast} day 
 * @returns {number}
 */
function scoreDay(day) {
  let score = 100;
  
  // Rain penalty
  if (day.precipitationProbability >= 70) score -= 50;
  else if (day.precipitationProbability >= 50) score -= 30;
  else if (day.precipitationProbability >= 30) score -= 15;
  
  // Temperature penalty
  if (day.tempHigh > TEMP_THRESHOLDS.VERY_HOT) score -= 30;
  else if (day.tempHigh > TEMP_THRESHOLDS.HOT) score -= 15;
  
  if (day.tempLow < TEMP_THRESHOLDS.FREEZING) score -= 20;
  else if (day.tempLow < TEMP_THRESHOLDS.VERY_COLD) score -= 10;
  
  return Math.max(0, score);
}

/**
 * Generate car seat safety tips
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTip[]}
 */
function generateSafetyTips(weather) {
  const tips = [];
  const { current } = weather;
  
  // Car seat + puffy jacket warning
  if (current.temperature < TEMP_THRESHOLDS.COLD) {
    tips.push(createTip({
      type: 'tip',
      priority: 'medium',
      title: 'Car Seat Reminder',
      message: 'Remove puffy jackets before buckling into car seats. Use blankets over straps instead.',
      emoji: '🚗',
      category: 'safety',
    }));
  }
  
  // Hot car warning
  if (current.temperature >= TEMP_THRESHOLDS.WARM) {
    tips.push(createTip({
      type: 'warning',
      priority: 'high',
      title: 'Hot Car Alert',
      message: `Car interior gets dangerously hot. Never leave children or pets unattended.`,
      emoji: '🚙',
      category: 'safety',
    }));
  }
  
  return tips;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate all smart tips based on weather data
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').SmartTipsResult}
 */
export function generateSmartTips(weather) {
  // Collect all tips from generators
  const allTips = [
    ...generateTemperatureTips(weather),
    ...generateRainTips(weather),
    ...generateUVTips(weather),
    ...generateComfortTips(weather),
    ...generatePlaygroundTips(weather),
    ...generateWeekendTips(weather),
    ...generateSafetyTips(weather),
  ];
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  allTips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  // Deduplicate by category (keep highest priority per category)
  const seenCategories = new Set();
  const dedupedTips = [];
  
  for (const tip of allTips) {
    // Allow multiple tips of different categories, but limit same category
    const categoryKey = `${tip.category}-${tip.priority}`;
    if (!seenCategories.has(categoryKey)) {
      seenCategories.add(categoryKey);
      dedupedTips.push(tip);
    }
  }
  
  // Get alerts only
  const alerts = dedupedTips.filter(t => t.priority === 'high');
  
  // Get primary tip (highest priority)
  const primaryTip = dedupedTips[0] || null;
  
  return {
    tips: dedupedTips,
    primaryTip,
    alerts,
  };
}

/**
 * Get the most important tip as a simple message
 * @param {import('../types/index.js').SmartTipsResult} tipsResult 
 * @returns {string}
 */
export function getPrimaryTipMessage(tipsResult) {
  if (!tipsResult.primaryTip) {
    return 'No special alerts today';
  }
  
  return `${tipsResult.primaryTip.emoji} ${tipsResult.primaryTip.message}`;
}
