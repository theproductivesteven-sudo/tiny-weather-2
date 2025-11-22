import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistrationCard } from './cards/RegistrationCard';
import { TodayOverviewCard } from './cards/TodayOverviewCard';
import { OutfitPieceCard } from './cards/OutfitPieceCard';
import { ActivityTimeCard } from './cards/ActivityTimeCard';
import { HomeScreen } from './cards/HomeScreen';
import { ChevronDown } from 'lucide-react';

export function WeatherStory() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [kids, setKids] = useState<Array<{ name: string; age: string }>>([]);

  const handleRegistrationComplete = (kidsData: Array<{ name: string; age: string }>) => {
    setKids(kidsData);
    setCurrentSlide(1);
  };

  const firstKid = kids.length > 0 ? kids[0] : null;

  const cards = [
    <RegistrationCard key="registration" onComplete={handleRegistrationComplete} />,
    <TodayOverviewCard key="overview" />,
    <OutfitPieceCard 
      key="outfit1" 
      piece="base"
      kidName={firstKid?.name}
      currentPiece={1}
      totalPieces={3}
    />,
    <OutfitPieceCard 
      key="outfit2" 
      piece="layer"
      kidName={firstKid?.name}
      currentPiece={2}
      totalPieces={3}
    />,
    <OutfitPieceCard 
      key="outfit3" 
      piece="accessories"
      kidName={firstKid?.name}
      currentPiece={3}
      totalPieces={3}
    />,
    <ActivityTimeCard 
      key="activity1"
      timeSlot="morning"
      currentSlot={1}
      totalSlots={3}
    />,
    <ActivityTimeCard 
      key="activity2"
      timeSlot="midday"
      currentSlot={2}
      totalSlots={3}
    />,
    <ActivityTimeCard 
      key="activity3"
      timeSlot="afternoon"
      currentSlot={3}
      totalSlots={3}
    />,
    <HomeScreen key="home" />
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      if (currentSlide < cards.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }

    if (touchStart - touchEnd < -50) {
      // Swipe down
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentSlide < cards.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (e.deltaY < 0 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div 
      className="h-screen overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="h-screen"
        >
          {cards[currentSlide]}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {currentSlide < cards.length - 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      )}
    </div>
  );
}