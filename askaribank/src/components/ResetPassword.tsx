import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password
      });
      setMessage('Security Code updated! Synchronizing credentials...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Security breach detected. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mb-64 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900/50 rounded-[60px] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800 backdrop-blur-xl relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl shadow-xl flex items-center justify-center mb-8 p-3 border border-emerald-100 dark:border-emerald-500/20"
          >
            <ShieldCheck size={40} className="text-emerald-500" />
          </motion.div>
          <h1 className="text-4xl font-black text-[#0F172A] dark:text-white mb-2 tracking-tighter">New Security Code</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] text-center px-4">
            Create a high-entropy password for your account
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
              className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-6 rounded-[32px] mb-8 text-xs font-black text-center border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">{message}</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 opacity-70">Securing your vault...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!message && (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">New Credential</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F172A] dark:group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Confirm Credential</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F172A] dark:group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-[28px] py-5 pl-16 pr-14 focus:border-[#0F172A] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-[#0F172A] dark:text-white font-bold outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F172A] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? 'Processing...' : 'Secure Vault'}
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center justify-center w-full text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={18} className="mr-3" /> Return to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
