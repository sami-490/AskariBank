import { motion } from 'framer-motion';
import { 
  Wallet, Send, QrCode, CreditCard, PiggyBank, Briefcase, 
  LineChart, Brain, Landmark, ShieldCheck, Bitcoin, Smartphone 
} from 'lucide-react';

const services = [
  { icon: <Wallet className="text-glow" />, title: 'Digital Wallet', desc: 'Securely store and manage your digital assets with ease.' },
  { icon: <Send className="text-accent" />, title: 'International Transfers', desc: 'Send money globally with competitive rates and zero delays.' },
  { icon: <QrCode className="text-glow" />, title: 'QR Payments', desc: 'Instant touch-free payments at thousands of merchants.' },
  { icon: <Smartphone className="text-accent" />, title: 'Mobile Top-Ups', desc: 'Quick recharges and utility bill payments in seconds.' },
  { icon: <PiggyBank className="text-glow" />, title: 'Savings Accounts', desc: 'High-yield savings with automated goal tracking.' },
  { icon: <Briefcase className="text-accent" />, title: 'Business Banking', desc: 'Full-stack financial tools for startups and enterprises.' },
  { icon: <LineChart className="text-glow" />, title: 'Investment Portfolios', desc: 'AI-driven investment strategies tailored to your goals.' },
  { icon: <Brain className="text-accent" />, title: 'AI Expense Tracking', desc: 'Automated insights into your spending habits.' },
  { icon: <Landmark className="text-glow" />, title: 'Loan Management', desc: 'Instant credit lines and flexible repayment options.' },
  { icon: <ShieldCheck className="text-accent" />, title: 'Insurance Services', desc: 'Comprehensive protection for what matters most.' },
  { icon: <Bitcoin className="text-glow" />, title: 'Crypto & Forex', desc: 'Real-time monitoring and instant trading features.' },
  { icon: <CreditCard className="text-accent" />, title: 'Virtual Banking Cards', desc: 'Generate instant cards for secure online shopping.' },
];

const Services = () => {
  return (
    <section className="py-24 bg-background relative" id="services">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Explore Our <span className="text-gradient">Premium Services</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 max-w-2xl mx-auto"
          >
            A comprehensive suite of digital financial tools designed for the modern user. 
            Experience banking without boundaries.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass p-8 rounded-3xl glow-card border border-white/5 hover:border-glow/30 flex flex-col group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-glow transition-colors">
                {service.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {service.desc}
              </p>
              
              <div className="mt-6 flex items-center text-glow text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More <Send size={14} className="ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
