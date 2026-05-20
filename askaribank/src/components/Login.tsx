import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onSignupClick: () => void;
  onLoginSuccess: (user: any) => void;
}

const Login = ({ onSignupClick, onLoginSuccess }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mockResetLink, setMockResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setMockResetLink('');

    try {
      if (isForgotPassword) {
        const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: formData.email });
        setMessage('Security link generated successfully!');
        setMockResetLink(data.resetLink);
      } else {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isForgotPassword ? 'Could not generate recovery link.' : 'Authentication failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900/50 rounded-[60px] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800 backdrop-blur-xl relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-8 p-3 border border-slate-50 dark:border-slate-700"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              <path d="M50 5 L 10 50 L 50 95" fill="#0A3D73" className="dark:fill-blue-500" />
              <path d="M50 5 L 90 50 L 50 95" fill="#A0AEC0" className="dark:fill-slate-400" />
            </svg>
          </motion.div>
          <h1 className="text-5xl font-black text-[#0F172A] dark:text-white mb-2 tracking-tighter">AskariBank</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {isForgotPassword ? 'Secure Password Recovery' : 'Premium Banking Portal'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 p-5 rounded-3xl mb-8 text-xs font-black text-center border border-rose-100 dark:border-rose-500/20"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-6 rounded-[32px] mb-8 text-xs font-black text-center border border-emerald-100 dark:border-emerald-500/20 space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> {message}
              </div>
              {mockResetLink && (
                <div className="pt-4 border-t border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Mock Reset Link:</p>
                  <a href={mockResetLink} className="text-blue-500 dark:text-blue-400 underline break-all font-bold block p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
                    {mockResetLink}
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F172A] dark:group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="email@example.com" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-[28px] py-5 pl-16 pr-6 focus:border-[#0F172A] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-[#0F172A] dark:text-white font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isForgotPassword && (
              <motion.div 
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F172A] dark:group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required={!isForgotPassword}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-[28px] py-5 pl-16 pr-14 focus:border-[#0F172A] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-[#0F172A] dark:text-white font-bold outline-none transition-all shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0F172A] dark:hover:text-white transition-all"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                <div className="flex justify-end pt-2 px-2">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] font-black text-slate-400 hover:text-[#0F172A] dark:hover:text-blue-500 uppercase tracking-tighter transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F172A] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? 'Processing...' : (isForgotPassword ? 'Generate Recovery Link' : 'Secure Login')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          {isForgotPassword ? (
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="flex items-center justify-center w-full text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={18} className="mr-3" /> Return to Login
            </button>
          ) : (
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              New to AskariBank?{' '}
              <button 
                onClick={onSignupClick}
                className="text-[#0F172A] dark:text-blue-500 font-black hover:scale-105 transition-transform inline-block ml-2"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
