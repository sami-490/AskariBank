import { motion } from 'framer-motion';

const StatCard = ({ value, label, prefix = "", suffix = "" }: { value: string, label: string, prefix?: string, suffix?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-8 rounded-3xl text-center glow-card border border-white/5 hover:border-glow/30"
    >
      <h3 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">
        {prefix}{value}{suffix}
      </h3>
      <p className="text-white/60 font-medium">{label}</p>
    </motion.div>
  );
};

const Stats = () => {
  const stats = [
    { value: '5', suffix: 'M+', label: 'Active Users' },
    { prefix: 'PKR ', value: '500', suffix: 'B+', label: 'Transactions' },
    { value: '99.99', suffix: '%', label: 'Secure Payments' },
    { value: '24/7', label: 'Banking Support' },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] bg-glow/5 blur-[120px] -z-10"></div>
    </section>
  );
};

export default Stats;
