import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'send' | 'recharge';
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
  const [formData, setFormData] = useState({
    recipientAccount: '',
    amount: '',
    type: 'send'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'send' ? '/api/user/transfer' : '/api/user/recharge';
      const payload = type === 'send' ? {
        recipientAccount: formData.recipientAccount,
        amount: parseFloat(formData.amount),
        type: 'send'
      } : {
        amount: parseFloat(formData.amount)
      };

      const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          setSuccess(false);
          setFormData({ recipientAccount: '', amount: '', type: 'send' });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
            >
              {success ? (
                <div className="text-center py-10 space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Success!</h2>
                    <p className="text-slate-500">Your transaction has been completed.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-[#0F172A]">
                      {type === 'send' ? 'Send Money' : 'Recharge Wallet'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {type === 'send' && (
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Recipient Account Number"
                          required
                          value={formData.recipientAccount}
                          onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                          className="input-field pl-16 border-2 border-slate-100"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                      <input
                        type="number"
                        placeholder="Amount (Rs)"
                        required
                        min="1"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="input-field pl-16 border-2 border-slate-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-swift flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          <Send size={20} />
                          {type === 'send' ? 'Confirm Transfer' : 'Confirm Recharge'}
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransferModal;
