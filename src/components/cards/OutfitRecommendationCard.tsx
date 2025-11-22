import { motion } from 'motion/react';
import { Shirt, Sun, Cloud } from 'lucide-react';

interface Kid {
  name: string;
  age: string;
}

interface OutfitRecommendationCardProps {
  kids: Kid[];
}

export function OutfitRecommendationCard({ kids }: OutfitRecommendationCardProps) {
  const getOutfitForAge = (age: string) => {
    const ageNum = parseInt(age);
    if (ageNum <= 3) {
      return {
        main: 'Light onesie or romper',
        layer: 'Thin cardigan for breeze',
        extra: 'Sun hat'
      };
    } else if (ageNum <= 7) {
      return {
        main: 'T-shirt and shorts',
        layer: 'Light hoodie or jacket',
        extra: 'Sneakers for running'
      };
    } else {
      return {
        main: 'Short sleeve shirt',
        layer: 'Light zip-up jacket',
        extra: 'Comfortable shoes'
      };
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 px-8 overflow-y-auto py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Shirt className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-slate-800 mb-2 tracking-tight">
            What to Wear Today
          </h2>
          <p className="text-slate-600">
            Outfit recommendations for 72° and sunny
          </p>
        </motion.div>

        <div className="space-y-4">
          {kids.length > 0 ? (
            kids.map((kid, index) => {
              const outfit = getOutfitForAge(kid.age);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/60"
                >
                  <div className="mb-4">
                    <div className="text-slate-800">{kid.name}</div>
                    <div className="text-slate-500">Age {kid.age}</div>
                  </div>
                  <div className="space-y-3 text-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                      <div>{outfit.main}</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                      <div>{outfit.layer}</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                      <div>{outfit.extra}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/60"
            >
              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                  <div>Light layers - T-shirt base</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                  <div>Thin jacket or hoodie for breeze</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                  <div>Sun hat and comfortable shoes</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 bg-blue-50 rounded-3xl p-4 border border-blue-100"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Don't forget sunscreen! UV index is 6</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
