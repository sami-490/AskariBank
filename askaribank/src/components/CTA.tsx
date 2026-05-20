import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary via-surface to-background border border-white/10 p-12 md:p-24 text-center group"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Experience the Future <br />
              <span className="text-gradient">of Digital Banking</span>
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Join 5M+ users who are already banking smarter. Open your AskariBank account today and take control of your financial destiny.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="btn-primary text-lg px-12 py-5 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                Open Account
              </button>
              <button className="btn-secondary text-lg px-12 py-5 flex items-center gap-3 group/btn">
                Start Banking <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Floating blobs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-glow/20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
