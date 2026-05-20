import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import cardsImg from '../assets/cards.png';

const CardFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-white/50">{desc}</p>
    </div>
  </div>
);

const CardsSection = () => {
  const cardTypes = [
    { name: 'Platinum Card', color: 'from-gray-400 to-black', benefits: 'Luxury Travel & Rewards' },
    { name: 'Business Card', color: 'from-amber-400 to-primary', benefits: 'Expense Management' },
    { name: 'Virtual Card', color: 'from-glow to-primary', benefits: 'Safe Online Shopping' },
    { name: 'Student Card', color: 'from-accent to-primary', benefits: 'Zero Fees & Savings' },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            A Card for Every <span className="text-gradient">Lifestyle</span>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.div
              whileHover={{ rotateY: 10, rotateX: -5 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="relative perspective-1000"
            >
              <img src={cardsImg} alt="AskariBank Premium Cards" className="w-full h-auto drop-shadow-[0_0_80px_rgba(6,182,212,0.1)]" />
              
              <div className="absolute inset-0 bg-gradient-to-tr from-glow/10 to-transparent pointer-events-none rounded-3xl"></div>
            </motion.div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {cardTypes.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl border border-white/5 hover:border-glow/30 transition-all group overflow-hidden relative"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <h3 className="text-xl font-bold mb-2 text-white">{card.name}</h3>
                <p className="text-sm text-glow font-medium mb-6">{card.benefits}</p>
                
                <div className="space-y-4">
                  <CardFeature icon={<Shield size={16} className="text-glow" />} title="Secure" desc="E2E Encryption" />
                  <CardFeature icon={<Zap size={16} className="text-accent" />} title="Instant" desc="One-tap Activation" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
