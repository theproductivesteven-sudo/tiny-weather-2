import { motion } from 'motion/react';
import { CloudSun } from 'lucide-react';

export function WelcomeCard() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 px-8">
      <div className="text-center text-slate-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <CloudSun className="w-12 h-12 text-blue-500" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6 tracking-tight"
        >
          Tiny Weather
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-slate-600 max-w-xs mx-auto"
        >
          Weather made simple for busy parents
        </motion.p>
      </div>
    </div>
  );
}