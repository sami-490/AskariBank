import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ahmed Khan',
    role: 'Tech Entrepreneur',
    content: "AskariBank has completely transformed how I manage my startup's finances. The AI insights are a game-changer.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=ahmed'
  },
  {
    name: 'Sara Malik',
    role: 'Freelance Designer',
    content: 'The mobile app is so smooth and intuitive. Sending international payments has never been easier or cheaper.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=sara'
  },
  {
    name: 'Zeeshan Ali',
    role: 'Investment Analyst',
    content: 'The security features give me absolute peace of mind. Truly the most advanced digital bank in Pakistan.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=zeeshan'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            What Our <span className="text-gradient">Users Say</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-10 rounded-[40px] border border-white/5 relative group hover:border-glow/30 transition-all"
            >
              <Quote className="absolute top-8 right-8 text-glow/20 group-hover:text-glow/40 transition-colors" size={40} />
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-accent text-accent" />
                ))}
              </div>

              <p className="text-lg text-white/70 italic mb-8 leading-relaxed">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-glow/30" />
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-white/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
