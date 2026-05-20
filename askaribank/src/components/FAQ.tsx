import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-6 rounded-2xl transition-all ${
          isOpen ? 'bg-white/10 border-glow/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
        } border`}
      >
        <span className="text-left font-bold text-lg md:text-xl">{question}</span>
        {isOpen ? <Minus className="text-glow" /> : <Plus className="text-glow" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 text-white/60 leading-relaxed text-lg">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    { question: 'How to open an account?', answer: 'Opening an account is simple. Download our mobile app, verify your identity with biometric data, and your account will be ready in minutes.' },
    { question: 'Is AskariBank secure?', answer: 'Yes, we use military-grade encryption and AI-powered fraud detection systems to ensure your funds and data are protected 24/7.' },
    { question: 'How fast are transfers?', answer: 'Domestic transfers are instant. International transfers usually take between 30 minutes to a few hours depending on the destination.' },
    { question: 'Can I use international payments?', answer: 'Absolutely. Our virtual and physical cards are accepted worldwide, and you can send money to over 150 countries instantly.' },
    { question: 'Are there business accounts?', answer: 'Yes, we offer specialized business accounts with payroll management, bulk payments, and advanced analytics for companies of all sizes.' },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Frequently Asked <span className="text-gradient">Questions</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <FAQItem {...faq} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
