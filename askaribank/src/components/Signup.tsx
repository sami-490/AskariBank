import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface SignupProps {
  onLoginClick: () => void;
}

const Signup = ({ onLoginClick }: SignupProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      // Instead of auto-logging in, we send them to login screen as requested
      onLoginClick(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black text-black tracking-tighter">Create Account</h1>
          <p className="text-black font-bold opacity-60">
            Join AskariBank for a premium experience
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold text-center border border-rose-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-black text-black ml-1 uppercase tracking-widest text-[10px]">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1B3A6B]/30 focus:ring-4 focus:ring-[#1B3A6B]/5 outline-none transition-all font-bold text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black ml-1 uppercase tracking-widest text-[10px]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1B3A6B]/30 focus:ring-4 focus:ring-[#1B3A6B]/5 outline-none transition-all font-bold text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black ml-1 uppercase tracking-widest text-[10px]">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+92 300 0000000"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1B3A6B]/30 focus:ring-4 focus:ring-[#1B3A6B]/5 outline-none transition-all font-bold text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black ml-1 uppercase tracking-widest text-[10px]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1B3A6B]/30 focus:ring-4 focus:ring-[#1B3A6B]/5 outline-none transition-all font-bold text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black ml-1 uppercase tracking-widest text-[10px]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1B3A6B]/30 focus:ring-4 focus:ring-[#1B3A6B]/5 outline-none transition-all font-bold text-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#1B3A6B] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:bg-[#152e55] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs font-black text-black uppercase tracking-widest">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-[#1B3A6B] hover:underline font-black ml-1 transition-all"
            >
              Log In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
