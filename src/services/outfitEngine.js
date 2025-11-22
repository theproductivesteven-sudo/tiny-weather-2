/**
 * Tiny Weather - Outfit Recommendation Engine
 * 
 * Smart outfit recommendations based on:
 * - Child's age (babies need +1 layer, toddlers need backup clothes)
 * - Temperature throughout the day (morning vs afternoon)
 * - Rain probability and timing
 * - UV index and sun protection
 * - Humidity and comfort
 */

import {
  TEMP_THRESHOLDS,
  UV_THRESHOLDS,
  RAIN_THRESHOLDS,
  HUMIDITY_THRESHOLDS,
  CLOTHING_ITEMS,
  getAgeGroup,
  getExtraLayers,
  TIME_CONFIG,
} from '../utils/constants.js';

// ============================================================================
// TEMPERATURE ANALYSIS
// ============================================================================

/**
 * Get temperature category
 * @param {number} temp - Temperature in Fahrenheit
 * @returns {'cold' | 'cool' | 'comfortable' | 'warm' | 'hot'}
 */
export function getTempCategory(temp) {
  if (temp < TEMP_THRESHOLDS.COLD) return 'cold';
  if (temp < TEMP_THRESHOLDS.COOL) return 'cool';
  if (temp < TEMP_THRESHOLDS.WARM) return 'comfortable';
  if (temp < TEMP_THRESHOLDS.HOT) return 'warm';
  return 'hot';
}

/**
 * Calculate morning and afternoon temperatures
 * @param {import('../types/index.js').HourlyForecast[]} hourly 
 * @returns {{morning: number, afternoon: number, swing: number}}
 */
export function analyzeDayTemperatures(hourly) {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Filter to relevant hours
  const morningHours = hourly.filter(h => {
    const hour = h.time.getHours();
    return hour >= TIME_CONFIG.MORNING_START && hour <= TIME_CONFIG.MORNING_END;
  });
  
  const afternoonHours = hourly.filter(h => {
    const hour = h.time.getHours();
    return hour >= TIME_CONFIG.AFTERNOON_START && hour <= TIME_CONFIG.AFTERNOON_END;
  });
  
  // Calculate averages (or use current if no data)
  const morningTemp = morningHours.length > 0
    ? Math.round(morningHours.reduce((sum, h) => sum + h.temperature, 0) / morningHours.length)
    : hourly[0]?.temperature || 65;
  
  const afternoonTemp = afternoonHours.length > 0
    ? Math.round(afternoonHours.reduce((sum, h) => sum + h.temperature, 0) / afternoonHours.length)
    : hourly[hourly.length - 1]?.temperature || 70;
  
  // If it's already afternoon, use current as morning
  const effectiveMorning = currentHour >= TIME_CONFIG.MIDDAY_START ? hourly[0]?.temperature || morningTemp : morningTemp;
  
  return {
    morning: effectiveMorning,
    afternoon: afternoonTemp,
    swing: Math.abs(afternoonTemp - effectiveMorning),
  };
}

// ============================================================================
// CLOTHING SELECTION LOGIC
// ============================================================================

/**
 * Get base layer recommendation
 * @param {number} temp - Temperature in Fahrenheit
 * @param {string} ageGroup 
 * @returns {import('../types/index.js').ClothingItem[]}
 */
function getBaseLayers(temp, ageGroup) {
  const items = [];
  
  // Top
  if (temp < TEMP_THRESHOLDS.COLD) {
    items.push({ ...CLOTHING_ITEMS.LONG_SLEEVE, required: true });
  } else if (temp < TEMP_THRESHOLDS.COOL) {
    items.push({ ...CLOTHING_ITEMS.LONG_SLEEVE, required: true });
  } else if (temp < TEMP_THRESHOLDS.WARM) {
    items.push({ ...CLOTHING_ITEMS.TSHIRT, required: true });
  } else {
    items.push({ 
      ...CLOTHING_ITEMS.TSHIRT, 
      required: true,
      reason: temp >= TEMP_THRESHOLDS.HOT ? 'Light, breathable fabric' : undefined,
    });
  }
  
  // Baby-specific: onesie underneath for very young
  if (ageGroup === 'baby' && temp < TEMP_THRESHOLDS.COMFORTABLE_LOW) {
    items.unshift({ ...CLOTHING_ITEMS.ONESIE, required: true, reason: 'Base layer for warmth' });
  }
  
  // Bottoms
  if (temp < TEMP_THRESHOLDS.COOL) {
    items.push({ ...CLOTHING_ITEMS.PANTS, required: true });
  } else if (temp < TEMP_THRESHOLDS.WARM) {
    items.push({ ...CLOTHING_ITEMS.PANTS, required: true });
  } else {
    items.push({ ...CLOTHING_ITEMS.SHORTS, required: true });
  }
  
  return items;
}

/**
 * Get mid layer recommendation
 * @param {number} temp 
 * @param {number} afternoonTemp 
 * @param {string} ageGroup 
 * @returns {import('../types/index.js').ClothingItem[]}
 */
function getMidLayers(temp, afternoonTemp, ageGroup) {
  const items = [];
  const extraLayers = getExtraLayers(ageGroup === 'baby' ? 6 : ageGroup === 'toddler' ? 24 : 60);
  
  // Adjust threshold for babies
  const adjustedThreshold = TEMP_THRESHOLDS.COOL + (extraLayers * 10);
  
  if (temp < TEMP_THRESHOLDS.VERY_COLD) {
    items.push({ ...CLOTHING_ITEMS.FLEECE, required: true, reason: 'Insulating layer' });
  } else if (temp < TEMP_THRESHOLDS.COLD) {
    items.push({ ...CLOTHING_ITEMS.LIGHT_SWEATER, required: true });
  } else if (temp < adjustedThreshold) {
    items.push({ ...CLOTHING_ITEMS.LIGHT_SWEATER, required: false, reason: 'For cooler moments' });
  }
  
  // Pack extra layer if big temp swing expected
  if (afternoonTemp - temp > 15 && temp < TEMP_THRESHOLDS.COMFORTABLE_HIGH) {
    const hasLayer = items.some(i => i.layer === 'mid');
    if (!hasLayer) {
      items.push({ 
        ...CLOTHING_ITEMS.LIGHT_SWEATER, 
        required: false, 
        reason: 'Pack for later - temp will rise significantly' 
      });
    }
  }
  
  return items;
}

/**
 * Get outer layer recommendation
 * @param {number} temp 
 * @param {number} rainChance 
 * @param {string} ageGroup 
 * @returns {import('../types/index.js').ClothingItem[]}
 */
function getOuterLayers(temp, rainChance, ageGroup) {
  const items = [];
  
  // Temperature-based outerwear
  if (temp < TEMP_THRESHOLDS.FREEZING) {
    items.push({ ...CLOTHING_ITEMS.WINTER_COAT, required: true, reason: 'Essential for freezing temps' });
  } else if (temp < TEMP_THRESHOLDS.VERY_COLD) {
    items.push({ ...CLOTHING_ITEMS.PUFFER, required: true });
  } else if (temp < TEMP_THRESHOLDS.COLD) {
    items.push({ ...CLOTHING_ITEMS.LIGHT_JACKET, required: true });
  } else if (temp < TEMP_THRESHOLDS.COOL) {
    items.push({ ...CLOTHING_ITEMS.LIGHT_JACKET, required: false, reason: 'Morning chill' });
  }
  
  // Rain gear
  if (rainChance >= RAIN_THRESHOLDS.VERY_LIKELY) {
    items.push({ ...CLOTHING_ITEMS.RAIN_JACKET, required: true, reason: 'Rain very likely' });
  } else if (rainChance >= RAIN_THRESHOLDS.PACK_UMBRELLA) {
    items.push({ ...CLOTHING_ITEMS.RAIN_JACKET, required: false, reason: 'Pack in bag just in case' });
  }
  
  return items;
}

/**
 * Get footwear recommendation
 * @param {number} temp 
 * @param {number} rainChance 
 * @param {boolean} recentRain 
 * @returns {import('../types/index.js').ClothingItem}
 */
function getFootwear(temp, rainChance, recentRain = false) {
  if (temp < TEMP_THRESHOLDS.FREEZING) {
    return { ...CLOTHING_ITEMS.WINTER_BOOTS, required: true };
  }
  
  if (rainChance >= RAIN_THRESHOLDS.RAIN_BOOTS_NEEDED || recentRain) {
    return { 
      ...CLOTHING_ITEMS.RAIN_BOOTS, 
      required: true, 
      reason: recentRain ? 'Puddles likely' : 'Rain expected' 
    };
  }
  
  if (temp < TEMP_THRESHOLDS.COLD) {
    return { ...CLOTHING_ITEMS.BOOTS, required: true };
  }
  
  if (temp >= TEMP_THRESHOLDS.HOT) {
    return { ...CLOTHING_ITEMS.SANDALS, required: true, reason: 'Keep feet cool' };
  }
  
  return { ...CLOTHING_ITEMS.SNEAKERS, required: true };
}

/**
 * Get accessories recommendation
 * @param {number} temp 
 * @param {number} uvIndex 
 * @param {number} rainChance 
 * @param {string} ageGroup 
 * @returns {import('../types/index.js').ClothingItem[]}
 */
function getAccessories(temp, uvIndex, rainChance, ageGroup) {
  const items = [];
  
  // Cold weather accessories
  if (temp < TEMP_THRESHOLDS.FREEZING) {
    items.push({ ...CLOTHING_ITEMS.WINTER_HAT, required: true });
    items.push({ ...CLOTHING_ITEMS.MITTENS, required: true });
    items.push({ ...CLOTHING_ITEMS.SCARF, required: true });
  } else if (temp < TEMP_THRESHOLDS.VERY_COLD) {
    items.push({ ...CLOTHING_ITEMS.WINTER_HAT, required: true });
    if (ageGroup === 'baby' || ageGroup === 'toddler') {
      items.push({ ...CLOTHING_ITEMS.MITTENS, required: true });
    } else {
      items.push({ ...CLOTHING_ITEMS.GLOVES, required: false });
    }
  } else if (temp < TEMP_THRESHOLDS.COLD) {
    items.push({ ...CLOTHING_ITEMS.WINTER_HAT, required: false, reason: 'For wind chill' });
  }
  
  // Sun protection
  if (uvIndex >= UV_THRESHOLDS.SUNSCREEN_NEEDED) {
    items.push({ 
      ...CLOTHING_ITEMS.SUNSCREEN, 
      required: true, 
      reason: uvIndex >= UV_THRESHOLDS.VERY_HIGH ? 'UV very high - reapply often!' : 'Apply before going out'
    });
  }
  
  if (uvIndex >= UV_THRESHOLDS.HAT_NEEDED) {
    items.push({ ...CLOTHING_ITEMS.SUN_HAT, required: true, reason: 'Protect face from sun' });
  }
  
  if (uvIndex >= UV_THRESHOLDS.MODERATE) {
    items.push({ ...CLOTHING_ITEMS.SUNGLASSES, required: false });
  }
  
  // Rain accessories
  if (rainChance >= RAIN_THRESHOLDS.PACK_UMBRELLA && rainChance < RAIN_THRESHOLDS.RAIN_BOOTS_NEEDED) {
    items.push({ ...CLOTHING_ITEMS.UMBRELLA, required: false, reason: 'Rain possible' });
  }
  
  return items;
}

// ============================================================================
// TIP GENERATION
// ============================================================================

/**
 * Generate outfit-specific tips
 * @param {Object} context
 * @returns {string[]}
 */
function generateOutfitTips(context) {
  const { 
    morningTemp, 
    afternoonTemp, 
    tempSwing, 
    uvIndex, 
    rainChance, 
    humidity, 
    ageGroup,
    maxRainHour,
  } = context;
  
  const tips = [];
  
  // Temperature swing tips
  if (tempSwing >= 20) {
    tips.push(`Big swing today: ${morningTemp}° to ${afternoonTemp}° - dress in removable layers`);
  } else if (tempSwing >= 15) {
    tips.push(`Starts ${morningTemp}°, warms to ${afternoonTemp}° - have layers to shed`);
  }
  
  // Baby/toddler specific
  if (ageGroup === 'baby') {
    tips.push('Babies can\'t regulate temperature well - check often');
    if (morningTemp < TEMP_THRESHOLDS.BABY_TOO_COLD) {
      tips.push('Bundle up! Add blanket for stroller');
    }
    if (afternoonTemp > TEMP_THRESHOLDS.BABY_TOO_HOT) {
      tips.push('Watch for overheating - keep in shade');
    }
  }
  
  if (ageGroup === 'toddler') {
    tips.push('Pack backup outfit - toddlers get messy!');
    if (humidity > HUMIDITY_THRESHOLDS.HUMID) {
      tips.push('Sticky day - bring extra water');
    }
  }
  
  // Rain timing tips
  if (rainChance >= RAIN_THRESHOLDS.LIKELY && maxRainHour) {
    const rainHour = maxRainHour.getHours();
    if (rainHour >= 14 && rainHour <= 16) {
      tips.push('Rain likely during pickup time - have gear in car');
    } else if (rainHour >= 7 && rainHour <= 9) {
      tips.push('Morning rain - dress ready or plan to change');
    }
  }
  
  // UV tips
  if (uvIndex >= UV_THRESHOLDS.VERY_HIGH) {
    tips.push('Extreme UV - avoid 10am-2pm outdoors if possible');
  } else if (uvIndex >= UV_THRESHOLDS.HIGH) {
    tips.push('High UV - seek shade during midday');
  }
  
  // Car seat safety
  if (morningTemp < TEMP_THRESHOLDS.COLD) {
    tips.push('Remove puffy jacket before car seat for safety');
  }
  
  // Humidity tips
  if (humidity >= HUMIDITY_THRESHOLDS.OPPRESSIVE && afternoonTemp >= TEMP_THRESHOLDS.WARM) {
    tips.push('Very humid - feels hotter than it is');
  }
  
  return tips;
}

// ============================================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================================

/**
 * Generate outfit recommendation for a child
 * @param {import('../types/index.js').Child} child 
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').OutfitRecommendation}
 */
export function generateOutfitRecommendation(child, weather) {
  const { current, hourly } = weather;
  
  // Analyze temperatures
  const temps = analyzeDayTemperatures(hourly);
  const ageGroup = getAgeGroup(child.ageMonths);
  
  // Find peak rain probability and when
  const maxRainHour = hourly.reduce((max, h) => 
    h.precipitationProbability > (max?.precipitationProbability || 0) ? h : max, 
    null
  );
  const maxRainChance = maxRainHour?.precipitationProbability || current.precipitationProbability;
  
  // Get max UV
  const maxUV = Math.max(current.uvIndex, ...hourly.map(h => h.uvIndex));
  
  // Build outfit
  const allItems = [
    ...getBaseLayers(temps.morning, ageGroup),
    ...getMidLayers(temps.morning, temps.afternoon, ageGroup),
    ...getOuterLayers(temps.morning, maxRainChance, ageGroup),
    getFootwear(temps.morning, maxRainChance),
    ...getAccessories(temps.morning, maxUV, maxRainChance, ageGroup),
  ];
  
  // Deduplicate by layer (keep first of each layer type, except accessories)
  const seenLayers = new Set();
  const items = allItems.filter(item => {
    if (item.layer === 'accessory') return true;
    if (seenLayers.has(item.layer)) return false;
    seenLayers.add(item.layer);
    return true;
  });
  
  // Generate tips
  const tips = generateOutfitTips({
    morningTemp: temps.morning,
    afternoonTemp: temps.afternoon,
    tempSwing: temps.swing,
    uvIndex: maxUV,
    rainChance: maxRainChance,
    humidity: current.humidity,
    ageGroup,
    maxRainHour: maxRainHour?.time,
  });
  
  // Build summary
  const tempCategory = getTempCategory(temps.morning);
  const requiredItems = items.filter(i => i.required);
  const topItem = requiredItems.find(i => i.layer === 'base' && !['shorts', 'pants', 'leggings'].includes(i.id));
  
  let summary = `${topItem?.name || 'Comfortable clothes'}`;
  if (temps.swing >= 15) {
    summary += ` + layers for ${temps.swing}° swing`;
  }
  if (maxRainChance >= RAIN_THRESHOLDS.PACK_UMBRELLA) {
    summary += ' + rain gear';
  }
  
  return {
    childId: child.id,
    childName: child.name,
    ageGroup,
    items,
    tips,
    summary,
    tempCategory,
    needsRainGear: maxRainChance >= RAIN_THRESHOLDS.PACK_UMBRELLA,
    needsSunProtection: maxUV >= UV_THRESHOLDS.SUNSCREEN_NEEDED,
    morningTemp: temps.morning,
    afternoonTemp: temps.afternoon,
    tempSwing: temps.swing,
  };
}

/**
 * Generate outfit recommendations for all children
 * @param {import('../types/index.js').Child[]} children 
 * @param {import('../types/index.js').WeatherData} weather 
 * @returns {import('../types/index.js').OutfitRecommendation[]}
 */
export function generateAllOutfitRecommendations(children, weather) {
  return children.map(child => generateOutfitRecommendation(child, weather));
}
