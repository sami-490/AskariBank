import { motion } from 'framer-motion';
import { Apple, PlayCircle } from 'lucide-react';
import mobileAppImg from '../assets/mobile_app.png';

const AppShowcase = () => {
  return (
    <section className="py-24 bg-surface/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-8"
            >
              Banking in <span className="text-gradient">Your Pocket</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 mb-12 max-w-xl mx-auto lg:mx-0"
            >
              Take full control of your finances with our top-rated mobile application. 
              Manage cards, track spending, and send money with a single tap.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <button className="flex items-center gap-4 bg-white text-primary px-8 py-4 rounded-2xl font-bold transition-all hover:bg-white/90 hover:scale-105">
                <Apple fill="currentColor" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] uppercase opacity-70">Download on the</p>
                  <p className="text-lg">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-4 bg-white/5 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-white/10 hover:scale-105">
                <PlayCircle fill="currentColor" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] uppercase opacity-70">Get it on</p>
                  <p className="text-lg">Google Play</p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16">
              {[
                'Real-time Analytics',
                'Instant Card Freeze',
                'Biometric Pay',
                'Global Access',
                '24/7 Support',
                'Zero Fees'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <img src={mobileAppImg} alt="AskariBank App" className="w-full h-auto drop-shadow-[0_0_50px_rgba(16,185,129,0.2)]" />
            </motion.div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/5 rounded-full blur-[100px] -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
