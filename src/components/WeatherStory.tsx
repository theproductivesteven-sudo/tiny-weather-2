import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistrationCard } from './cards/RegistrationCard';
import { TodayOverviewCard } from './cards/TodayOverviewCard';
import { OutfitPieceCard } from './cards/OutfitPieceCard';
import { ActivityTimeCard } from './cards/ActivityTimeCard';
import { HomeScreen } from './cards/HomeScreen';
import { ChevronDown } from 'lucide-react';
import { useTinyWeather } from '../index.js';

export function WeatherStory() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [kids, setKids] = useState<Array<{ name: string; age: string }>>([]);

  // Connect to weather brains
  const { 
    weather, 
    outfits, 
    activities, 
    tips, 
    isLoading,
    addChild,
  } = useTinyWeather({
    apiKey: import.meta.env.VITE_WEATHER_API_KEY,
    useMockData: false, // Set to false when you have a real API key
  });

  const handleRegistrationComplete = (kidsData: Array<{ name: string; age: string }>) => {
    setKids(kidsData);
    
    // Add kids to the weather engine
    kidsData.forEach(kid => {
      const ageMonths = parseInt(kid.age) * 12; // Convert years to months
      addChild(kid.name, ageMonths);
    });
    
    setCurrentSlide(1);
  };

  const firstKid = kids.length > 0 ? kids[0] : null;
  const firstOutfit = outfits.length > 0 ? outfits[0] : null;

  const cards = [
    <RegistrationCard key="registration" onComplete={handleRegistrationComplete} />,
    <TodayOverviewCard 
      key="overview" 
      weather={weather}
      tips={tips}
    />,
    <OutfitPieceCard 
      key="outfit1" 
      piece="base"
      kidName={firstKid?.name}
      outfit={firstOutfit}
      currentPiece={1}
      totalPieces={3}
    />,
    <OutfitPieceCard 
      key="outfit2" 
      piece="layer"
      kidName={firstKid?.name}
      outfit={firstOutfit}
      currentPiece={2}
      totalPieces={3}
    />,
    <OutfitPieceCard 
      key="outfit3" 
      piece="accessories"
      kidName={firstKid?.name}
      outfit={firstOutfit}
      currentPiece={3}
      totalPieces={3}
    />,
    <ActivityTimeCard 
      key="activity1"
      timeSlot="morning"
      activities={activities}
      currentSlot={1}
      totalSlots={3}
    />,
    <ActivityTimeCard 
      key="activity2"
      timeSlot="midday"
      activities={activities}
      currentSlot={2}
      totalSlots={3}
    />,
    <ActivityTimeCard 
      key="activity3"
      timeSlot="afternoon"
      activities={activities}
      currentSlot={3}
      totalSlots={3}
    />,
    <HomeScreen 
      key="home" 
      weather={weather}
      activities={activities}
    />
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      if (currentSlide < cards.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }
    if (touchStart - touchEnd < -50) {
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
