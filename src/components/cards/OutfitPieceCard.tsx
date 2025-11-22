import { motion } from 'motion/react';
import { Shirt, Wind, Sun } from 'lucide-react';

interface OutfitPieceCardProps {
  piece: 'base' | 'layer' | 'accessories';
  kidName?: string;
  currentPiece: number;
  totalPieces: number;
}

export function OutfitPieceCard({ piece, kidName, currentPiece, totalPieces }: OutfitPieceCardProps) {
  const configs = {
    base: {
      gradient: 'from-amber-50 via-orange-50 to-amber-50',
      icon: Shirt,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'Start with the basics',
      item: 'Short-sleeve t-shirt',
      description: 'Light, breathable fabric for comfort',
      emoji: '👕',
      tip: 'Cotton or moisture-wicking material works best at 72°'
    },
    layer: {
      gradient: 'from-sky-50 via-blue-50 to-sky-50',
      icon: Wind,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Add a light layer',
      item: 'Zip-up hoodie or cardigan',
      description: 'Easy to take on and off as temperature changes',
      emoji: '🧥',
      tip: 'Perfect for the morning chill and evening breeze'
    },
    accessories: {
      gradient: 'from-rose-50 via-pink-50 to-rose-50',
      icon: Sun,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
      title: "Don't forget protection",
      item: 'Sun hat & sunscreen',
      description: 'UV index is 6 today - protect those tiny faces',
      emoji: '🧢',
      tip: 'Reapply sunscreen every 2 hours during outdoor play'
    }
  };

  const config = configs[piece];
  const Icon = config.icon;

  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-b ${config.gradient} px-8`}>
      <div className="w-full max-w-md text-center">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {Array.from({ length: totalPieces }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i + 1 === currentPiece 
                  ? 'w-8 bg-slate-700' 
                  : i + 1 < currentPiece
                  ? 'w-8 bg-slate-400'
                  : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <div className={`w-32 h-32 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}>
            <span className="text-6xl">{config.emoji}</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          {kidName && (
            <div className="text-slate-500 mb-3">
              For {kidName}
            </div>
          )}
          <h2 className="text-slate-800 mb-4 tracking-tight">
            {config.title}
          </h2>
          <div className="text-3xl text-slate-900 mb-3">
            {config.item}
          </div>
          <p className="text-slate-600">
            {config.description}
          </p>
        </motion.div>

        {/* Tip card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
            <p className="text-slate-700 text-left">
              {config.tip}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}