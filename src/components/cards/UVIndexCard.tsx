import { motion } from 'motion/react';
import { Sun } from 'lucide-react';

export function UVIndexCard() {
  const uvIndex = 6;
  
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 px-8">
      <div className="text-center text-white w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Sun className="w-12 h-12 mx-auto mb-8 opacity-90" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-[100px] leading-none tracking-tighter mb-2">
            {uvIndex}
          </div>
          <div className="text-white/80 mb-8">
            UV Index
          </div>
          
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(uvIndex / 11) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-white/90 max-w-xs mx-auto"
        >
          Don't forget the sunscreen for those tiny noses!
        </motion.p>
      </div>
    </div>
  );
}
