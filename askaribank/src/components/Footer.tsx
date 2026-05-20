import { Send, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-glow to-primary rotate-45 rounded-sm"></div>
                <div className="absolute inset-[1px] bg-background rotate-45 rounded-sm"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                askari<span className="text-glow">Bank</span>
              </span>
            </div>
            <p className="text-white/50 mb-8 leading-relaxed">
              Leading the digital banking revolution in Pakistan. Secure, smart, and futuristic financial solutions for everyone.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Globe, Globe, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-glow hover:bg-white/10 transition-all border border-white/10">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-8">Services</h4>
            <ul className="space-y-4">
              {['Personal Banking', 'Business Banking', 'Digital Wallet', 'Investments', 'Cards', 'Insurance'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/50 hover:text-glow transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-8">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-white/50">
                <Phone size={18} className="text-glow" />
                <span>+92 21 111-ASKARI</span>
              </li>
              <li className="flex items-center gap-4 text-white/50">
                <Mail size={18} className="text-glow" />
                <span>support@askaribank.com</span>
              </li>
              <li className="flex items-center gap-4 text-white/50">
                <MapPin size={18} className="text-glow" />
                <span>Askari Tower, Karachi, Pakistan</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8">Newsletter</h4>
            <p className="text-white/50 mb-6 text-sm">Subscribe to get latest updates and financial insights.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-glow transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-glow text-primary px-4 rounded-lg hover:scale-105 transition-transform">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:row items-center justify-between gap-6 text-white/30 text-sm">
          <p>© 2026 AskariBank. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
