import { motion } from 'motion/react';
import { Shirt, Wind, Sun } from 'lucide-react';

interface OutfitItem {
  id: string;
  name: string;
  layer: string;
  emoji: string;
  required: boolean;
  reason?: string;
}

interface Outfit {
  childName: string;
  items: OutfitItem[];
  tips: string[];
  morningTemp: number;
  afternoonTemp: number;
  needsSunProtection: boolean;
}

interface OutfitPieceCardProps {
  piece: 'base' | 'layer' | 'accessories';
  kidName?: string;
  outfit?: Outfit | null;
  currentPiece: number;
  totalPieces: number;
}

export function OutfitPieceCard({ piece, kidName, outfit, currentPiece, totalPieces }: OutfitPieceCardProps) {
  
  // Map piece type to outfit layer
  const getItemsForPiece = () => {
    if (!outfit) return null;
    
    switch (piece) {
      case 'base':
        return outfit.items.find(i => i.layer === 'base');
      case 'layer':
        return outfit.items.find(i => i.layer === 'mid' || i.layer === 'outer');
      case 'accessories':
        return outfit.items.find(i => i.layer === 'accessory');
      default:
        return null;
    }
  };

  const outfitItem = getItemsForPiece();
  const tip = outfit?.tips?.[0] || null;

  // Default configs (used as fallback)
  const defaultConfigs = {
    base: {
      gradient: 'from-amber-50 via-orange-50 to-amber-50',
      icon: Shirt,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'Start with the basics',
      item: 'Short-sleeve t-shirt',
      description: 'Light, breathable fabric for comfort',
      emoji: '👕',
      tip: 'Cotton or moisture-wicking material works best'
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
      description: 'Protect those tiny faces',
      emoji: '🧢',
      tip: 'Reapply sunscreen every 2 hours during outdoor play'
    }
  };

  const defaultConfig = defaultConfigs[piece];
  const Icon = defaultConfig.icon;

  // Build dynamic description
  const getDescription = () => {
    if (!outfit) return defaultConfig.description;
    
    if (piece === 'base') {
      return `For the ${outfit.morningTemp}° to ${outfit.afternoonTemp}° day ahead`;
    }
    if (piece === 'layer') {
      return outfitItem?.reason || 'Easy to take on and off as temperature changes';
    }
    if (piece === 'accessories' && outfit.needsSunProtection) {
      return 'UV is high today - protect those tiny faces';
    }
    return outfitItem?.reason || defaultConfig.description;
  };

  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-b ${defaultConfig.gradient} px-8`}>
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
          <div className={`w-32 h-32 rounded-full ${defaultConfig.iconBg} flex items-center justify-center mx-auto mb-6`}>
            <span className="text-6xl">{outfitItem?.emoji || defaultConfig.emoji}</span>
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
            {defaultConfig.title}
          </h2>
          <div className="text-3xl text-slate-900 mb-3">
            {outfitItem?.name || defaultConfig.item}
          </div>
          <p className="text-slate-600">
            {getDescription()}
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
            <Icon className={`w-5 h-5 ${defaultConfig.iconColor} flex-shrink-0 mt-0.5`} />
            <p className="text-slate-700 text-left">
              {tip || defaultConfig.tip}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
