import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Kid {
  name: string;
  age: string;
}

interface RegistrationCardProps {
  onComplete: (kids: Kid[]) => void;
}

export function RegistrationCard({ onComplete }: RegistrationCardProps) {
  const [kids, setKids] = useState<Kid[]>([{ name: '', age: '' }]);

  const addKid = () => {
    setKids([...kids, { name: '', age: '' }]);
  };

  const removeKid = (index: number) => {
    if (kids.length > 1) {
      setKids(kids.filter((_, i) => i !== index));
    }
  };

  const updateKid = (index: number, field: 'name' | 'age', value: string) => {
    const newKids = [...kids];
    newKids[index][field] = value;
    setKids(newKids);
  };

  const handleContinue = () => {
    const validKids = kids.filter(kid => kid.name.trim() !== '' && kid.age.trim() !== '');
    if (validKids.length > 0) {
      onComplete(validKids);
    }
  };

  const isValid = kids.some(kid => kid.name.trim() !== '' && kid.age.trim() !== '');

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-stone-100 px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-slate-900 mb-3 tracking-tight">
            Welcome to Tiny Weather
          </h1>
          <p className="text-slate-700">
            Let's personalize the weather for your little ones
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {kids.map((kid, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="text-slate-700">Child {index + 1}</div>
                {kids.length > 1 && (
                  <button
                    onClick={() => removeKid(index)}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Name"
                  value={kid.name}
                  onChange={(e) => updateKid(index, 'name', e.target.value)}
                  className="border-slate-200 rounded-2xl text-slate-900"
                />
                <Input
                  type="text"
                  placeholder="Age"
                  value={kid.age}
                  onChange={(e) => updateKid(index, 'age', e.target.value)}
                  className="border-slate-200 rounded-2xl text-slate-900"
                />
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={addKid}
            variant="outline"
            className="w-full rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add another child
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
}