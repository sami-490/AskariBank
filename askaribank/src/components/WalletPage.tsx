import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
  Home,
  Utensils,
  Monitor,
  Palmtree,
  TrendingUp,
  X,
  ChevronDown,
  Bus,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';

const SavingGoal = ({ icon, title, current, target, percentage, color }: any) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 group hover:shadow-xl transition-all">
    <div className="flex justify-between items-center">
      <div
        className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <div className="text-right">
        <span className="text-base font-black text-[#0F172A]">{percentage}%</span>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achieved</p>
      </div>
    </div>
    <div className="space-y-2">
      <h4 className="text-xl font-black text-[#0F172A]">{title}</h4>
      <p className="text-xs text-slate-500 font-bold">
        Rs {current.toLocaleString()} <span className="opacity-30">/</span> Rs{' '}
        {target.toLocaleString()}
      </p>
    </div>
    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className="h-full rounded-full bg-[#0F172A] shadow-md shadow-slate-200"
      />
    </div>
  </div>
);

const BreakdownItem = ({ icon, label, amount, percentage, color }: any) => (
  <div className="flex items-center gap-6 group cursor-pointer w-full">
    <div
      className={`w-14 h-14 shrink-0 rounded-2xl ${color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0 space-y-3">
      <div className="flex justify-between items-baseline gap-4">
        <span className="text-base font-black text-[#0F172A]">{label}</span>
        <span className="text-sm font-black text-[#0F172A] whitespace-nowrap">
          Rs {amount.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          className="h-full rounded-full bg-[#0F172A] opacity-90 shadow-sm"
        />
      </div>
    </div>
  </div>
);

interface WalletPageProps {
  user: any;
  refreshUser: () => void;
}

const WalletPage = ({ user, refreshUser }: WalletPageProps) => {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('PKR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const rates: any = {
    PKR: 1,
    USD: 0.0036,
    EUR: 0.0031,
    GBP: 0.0027,
    AED: 0.013,
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error('Failed to fetch transactions');
      }
    };
    fetchTransactions();
  }, []);

  const spendingData = useMemo(() => {
    const categories = {
      shopping: 0,
      housing: 0,
      dining: 0,
      transport: 0,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'send' || tx.type === 'withdraw') {
        const desc = (tx.recipient || '').toLowerCase();
        if (
          desc.includes('shop') ||
          desc.includes('store') ||
          desc.includes('mall') ||
          desc.includes('amazon') ||
          desc.includes('purchase')
        ) {
          categories.shopping += tx.amount;
        } else if (
          desc.includes('rent') ||
          desc.includes('bill') ||
          desc.includes('electricity') ||
          desc.includes('gas') ||
          desc.includes('water') ||
          desc.includes('housing')
        ) {
          categories.housing += tx.amount;
        } else if (
          desc.includes('food') ||
          desc.includes('rest') ||
          desc.includes('cafe') ||
          desc.includes('kfc') ||
          desc.includes('foodpanda') ||
          desc.includes('dining') ||
          desc.includes('grocery')
        ) {
          categories.dining += tx.amount;
        } else if (
          desc.includes('uber') ||
          desc.includes('careem') ||
          desc.includes('petrol') ||
          desc.includes('fuel') ||
          desc.includes('transport') ||
          desc.includes('bus') ||
          desc.includes('train')
        ) {
          categories.transport += tx.amount;
        }
      }
    });

    const total = categories.shopping + categories.housing + categories.dining + categories.transport || 1;
    return {
      ...categories,
      total: categories.shopping + categories.housing + categories.dining + categories.transport,
      percentages: {
        shopping: Math.round((categories.shopping / total) * 100),
        housing: Math.round((categories.housing / total) * 100),
        dining: Math.round((categories.dining / total) * 100),
        transport: Math.round((categories.transport / total) * 100),
      },
    };
  }, [transactions]);

  const [loading, setLoading] = useState(false);

  const handleTransaction = async (
    type: string,
    description: string,
    subType: string = 'withdraw'
  ) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return alert('Please enter a valid amount');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        type === 'add'
          ? 'http://localhost:5000/api/user/recharge'
          : 'http://localhost:5000/api/user/transfer';
      const payload =
        type === 'add'
          ? { amount: val }
          : {
              recipientAccount: 'WALLET-OUT',
              recipientName: description,
              amount: val,
              type: subType,
            };

      await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      await refreshUser();
      setIsAddFundsOpen(false);
      setIsWithdrawOpen(false);
      setIsExchangeOpen(false);
      setAmount('');
      const msg = type === 'add' ? 'Funds added successfully!' : subType === 'exchange' ? 'Exchange completed successfully!' : 'Withdrawal successful!';
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:p-12 space-y-8 md:space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1B4F91] tracking-tight mb-1">My Wallet</h1>
          <p className="text-slate-400 font-medium text-sm md:text-base">Your financial overview</p>
        </div>
        <button
          onClick={() => setIsAddFundsOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#3B82F6] text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl md:rounded-3xl font-bold shadow-lg hover:bg-blue-600 transition-all text-sm md:text-base"
        >
          <Plus size={20} /> Add Funds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Content Area */}
        <div className="lg:col-span-8 space-y-16">
          {/* Main Blue Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative min-h-[320px] md:h-[420px] bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] rounded-[32px] md:rounded-[60px] p-8 md:p-16 text-white shadow-2xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-2 md:space-y-4">
                  <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Total Balance</p>
                  <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter">
                    Rs {user.balance.toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 text-emerald-300 font-bold text-xs md:text-sm">
                    <TrendingUp size={16} className="md:w-5 md:h-5" /> +2.4% <span className="text-white/40 ml-1 md:ml-2 font-medium">vs last month</span>
                  </div>
                </div>
                <button className="p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-xl">
                  <MoreHorizontal size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8 md:mt-12">
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 bg-white text-[#2563EB] py-4 md:py-6 rounded-2xl md:rounded-3xl font-black flex items-center justify-center gap-2 md:gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all text-base md:text-lg"
                >
                  <ArrowUpRight size={20} className="md:w-6 md:h-6" /> Withdraw
                </button>
                <button
                  onClick={() => setIsExchangeOpen(true)}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-4 md:py-6 rounded-2xl md:rounded-3xl font-black flex items-center justify-center gap-2 md:gap-3 hover:bg-white/20 transition-all backdrop-blur-xl text-base md:text-lg"
                >
                  <RefreshCw size={20} className="rotate-45 md:w-6 md:h-6" /> Exchange
                </button>
              </div>
            </div>
          </motion.div>

          {/* Saving Goals */}
          <section className="space-y-10">
            <h3 className="text-2xl font-black text-[#0F172A]">Saving Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <SavingGoal
                icon={<Monitor size={28} className="text-blue-600" />}
                title="MacBook Pro"
                current={150000}
                target={450000}
                percentage={33}
                color="bg-blue-50"
              />
              <SavingGoal
                icon={<Palmtree size={28} className="text-emerald-600" />}
                title="Summer Trip"
                current={80000}
                target={400000}
                percentage={20}
                color="bg-emerald-50"
              />
            </div>
          </section>
        </div>

        {/* Right Sidebar: Monthly Breakdown */}
        <div className="lg:col-span-4 bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-100 space-y-8 md:space-y-12 h-fit">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-[#0F172A]">Monthly Breakdown</h3>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Spent</p>
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-[#0F172A]">
                Rs {spendingData.total.toLocaleString()}
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="p-3 text-blue-500 bg-blue-50 rounded-full hover:rotate-180 transition-all duration-700"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-10">
            <BreakdownItem
              icon={<ShoppingBag size={20} />}
              label="Shopping"
              amount={spendingData.shopping}
              percentage={spendingData.percentages.shopping}
              color="bg-purple-50 text-purple-600"
            />
            <BreakdownItem
              icon={<Home size={20} />}
              label="Housing"
              amount={spendingData.housing}
              percentage={spendingData.percentages.housing}
              color="bg-blue-50 text-blue-600"
            />
            <BreakdownItem
              icon={<Utensils size={20} />}
              label="Food & Groceries"
              amount={spendingData.dining}
              percentage={spendingData.percentages.dining}
              color="bg-orange-50 text-orange-600"
            />
            <BreakdownItem
              icon={<Bus size={20} />}
              label="Transport"
              amount={spendingData.transport}
              percentage={spendingData.percentages.transport}
              color="bg-emerald-50 text-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isWithdrawOpen || isAddFundsOpen || isExchangeOpen) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsWithdrawOpen(false);
                setIsAddFundsOpen(false);
                setIsExchangeOpen(false);
              }}
              className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xl z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-lg bg-white rounded-[32px] md:rounded-[50px] p-8 md:p-12 shadow-2xl overflow-hidden relative"
              >
                {isExchangeOpen ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-black text-[#0F172A]">Currency Exchange</h2>
                      <button
                        onClick={() => setIsExchangeOpen(false)}
                        className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">From</p>
                        <div className="relative">
                          <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="w-full p-6 pr-12 rounded-[24px] bg-white border-2 border-slate-100 text-xl font-black text-[#0F172A] outline-none appearance-none cursor-pointer hover:border-slate-200 transition-all"
                          >
                            {Object.keys(rates).map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                      </div>
                      <div className="pt-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                          <RefreshCw size={20} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">To</p>
                        <div className="relative">
                          <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="w-full p-6 pr-12 rounded-[24px] bg-white border-2 border-slate-100 text-xl font-black text-[#0F172A] outline-none appearance-none cursor-pointer hover:border-slate-200 transition-all"
                          >
                            {Object.keys(rates).map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full px-8 py-8 rounded-[32px] bg-white border-2 border-slate-100 text-3xl font-black text-[#0F172A] outline-none placeholder:text-slate-200 focus:border-slate-200"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">{fromCurrency}</span>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <p className="text-sm font-bold text-slate-400">Conversion Rate</p>
                      <p className="text-sm font-black text-blue-600">
                        1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTransaction('withdraw', `Exchange ${fromCurrency} to ${toCurrency}`, 'exchange')}
                      disabled={loading}
                      className="w-full py-8 rounded-[32px] bg-[#0F172A] text-white font-black text-xl uppercase tracking-widest shadow-2xl transition-all hover:bg-black active:scale-[0.98]"
                    >
                      {loading ? 'Processing...' : 'Complete Exchange'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-black text-[#0F172A]">
                        {isAddFundsOpen ? 'Add Funds' : 'Withdraw'}
                      </h2>
                      <button
                        onClick={() => {
                          setIsWithdrawOpen(false);
                          setIsAddFundsOpen(false);
                        }}
                        className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-[#0F172A] opacity-20">Rs</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-20 pr-10 py-8 rounded-[32px] bg-slate-50 border-none text-4xl font-black text-[#0F172A] outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleTransaction(isAddFundsOpen ? 'add' : 'withdraw', 'Wallet Action')}
                      disabled={loading}
                      className="w-full py-8 rounded-[32px] bg-[#0F172A] text-white font-black text-xl uppercase tracking-widest shadow-2xl transition-all"
                    >
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}

        {successMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <div className="fixed inset-0 z-[111] flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm pointer-events-auto border border-slate-100 text-center"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#0F172A]">Success!</h3>
                  <p className="text-xs font-bold text-slate-500">{successMessage}</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
