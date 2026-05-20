import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, RefreshCw, X, Smartphone } from 'lucide-react';
import { useSmsOtpAutofill } from '../../hooks/useSmsOtpAutofill';

type Props = {
  open: boolean;
  maskedPhone: string;
  smsDelivered: boolean;
  amount: string;
  recipientName: string;
  platformName: string;
  loading: boolean;
  error: string;
  expiresIn?: number;
  devCode?: string;
  onClose: () => void;
  onResend: () => void;
  onVerify: (otp: string) => void;
};

const OtpVerificationModal = ({
  open,
  maskedPhone,
  smsDelivered,
  amount,
  recipientName,
  platformName,
  loading,
  error,
  expiresIn = 60,
  devCode,
  onClose,
  onResend,
  onVerify,
}: Props) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(expiresIn);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join('');

  const reset = useCallback(() => {
    setDigits(['', '', '', '', '', '']);
    setTimer(expiresIn);
    inputsRef.current[0]?.focus();
  }, [expiresIn]);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open || timer <= 0) return;
    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, timer]);

  useSmsOtpAutofill(open, useCallback((code) => {
    const arr = code.split('').slice(0, 6);
    setDigits([...arr, ...Array(6 - arr.length).fill('')]);
  }, []), devCode);

  useEffect(() => {
    if (otp.length === 6 && !loading) onVerify(otp);
  }, [otp, loading, onVerify]);

  const handleChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const arr = pasted.split('');
    setDigits([...arr, ...Array(6 - arr.length).fill('')]);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 24 }}
            className="w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0D9488] p-8 text-white relative"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={18} />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                <Shield size={28} />
              </div>
              <h2 className="text-2xl font-black">Secure Verification</h2>
              <p className="text-white/70 text-sm mt-1 font-medium">
                {smsDelivered
                  ? `SMS sent to ${maskedPhone} — check Google Messages`
                  : `Code sent to ${maskedPhone}`}
              </p>
            </motion.div>

            <div className="bg-white dark:bg-slate-900 p-8 space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <Smartphone className="text-emerald-600 shrink-0" size={22} />
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{platformName}</p>
                  <p className="font-black text-slate-900 dark:text-white">{recipientName}</p>
                  <p className="text-emerald-600 font-black">Rs {parseFloat(amount || '0').toLocaleString()}</p>
                </motion.div>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={loading || timer <= 0}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={`font-bold ${timer <= 10 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {timer > 0 ? `Expires in 0:${String(timer).padStart(2, '0')}` : 'OTP expired'}
                </span>
                <button
                  type="button"
                  disabled={loading || timer > 0}
                  onClick={() => {
                    onResend();
                    reset();
                  }}
                  className="flex items-center gap-1 text-emerald-600 font-bold disabled:opacity-40"
                >
                  <RefreshCw size={14} /> Resend
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-rose-500 font-bold text-sm"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="button"
                disabled={loading || otp.length !== 6 || timer <= 0}
                onClick={() => onVerify(otp)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white font-black text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  'Verify & Transfer'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OtpVerificationModal;
