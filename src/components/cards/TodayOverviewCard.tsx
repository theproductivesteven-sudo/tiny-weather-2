import { motion } from 'motion/react';
import { Sun, MapPin } from 'lucide-react';

export function TodayOverviewCard() {
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
            <span>San Francisco, CA</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10"
        >
          <Sun className="w-24 h-24 mx-auto mb-8 text-amber-400" />
          <div className="text-[120px] leading-none tracking-tighter mb-4 text-slate-900">
            72°
          </div>
          <div className="text-slate-800 text-2xl mb-3">
            Sunny & Pleasant
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-sm"
        >
          <p className="text-slate-800 text-xl mb-4">
            A beautiful day ahead
          </p>
          <p className="text-slate-600">
            Perfect conditions for outdoor play with mild temperatures and gentle breezes
          </p>
        </motion.div>
      </div>
    </div>
  );
}