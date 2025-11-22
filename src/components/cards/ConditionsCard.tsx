import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';

export function ConditionsCard() {
  const condition = 'sunny'; // Could be: sunny, cloudy, rainy, snowy, windy
  
  const conditionConfig = {
    sunny: {
      icon: Sun,
      gradient: 'from-sky-400 via-blue-400 to-cyan-400',
      title: 'Sunshine',
      message: 'Beautiful clear skies all day long',
    },
    cloudy: {
      icon: Cloud,
      gradient: 'from-slate-400 via-gray-400 to-zinc-400',
      title: 'Partly Cloudy',
      message: 'Soft clouds dancing across the sky',
    },
    rainy: {
      icon: CloudRain,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      title: 'Rain Showers',
      message: 'Puddle jumping weather ahead',
    },
  };

  const config = conditionConfig[condition as keyof typeof conditionConfig];
  const Icon = config.icon;

  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-br ${config.gradient} px-8`}>
      <div className="text-center text-white">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex justify-center"
        >
          <Icon className="w-32 h-32 drop-shadow-lg" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4 tracking-tight"
        >
          {config.title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/90 max-w-xs mx-auto"
        >
          {config.message}
        </motion.p>
      </div>
    </div>
  );
}
