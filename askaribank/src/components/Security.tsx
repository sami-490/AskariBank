import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Cpu, Database, Fingerprint } from 'lucide-react';

const Security = () => {
  const securityFeatures = [
    { icon: <Lock />, title: 'End-to-End Encryption', desc: 'Your data is encrypted at every stage of the transaction.' },
    { icon: <Cpu />, title: 'AI Fraud Detection', desc: 'Predictive modeling to identify and block suspicious activity.' },
    { icon: <Database />, title: 'Secure Infrastructure', desc: 'Distributed cloud infrastructure with 99.99% uptime.' },
    { icon: <Fingerprint />, title: 'Biometric Auth', desc: 'Multi-layer authentication including facial recognition.' },
    { icon: <Eye />, title: 'Real-time Monitoring', desc: 'Continuous surveillance of your account security status.' },
    { icon: <ShieldCheck />, title: 'PCI-DSS Compliant', desc: 'Meeting the highest global standards for financial data safety.' },
  ];

  return (
    <section className="py-24 bg-surface/20 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex gap-10 text-glow whitespace-nowrap text-xs font-mono animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
            {Array.from({ length: 10 }).map((_, j) => (
              <span key={j}>010110100101101110100101001100101</span>
            ))}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 text-accent shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Fortress-Level <span className="text-gradient">Security</span>
          </motion.h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            We employ cutting-edge cybersecurity protocols to ensure your wealth and data are protected by the most advanced systems in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-8 rounded-3xl border border-white/5 hover:border-accent/30 transition-all group"
            >
              <div className="text-accent mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
