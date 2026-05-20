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
    { id: 'jazz', name: 'Jazz', color: 'bg-red-500', icon: '⚡' },
    { id: 'telenor', name: 'Telenor', color: 'bg-blue-500', icon: '📶' },
    { id: 'zong', name: 'Zong', color: 'bg-green-500', icon: '🌿' },
    { id: 'ufone', name: 'Ufone', color: 'bg-orange-500', icon: '📡' },
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
    <div className="min-h-screen bg-white dark:bg-[#020617] p-10 transition-colors duration-500">
      <div className="flex items-center gap-6 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Mobile Recharge</h1>
          <p className="text-black font-medium opacity-70">Instant top-up for any network</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {success ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[48px] p-20 text-center shadow-2xl border border-slate-100">
             <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
               <CheckCircle2 size={48} />
             </div>
             <h2 className="text-3xl font-black text-[#0F172A] mb-4">Recharge Successful!</h2>
             <p className="text-black text-lg font-medium opacity-70">Rs {amount} has been topped up to {phoneNumber}</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Side: Form */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-black">Enter Details</h3>
                <div className="relative">
                   <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40" size={20} />
                   <input 
                    type="text" 
                    placeholder="+92 3XX XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all border-none text-black"
                   />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-black">Select Network</h3>
                <div className="grid grid-cols-4 gap-4">
                  {networks.map(net => (
                    <button 
                      key={net.id}
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border-2 ${selectedNetwork === net.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                    >
                      <div className={`w-14 h-14 ${net.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg`}>
                        {net.icon}
                      </div>
                      <span className="text-xs font-black text-black uppercase tracking-widest opacity-60">{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Amounts */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-black">Recharge Amount</h3>
                <div className="grid grid-cols-3 gap-4">
                  {amounts.map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${amount === amt ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-slate-50 text-black border-transparent hover:bg-slate-100'}`}
                    >
                      Rs {amt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-4">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-black/40">Rs</span>
                  <input 
                    type="number" 
                    placeholder="Custom Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-8 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-primary/10 text-black"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !phoneNumber || !amount || !selectedNetwork}
                onClick={handleRecharge}
                className="w-full py-6 bg-[#0F172A] text-white rounded-[32px] font-black text-xl shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
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
