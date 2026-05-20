import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Phone, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MobileRechargePage = ({ refreshUser }: { user: any, refreshUser: () => void }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const networks = [
    { id: 'jazz', name: 'Jazz', color: 'bg-white', icon: '/images/operators/jazz.png' },
    { id: 'telenor', name: 'Telenor', color: 'bg-white', icon: '/images/operators/telenor.png' },
    { id: 'zong', name: 'Zong', color: 'bg-white', icon: '/images/operators/zong.png' },
    { id: 'ufone', name: 'Ufone', color: 'bg-white', icon: '/images/operators/ufone.png' },
  ];

  const amounts = ['100', '200', '500', '1000', '2000', '5000'];

  const handleRecharge = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/recharge', {
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      refreshUser();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert('Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 sm:p-10 transition-colors duration-500">
      <div className="flex items-center gap-6 mb-8 sm:mb-12 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">Mobile Recharge</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Instant top-up for any network</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] p-10 sm:p-20 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
          >
             <div className="w-20 h-20 sm:w-24 h-24 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
               <CheckCircle2 size={48} />
             </div>
             <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white mb-4">Recharge Successful!</h2>
             <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium">Rs {amount} has been topped up to {phoneNumber}</p>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 shadow-2xl border border-slate-100 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Side: Form */}
            <div className="space-y-8 sm:space-y-12">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">Enter Details</h3>
                <div className="relative">
                   <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                   <input 
                    type="text" 
                    placeholder="+92 3XX XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold text-lg focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-white/5 border border-slate-100 dark:border-slate-700 text-slate-950 dark:text-white outline-none transition-all"
                   />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">Select Network</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {networks.map(net => (
                    <button 
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border-2 ${
                        selectedNetwork === net.id 
                          ? 'border-[#0F172A] dark:border-white bg-[#0F172A]/5 dark:bg-white/5' 
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-14 h-14 ${net.color} rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800/80`}>
                        <img src={net.icon} alt={net.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-60">{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Amounts */}
            <div className="space-y-8 sm:space-y-12">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-955 dark:text-white">Recharge Amount</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {amounts.map(amt => (
                    <button 
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-4 rounded-2xl font-black text-base sm:text-lg transition-all border-2 ${
                        amount === amt 
                          ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Rs {amt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-4">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500">Rs</span>
                  <input 
                    type="number" 
                    placeholder="Custom Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border border-slate-100 dark:border-slate-700 text-slate-950 dark:text-white focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !phoneNumber || !amount || !selectedNetwork}
                onClick={handleRecharge}
                className="w-full py-6 bg-[#0F172A] dark:bg-blue-600 text-white rounded-[32px] font-black text-lg sm:text-xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : <><Zap size={24} /> Process Recharge</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileRechargePage;

