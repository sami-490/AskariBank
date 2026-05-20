import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Personal Banking', href: '#' },
    { name: 'Business Banking', href: '#' },
    { name: 'Digital Wallet', href: '#' },
    { name: 'Investments', href: '#' },
    { name: 'Cards', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-4 bg-background/80 backdrop-blur-lg border-b border-white/10' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-glow to-primary rotate-45 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            <div className="absolute inset-[2px] bg-background rotate-45 rounded-sm flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-tr from-accent to-glow rotate-45"></div>
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            askari<span className="text-glow">Bank</span>
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm font-medium text-white/70 hover:text-glow transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-glow transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 text-sm font-semibold text-white hover:text-glow transition-colors"
          >
            Login
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 text-sm font-bold bg-accent text-primary rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95"
          >
            Open Account
          </motion.button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-white/80 hover:text-glow"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                <button className="w-full py-4 text-center text-white font-semibold bg-white/5 rounded-xl">
                  Login
                </button>
                <button className="w-full py-4 text-center bg-accent text-primary font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  Open Account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
