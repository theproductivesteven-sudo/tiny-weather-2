import { motion } from 'motion/react';
import { Thermometer } from 'lucide-react';

export function TemperatureCard() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-300 px-8">
      <div className="text-center text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Thermometer className="w-12 h-12 mx-auto mb-8 opacity-90" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-[120px] leading-none tracking-tighter mb-2">
            72°
          </div>
          <div className="text-white/80">
            Perfect temperature
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/90 max-w-xs mx-auto"
        >
          Not too hot, not too cold. Just right for little adventures.
        </motion.p>
      </div>
    </div>
  );
}
