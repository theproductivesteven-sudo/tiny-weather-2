import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, MapPin } from 'lucide-react';

interface Weather {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    uvIndex: number;
    precipitationProbability: number;
    conditionText: string;
    condition: string;
  };
  daily: Array<{
    tempHigh: number;
    tempLow: number;
  }>;
}

interface Tips {
  primaryTip: {
    emoji: string;
    message: string;
  } | null;
}

interface TodayOverviewCardProps {
  weather?: Weather | null;
  tips?: Tips | null;
}

export function TodayOverviewCard({ weather, tips }: TodayOverviewCardProps) {
  
  // Get the right icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return Sun;
    
    const condition = weather.current.condition.toUpperCase();
    if (condition.includes('RAIN') || condition.includes('DRIZZLE')) return CloudRain;
    if (condition.includes('SNOW') || condition.includes('SLEET')) return CloudSnow;
    if (condition.includes('CLOUD')) return condition.includes('PARTLY') ? CloudSun : Cloud;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon();

  // Get dynamic description
  const getDescription = () => {
    if (!weather) return 'Perfect conditions for outdoor play with mild temperatures and gentle breezes';
    
    const temp = weather.current.temperature;
    const rain = weather.current.precipitationProbability;
    
    if (rain > 50) return 'Rain is likely today - have indoor backup plans ready';
    if (temp > 85) return 'Hot day ahead - plan for shade breaks and extra water';
    if (temp < 50) return 'Bundle up! It\'s chilly out there today';
    if (temp >= 65 && temp <= 75) return 'Perfect conditions for outdoor play with mild temperatures';
    
    return 'Good day for outdoor activities with proper preparation';
  };

  // Get headline
  const getHeadline = () => {
    if (!weather) return 'A beautiful day ahead';
    
    const temp = weather.current.temperature;
    const rain = weather.current.precipitationProbability;
    
    if (rain > 60) return 'Rainy day ahead';
    if (temp > 85) return 'Hot one today!';
    if (temp < 45) return 'Bundle up day';
    if (temp >= 65 && temp <= 78) return 'A beautiful day ahead';
    
    return 'Here\'s your forecast';
  };

  // Get icon color based on condition
  const getIconColor = () => {
    if (!weather) return 'text-amber-400';
    
    const condition = weather.current.condition.toUpperCase();
    if (condition.includes('RAIN')) return 'text-blue-400';
    if (condition.includes('SNOW')) return 'text-slate-400';
    if (condition.includes('CLOUD')) return 'text-slate-500';
    return 'text-amber-400';
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-50 px-8">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-slate-700 mb-8">
            <MapPin className="w-4 h-4" />
            <span>Your Location</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10"
        >
          <WeatherIcon className={`w-24 h-24 mx-auto mb-8 ${getIconColor()}`} />
          <div className="text-[120px] leading-none tracking-tighter mb-4 text-slate-900">
            {weather?.current.temperature ?? 72}°
          </div>
          <div className="text-slate-800 text-2xl mb-3">
            {weather?.current.conditionText ?? 'Sunny & Pleasant'}
          </div>
          {weather?.daily?.[0] && (
            <div className="text-slate-500">
              H: {weather.daily[0].tempHigh}° · L: {weather.daily[0].tempLow}°
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-sm"
        >
          <p className="text-slate-800 text-xl mb-4">
            {getHeadline()}
          </p>
          <p className="text-slate-600">
            {tips?.primaryTip?.message ?? getDescription()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
