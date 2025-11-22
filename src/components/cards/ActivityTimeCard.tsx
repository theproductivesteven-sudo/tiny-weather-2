import { motion } from 'motion/react';
import { Sun, CloudSun, Sunset, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface ActivityHour {
  time: Date;
  temperature: number;
  quality: 'perfect' | 'good' | 'fair' | 'skip';
  reason: string;
  rainChance: number;
  uvIndex: number;
}

interface Activities {
  hours: ActivityHour[];
  bestWindow: { label: string; description: string } | null;
  daySummary: string;
}

interface ActivityTimeCardProps {
  timeSlot: 'morning' | 'midday' | 'afternoon';
  activities?: Activities | null;
  currentSlot: number;
  totalSlots: number;
}

export function ActivityTimeCard({ timeSlot, activities, currentSlot, totalSlots }: ActivityTimeCardProps) {
  
  // Get hours for this time slot from real data
  const getHoursForSlot = () => {
    if (!activities?.hours) return [];
    
    return activities.hours.filter(h => {
      const hour = new Date(h.time).getHours();
      switch (timeSlot) {
        case 'morning': return hour >= 8 && hour < 11;
        case 'midday': return hour >= 11 && hour < 15;
        case 'afternoon': return hour >= 15 && hour < 19;
        default: return false;
      }
    });
  };

  const slotHours = getHoursForSlot();
  
  // Calculate averages from real data
  const avgTemp = slotHours.length > 0 
    ? Math.round(slotHours.reduce((sum, h) => sum + h.temperature, 0) / slotHours.length)
    : null;
  
  const avgRainChance = slotHours.length > 0
    ? Math.round(slotHours.reduce((sum, h) => sum + h.rainChance, 0) / slotHours.length)
    : 0;

  // Determine status from quality
  const getStatus = () => {
    if (slotHours.length === 0) return 'ideal';
    const dominated = slotHours.filter(h => h.quality === 'perfect' || h.quality === 'good').length;
    return dominated >= slotHours.length / 2 ? 'ideal' : 'caution';
  };

  const status = getStatus();

  // Default configs with dynamic overrides
  const defaultConfigs = {
    morning: {
      gradient: 'from-emerald-50 via-teal-50 to-emerald-50',
      icon: Sun,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      time: '8:00 AM - 10:00 AM',
      label: 'Morning Magic',
      emoji: '🌅',
      title: 'Perfect for active play',
      description: 'Cool, comfortable temperatures ideal for running around and exploring',
      activities: ['Park playtime', 'Bike rides', 'Nature walks'],
      tip: 'Energy levels are high and the sun is gentle'
    },
    midday: {
      gradient: 'from-amber-50 via-yellow-50 to-amber-50',
      icon: CloudSun,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      time: '11:00 AM - 2:00 PM',
      label: 'Midday Caution',
      emoji: '☀️',
      title: 'Take it easy',
      description: 'Peak sun hours - best for quieter activities in the shade',
      activities: ['Indoor play', 'Quiet reading', 'Crafts time'],
      tip: 'Stay hydrated and stick to shaded areas if outside'
    },
    afternoon: {
      gradient: 'from-blue-50 via-indigo-50 to-blue-50',
      icon: Sunset,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      time: '3:00 PM - 6:00 PM',
      label: 'Golden Hour',
      emoji: '🌤️',
      title: 'Adventure time',
      description: 'Beautiful weather for outdoor adventures as things cool down',
      activities: ['Playground fun', 'Sports & games', 'Outdoor snacks'],
      tip: 'Perfect temperature for making memories'
    }
  };

  const config = defaultConfigs[timeSlot];
  const Icon = config.icon;
  const StatusIcon = status === 'ideal' ? CheckCircle2 : AlertTriangle;

  // Dynamic content based on real data
  const getDynamicTitle = () => {
    if (status === 'caution') {
      if (avgRainChance > 50) return 'Rain likely - plan indoor backup';
      if (avgTemp && avgTemp > 85) return 'Too hot - stay cool';
      return config.title;
    }
    return config.title;
  };

  const getDynamicTip = () => {
    if (!slotHours.length) return config.tip;
    
    const firstHour = slotHours[0];
    if (firstHour.rainChance > 50) return 'Keep rain gear handy just in case';
    if (firstHour.uvIndex >= 7) return 'High UV - sunscreen is essential';
    
    return config.tip;
  };

  const getDynamicActivities = () => {
    if (status === 'caution') {
      return ['Indoor play', 'Quiet activities', 'Screen time break'];
    }
    return config.activities;
  };

  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-b ${config.gradient} px-8`}>
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {Array.from({ length: totalSlots }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i + 1 === currentSlot 
                  ? 'w-8 bg-slate-700' 
                  : i + 1 < currentSlot
                  ? 'w-8 bg-slate-400'
                  : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </motion.div>

        {/* Icon and status */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-6">
            <div className={`w-32 h-32 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <span className="text-6xl">{config.emoji}</span>
            </div>
            {status === 'ideal' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Time and temp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-slate-600">{config.time}</span>
            <StatusIcon className={`w-4 h-4 ${
              status === 'ideal' ? 'text-emerald-500' : 'text-amber-500'
            }`} />
          </div>
          <h2 className="text-slate-900 mb-3 tracking-tight">
            {status === 'ideal' ? config.label : 'Use Caution'}
          </h2>
          <div className="text-5xl text-slate-800 mb-4">
            {avgTemp ? `${avgTemp}°` : config.time.includes('8') ? '68°' : '74°'}
          </div>
          <p className="text-slate-700 text-xl">
            {getDynamicTitle()}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-slate-600 text-center mb-6">
            {config.description}
          </p>

          {/* Activities */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-sm mb-4">
            <div className="text-slate-700 mb-4">Great for:</div>
            <div className="space-y-3">
              {getDynamicActivities().map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'ideal' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-slate-800">{activity}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`rounded-3xl p-5 ${
              status === 'ideal' 
                ? 'bg-emerald-100/50 border border-emerald-200' 
                : 'bg-amber-100/50 border border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <p className="text-slate-700">
                {getDynamicTip()}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
