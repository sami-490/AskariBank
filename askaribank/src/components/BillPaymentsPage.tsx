import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Droplet, Flame, Globe, History, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BillPaymentsPage = ({ user, refreshUser }: { user: any, refreshUser: () => void }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Electricity');
  const [loading, setLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  
  const categories = [
    { id: 'Electricity', icon: Zap },
    { id: 'Water', icon: Droplet },
    { id: 'Gas', icon: Flame },
    { id: 'Internet', icon: Globe },
  ];

  const bills = [
    { id: 1, name: 'IESCO Electricity', ref: '14 12345 6789012 U', dueDate: 'Oct 20, 2026', amount: 12450.50, category: 'Electricity' },
    { id: 2, name: 'SNGPL Gas', ref: '9283 1726 3544', dueDate: 'Oct 15, 2026', amount: 3210.00, category: 'Gas' },
    { id: 3, name: 'PTCL Broadband', ref: '051 2233445', dueDate: 'Oct 25, 2026', amount: 4500.00, category: 'Internet' },
  ].filter(b => b.category === selectedCategory);

  const handlePayBill = async (bill: any) => {
    setLoading(bill.id);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/transfer', {
        recipientAccount: bill.ref,
        recipientName: bill.name,
        amount: bill.amount,
        type: 'bill',
        targetType: bill.category.toLowerCase()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(bill.id);
      refreshUser();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert('Payment failed. Please check your balance.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] px-4 py-8 md:p-10 transition-colors duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">Bill Payments</h1>
            <p className="text-black dark:text-slate-400 font-medium opacity-70 text-[10px] md:text-base">
              {user?.balance ? `Bal: Rs ${user.balance.toLocaleString()}` : 'Loading...'}
            </p>
          </div>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-bold text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm md:text-base">
          <History size={18} />
          History
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Categories */}
        {/* Categories */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-black mb-4 md:mb-6">Categories</h3>
          <div className="flex lg:flex-col gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all border-2 ${selectedCategory === cat.id ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xl' : 'bg-white border-transparent text-black/60 hover:bg-slate-50'}`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${selectedCategory === cat.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                  <cat.icon size={20} className={selectedCategory === cat.id ? 'text-white' : 'text-black/40 md:w-6 md:h-6'} />
                </div>
                <span className="text-sm md:text-lg font-bold whitespace-nowrap">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bills List */}
        <div className="lg:col-span-3 space-y-12">
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">Upcoming Bills</h3>
              <span className="px-4 py-1 bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest rounded-full">{bills.length} Pending Payments</span>
            </div>
            
            <div className="space-y-6">
              {bills.map(bill => (
                <motion.div 
                  key={bill.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-xl transition-all gap-6"
                >
                  <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-[20px] md:rounded-3xl flex items-center justify-center shrink-0">
                      {bill.category === 'Electricity' && <Zap size={28} className="text-yellow-500 md:w-8 md:h-8" />}
                      {bill.category === 'Gas' && <Flame size={28} className="text-orange-500 md:w-8 md:h-8" />}
                      {bill.category === 'Internet' && <Globe size={28} className="text-cyan-500 md:w-8 md:h-8" />}
                      {bill.category === 'Water' && <Droplet size={28} className="text-blue-500 md:w-8 md:h-8" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg md:text-xl font-black text-[#0F172A] mb-0.5 md:mb-1 truncate">{bill.name}</h4>
                      <p className="text-xs md:text-sm text-black font-medium opacity-40 mb-1.5 md:mb-2 truncate">{bill.ref}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-bold text-black uppercase tracking-widest opacity-40">Due Date</span>
                        <span className="text-[10px] md:text-xs font-black text-rose-500">{bill.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right flex items-center justify-between md:justify-end w-full md:w-auto gap-8 md:gap-12 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-black uppercase tracking-widest opacity-40 mb-0.5 md:mb-1">Amount</p>
                      <p className="text-xl md:text-2xl font-black text-[#0F172A]">Rs {bill.amount.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handlePayBill(bill)}
                      disabled={loading === bill.id || success === bill.id}
                      className={`px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[24px] font-black transition-all flex items-center justify-center gap-2 text-sm md:text-base ${success === bill.id ? 'bg-green-500 text-white' : 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg shadow-slate-200'}`}
                    >
                      {loading === bill.id ? 'Wait...' : success === bill.id ? <><CheckCircle2 size={18} /> Paid</> : 'Pay Now'}
                    </button>
                  </div>
                </motion.div>
              ))}
              {bills.length === 0 && (
                <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">No pending bills in this category</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-black">Recently Paid</h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white/50 p-6 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between grayscale opacity-60">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                       <CheckCircle2 size={24} />
                     </div>
                     <div>
                       <h4 className="font-bold text-[#0F172A]">Utility Payment - April 2026</h4>
                       <p className="text-xs text-black/40 font-medium">Payment Successful</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-[#0F172A]">Rs 4,500.00</p>
                     <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">05 Apr 2026</p>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentsPage;
