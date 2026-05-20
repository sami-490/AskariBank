import { motion } from 'framer-motion';
import { PieChart, ShieldAlert, Zap, Cpu, Fingerprint, Cloud } from 'lucide-react';
import dashboardImg from '../assets/dashboard.png';

const features = [
  { icon: <Cpu className="text-glow" />, title: 'AI-Powered Budgeting', desc: 'Predictive analysis to help you save more.' },
  { icon: <PieChart className="text-accent" />, title: 'Smart Categorization', desc: 'Auto-sort transactions for better clarity.' },
  { icon: <ShieldAlert className="text-glow" />, title: 'Real-time Fraud Alerts', desc: 'Instant notifications for any suspicious activity.' },
  { icon: <Zap className="text-accent" />, title: 'Multi-currency Wallet', desc: 'Hold and exchange 20+ currencies instantly.' },
  { icon: <Fingerprint className="text-glow" />, title: 'Biometric Login', desc: 'FaceID and fingerprint security integration.' },
  { icon: <Cloud className="text-accent" />, title: 'Secure Cloud Sync', desc: 'Access your financial data across any device.' },
];

const SmartFeatures = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Visuals */}
          <div className="flex-1 relative order-2 lg:order-1 w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.1)] border border-white/10">
                <img src={dashboardImg} alt="Smart Dashboard" className="w-full h-auto" />
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 -right-10 glass p-6 rounded-2xl border border-glow/30 shadow-2xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-glow/20 flex items-center justify-center">
                    <PieChart className="text-glow" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Savings Goal</p>
                    <p className="font-bold text-white">92% Reached</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-10 left-20 glass p-6 rounded-2xl border border-accent/30 shadow-2xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <ShieldAlert className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Security Check</p>
                    <p className="font-bold text-white">All Systems Secure</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 order-1 lg:order-2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-10"
            >
              The Next Step in <br />
              <span className="text-gradient">Financial Intelligence</span>
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-white">{feature.title}</h4>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 btn-primary"
            >
              Experience Smart Banking
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartFeatures;
