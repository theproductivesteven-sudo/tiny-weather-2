import { motion } from 'motion/react';
import { Clock, Sun, CloudRain, Moon, CheckCircle2, AlertCircle } from 'lucide-react';

interface Kid {
  name: string;
  age: string;
}

interface ActivityTimingCardProps {
  kids: Kid[];
}

export function ActivityTimingCard({ kids }: ActivityTimingCardProps) {
  const timeSlots = [
    {
      time: '8:00 AM - 10:00 AM',
      label: 'Morning',
      status: 'ideal',
      temp: '68°',
      description: 'Cool and comfortable for active play',
      icon: Sun,
    },
    {
      time: '10:00 AM - 2:00 PM',
      label: 'Midday',
      status: 'caution',
      temp: '74°',
      description: 'Peak sun - stay hydrated, use shade',
      icon: Sun,
    },
    {
      time: '2:00 PM - 5:00 PM',
      label: 'Afternoon',
      status: 'ideal',
      temp: '72°',
      description: 'Perfect for outdoor adventures',
      icon: Sun,
    },
    {
      time: '5:00 PM - 7:00 PM',
      label: 'Evening',
      status: 'good',
      temp: '65°',
      description: 'Cooling down, bring a light jacket',
      icon: Moon,
    },
  ];

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50 px-8 overflow-y-auto py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-slate-800 mb-2 tracking-tight">
            Best Times for Activities
          </h2>
          <p className="text-slate-600">
            Plan your day around the weather
          </p>
        </motion.div>

        <div className="space-y-3">
          {timeSlots.map((slot, index) => {
            const Icon = slot.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white/80 backdrop-blur-sm rounded-3xl p-5 border ${
                  slot.status === 'ideal'
                    ? 'border-emerald-200'
                    : slot.status === 'caution'
                    ? 'border-amber-200'
                    : 'border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-800">{slot.label}</span>
                      {slot.status === 'ideal' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : slot.status === 'caution' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : null}
                    </div>
                    <div className="text-slate-500">{slot.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${
                      slot.status === 'ideal'
                        ? 'text-emerald-500'
                        : slot.status === 'caution'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }`} />
                    <span className="text-slate-700">{slot.temp}</span>
                  </div>
                </div>
                <p className="text-slate-600">{slot.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-white/40"
        >
          <div className="text-slate-700 mb-2">💡 Tip for today</div>
          <p className="text-slate-600">
            Bring water bottles and seek shade during peak sun hours (10 AM - 2 PM)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
