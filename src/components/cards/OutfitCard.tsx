import { motion } from 'motion/react';
import { Shirt } from 'lucide-react';

export function OutfitCard() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 px-8">
      <div className="text-center text-white w-full max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shirt className="w-12 h-12" />
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 tracking-tight"
        >
          Today's Pick
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 mb-6"
        >
          <div className="mb-3">Light layers</div>
          <div className="text-white/80">
            T-shirt with a light jacket for the breeze
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/80"
        >
          Easy to adjust as the day warms up
        </motion.p>
      </div>
    </div>
  );
}
