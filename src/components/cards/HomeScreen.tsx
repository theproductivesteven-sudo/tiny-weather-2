import { motion } from 'motion/react';
import { MapPin, Sun, Wind, Droplets, Eye, Calendar, Shirt, Clock } from 'lucide-react';

export function HomeScreen() {
  const weekForecast = [
    { day: 'Mon', temp: 73, icon: Sun },
    { day: 'Tue', temp: 75, icon: Sun },
    { day: 'Wed', temp: 71, icon: Sun },
    { day: 'Thu', temp: 68, icon: Sun },
    { day: 'Fri', temp: 70, icon: Sun },
  ];

  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-stone-100 px-6 py-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-slate-700 mb-2">
            <MapPin className="w-4 h-4" />
            <span>San Francisco, CA</span>
          </div>
          <div className="text-slate-900 text-[80px] leading-none tracking-tighter mb-2">
            72°
          </div>
          <div className="text-slate-700 text-xl">Sunny & Pleasant</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Shirt className="w-6 h-6 text-amber-600 mb-3" />
            <div className="text-slate-600 mb-1">Outfit</div>
            <div className="text-slate-900">Light layers</div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Clock className="w-6 h-6 text-emerald-600 mb-3" />
            <div className="text-slate-600 mb-1">Best time</div>
            <div className="text-slate-900">Morning</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Wind className="w-5 h-5 text-slate-600 mb-2" />
            <div className="text-slate-500 mb-1">Wind</div>
            <div className="text-slate-900">8 mph</div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Droplets className="w-5 h-5 text-slate-600 mb-2" />
            <div className="text-slate-500 mb-1">Humidity</div>
            <div className="text-slate-900">65%</div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Eye className="w-5 h-5 text-slate-600 mb-2" />
            <div className="text-slate-500 mb-1">Visibility</div>
            <div className="text-slate-900">10 mi</div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Sun className="w-5 h-5 text-slate-600 mb-2" />
            <div className="text-slate-500 mb-1">UV Index</div>
            <div className="text-slate-900">6</div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-5 text-slate-900">
            <Calendar className="w-5 h-5" />
            <span>5-Day Forecast</span>
          </div>
          
          <div className="space-y-4">
            {weekForecast.map((day, index) => {
              const Icon = day.icon;
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="text-slate-700 w-12">{day.day}</div>
                  <Icon className="w-5 h-5 text-amber-500" />
                  <div className="text-slate-900 w-12 text-right">{day.temp}°</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom spacing for safe area */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}