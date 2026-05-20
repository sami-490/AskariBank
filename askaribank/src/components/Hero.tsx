import { motion } from 'framer-motion';
import { ArrowRight, Download, Shield, Zap, Globe, Clock } from 'lucide-react';
import dashboardImg from '../assets/dashboard.png';
import cardsImg from '../assets/cards.png';
import aiWidgetImg from '../assets/ai_widget.png';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-glow/10 border border-glow/20 text-glow text-sm font-semibold mb-6 tracking-wider uppercase">
                Pakistan's Next-Gen Banking
              </span>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Smart Digital Banking <br />
                <span className="text-gradient">for the Future</span>
              </h1>
              <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto lg:mx-0">
                Manage transfers, savings, investments, and payments with Pakistan’s next-generation digital banking platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="btn-primary flex items-center gap-2 group">
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Download size={18} /> Download App
                </button>
              </div>

              {/* Hero Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                {[
                  { icon: <Zap className="text-glow" />, text: 'Instant Transfers' },
                  { icon: <Shield className="text-accent" />, text: 'AI Financial Insights' },
                  { icon: <Globe className="text-glow" />, text: 'Secure Banking' },
                  { icon: <Clock className="text-accent" />, text: '24/7 Access' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex flex-col items-center lg:items-start gap-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-white/80">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hero Visuals */}
          <div className="flex-1 relative w-full max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative"
            >
              {/* Dashboard Mockup */}
              <div className="relative z-20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                <img 
                  src={dashboardImg} 
                  alt="AskariBank Dashboard" 
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 -right-10 z-30 w-1/2 hidden md:block"
              >
                <img src={cardsImg} alt="AskariBank Cards" className="w-full drop-shadow-2xl" />
              </motion.div>

              {/* AI Assistant Widget */}
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-12 -left-12 z-40 w-1/3 hidden md:block"
              >
                <img src={aiWidgetImg} alt="AI Assistant" className="w-full drop-shadow-2xl" />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -z-10 inset-0 bg-gradient-to-br from-glow/20 to-accent/20 blur-3xl opacity-50"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
