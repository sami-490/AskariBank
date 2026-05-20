import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Banknote,
  ShieldCheck,
  Building2,
  Globe,
  Wallet,
  Landmark,
  Coins,
  CheckCircle2,
  X,
  BarChart4,
  Heart,
} from 'lucide-react';
import axios from 'axios';

const ZAKAT_OPTIONS = [
  {
    category: 'Zakat Option Types',
    items: [
      {
        id: 'zk-calc',
        title: 'Zakat Calculator',
        desc: 'Nisab-based calculation for your wealth.',
        minAmount: 1,
        icon: BarChart4,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        buttonLabels: ['Calculate'],
      },
      {
        id: 'zk-rates',
        title: 'Nisab Live Rates',
        desc: 'Gold & Silver price tracking for Zakat eligibility.',
        minAmount: 1,
        icon: TrendingUp,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        buttonLabels: ['View Rates'],
      },
      {
        id: 'zk-pay',
        title: 'Pay Zakat',
        desc: 'Mandatory 2.5% payment of your qualifying assets.',
        minAmount: 1,
        icon: Banknote,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-sadaqah',
        title: 'Sadaqah',
        desc: 'Voluntary charity for those in need.',
        minAmount: 1,
        icon: Heart,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-fitrana',
        title: 'Fitrana (Zakat-al-Fitr)',
        desc: 'Ramadan-specific charity for the underprivileged.',
        minAmount: 1,
        icon: Coins,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-fidya',
        title: 'Fidya / Kaffarah',
        desc: 'Compensation for missed fasts or religious duties.',
        minAmount: 1,
        icon: Wallet,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-ngo',
        title: 'Welfare Organizations / NGOs',
        desc: 'Direct distribution through verified partners.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-govt',
        title: 'Government Zakat Fund',
        desc: 'Official state collection and distribution.',
        minAmount: 1,
        icon: Landmark,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-purification',
        title: 'Purification Tracking',
        desc: 'Removal of interest/Riba from your holdings.',
        minAmount: 1,
        icon: ShieldCheck,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-hawl',
        title: 'Hawl Tracker',
        desc: 'Lunar year cycle monitoring for your wealth.',
        minAmount: 1,
        icon: Globe,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Healthcare-Focused Welfare',
    items: [
      {
        id: 'zk-skmch',
        title: 'Shaukat Khanum Cancer Hospital',
        desc: 'Support cancer treatment for the underprivileged.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-ihhn',
        title: 'Indus Hospital & Health Network',
        desc: 'Free quality healthcare for millions.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-th',
        title: 'Transparent Hands',
        desc: 'Crowdfunding platform for surgical treatments.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-siut',
        title: 'SIUT',
        desc: 'Specialized healthcare for renal and transplant patients.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Educational Welfare',
    items: [
      {
        id: 'zk-tcf',
        title: 'The Citizens Foundation (TCF)',
        desc: 'Removing barriers to quality education.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-care',
        title: 'CARE Foundation',
        desc: 'Empowering children through education.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-rising',
        title: 'The Rising Sun',
        desc: 'Education and vocational training for special children.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Multi-Service & Emergency Relief',
    items: [
      {
        id: 'zk-edhi',
        title: 'Edhi Foundation',
        desc: 'Worlds largest volunteer ambulance network and social welfare.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-alkhidmat',
        title: 'Alkhidmat Foundation',
        desc: 'Humanitarian services across Pakistan.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'zk-saylani',
        title: 'Saylani Welfare Trust',
        desc: 'Feeding the hungry and providing social support.',
        minAmount: 1,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
];

const ZakatPage = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [calcStep, setCalcStep] = useState<'options' | 'calculator' | 'rates'>('options');
  const [investAmount, setInvestAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculator State
  const [assets, setAssets] = useState({
    cash: '',
    goldSilver: '',
    stocks: '',
    business: '',
  });
  const [liabilities, setLiabilities] = useState({
    debts: '',
    bills: '',
  });

  const nisabSilver = 157500; // Mock Nisab for 52.5 Tola Silver
  const nisabGold = 1875000; // Mock Nisab for 7.5 Tola Gold

  const openFundInvestment = (fund: any) => {
    setSelectedFund(fund);
    if (fund.id === 'zk-calc') {
      setCalcStep('calculator');
    } else if (fund.id === 'zk-rates') {
      setCalcStep('rates');
    } else {
      setCalcStep('options');
      setInvestAmount(fund.minAmount.toString());
    }
  };

  const calculateZakat = () => {
    const totalAssets =
      Number(assets.cash) +
      Number(assets.goldSilver) +
      Number(assets.stocks) +
      Number(assets.business);
    const totalLiabilities = Number(liabilities.debts) + Number(liabilities.bills);
    const netWealth = totalAssets - totalLiabilities;

    if (netWealth >= nisabSilver) {
      return Math.max(0, netWealth * 0.025);
    }
    return 0;
  };

  const handleInvest = async () => {
    const amount = Number(investAmount);
    if (isNaN(amount) || amount < selectedFund.minAmount) {
      alert(`Minimum amount is Rs ${selectedFund.minAmount.toLocaleString()}`);
      return;
    }
    if (user.balance < amount) {
      alert('Insufficient balance.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        recipientAccount: 'INVESTMENT-HOUSE',
        recipientName: `Zakat/Welfare: ${selectedFund.title}`,
        amount: amount,
        type: 'charity',
        targetType: 'zakat',
      };

      await axios.post('http://localhost:5000/api/user/transfer', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshUser();
      setSelectedFund(null);
      setSuccessMessage('Payment Successful!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-white pt-10 pb-20 px-4 md:px-10 flex flex-col items-center border-b border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-600 rounded-[32px] p-8 md:p-10 text-white w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Heart size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Zakat & Welfare</h1>
                <p className="text-rose-100 font-medium">
                  Digital platform for your religious obligations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs font-black text-rose-200 uppercase tracking-widest mb-2">
                  Available Balance
                </p>
                <h2 className="text-3xl font-black">Rs {(user.balance || 0).toLocaleString()}</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs font-black text-rose-200 uppercase tracking-widest mb-2">
                  Total Contributions
                </p>
                <h2 className="text-3xl font-black">
                  Rs{' '}
                  {(
                    user.transactions
                      ?.filter((tx: any) => tx.type === 'charity')
                      .reduce((a: any, b: any) => a + b.amount, 0) || 0
                  ).toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Welfare Options */}
      <div className="px-4 md:px-10 mt-12 max-w-6xl mx-auto space-y-12">
        {ZAKAT_OPTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-6">
            <h3 className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
              <span className="w-2 h-8 bg-rose-500 rounded-full"></span>
              {section.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((fund) => (
                <motion.div
                  key={fund.id}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl ${fund.bg} ${fund.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <fund.icon size={24} />
                    </div>
                    <h4 className="text-xl font-black text-[#0F172A] mb-2">{fund.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                      {fund.desc}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {fund.buttonLabels ? (
                      fund.buttonLabels.map((label: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => openFundInvestment(fund)}
                          className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                            idx === 0
                              ? 'bg-[#0F172A] text-white hover:bg-rose-600'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))
                    ) : (
                      <button
                        onClick={() => openFundInvestment(fund)}
                        className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg"
                      >
                        Contribute Now
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedFund && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFund(null)}
              className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-xl"
            />
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-[111] w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div
                className={`p-8 md:p-10 ${selectedFund.bg} ${selectedFund.color} flex flex-col items-center text-center relative`}
              >
                <button
                  onClick={() => setSelectedFund(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                >
                  <X size={20} className="text-current" />
                </button>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <selectedFund.icon size={28} className="text-current" />
                </div>
                <h2 className="text-xl font-black text-[#0F172A] leading-tight mb-1">
                  {selectedFund.title}
                </h2>
                <p className="text-xs font-medium text-slate-700/80">{selectedFund.desc}</p>
              </div>

              <div className="p-8 md:p-10 overflow-y-auto max-h-[70vh]">
                {calcStep === 'calculator' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Cash / Bank', key: 'cash' },
                        { label: 'Gold / Silver', key: 'goldSilver' },
                        { label: 'Stocks / Funds', key: 'stocks' },
                        { label: 'Business Goods', key: 'business' },
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {item.label}
                          </label>
                          <input
                            type="number"
                            value={(assets as any)[item.key]}
                            onChange={(e) => setAssets({ ...assets, [item.key]: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-rose-500 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-100 pb-2">
                        Deduct Liabilities
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Immediate Debts
                          </label>
                          <input
                            type="number"
                            value={liabilities.debts}
                            onChange={(e) =>
                              setLiabilities({ ...liabilities, debts: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-rose-500 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Upcoming Bills
                          </label>
                          <input
                            type="number"
                            value={liabilities.bills}
                            onChange={(e) =>
                              setLiabilities({ ...liabilities, bills: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:border-rose-500 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Calculated Zakat
                        </p>
                        <p className="text-3xl font-black text-rose-600">
                          Rs {calculateZakat().toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setInvestAmount(calculateZakat().toString());
                          setCalcStep('options');
                        }}
                        className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-xs uppercase tracking-widest"
                      >
                        Use Amount
                      </button>
                    </div>
                  </div>
                ) : calcStep === 'rates' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          label: 'Gold (7.5 Tola)',
                          value: nisabGold,
                          color: 'text-amber-500',
                          bg: 'bg-amber-50',
                        },
                        {
                          label: 'Silver (52.5 Tola)',
                          value: nisabSilver,
                          color: 'text-slate-400',
                          bg: 'bg-slate-50',
                        },
                      ].map((rate) => (
                        <div
                          key={rate.label}
                          className={`${rate.bg} p-6 rounded-2xl border border-slate-100 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full ${rate.bg} border-2 border-white flex items-center justify-center ${rate.color}`}
                            >
                              <TrendingUp size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {rate.label}
                              </p>
                              <p className={`text-xl font-black ${rate.color}`}>
                                Rs {rate.value.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                              Status
                            </p>
                            <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-emerald-600 border border-emerald-100">
                              Live
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-xs font-bold text-rose-700 leading-relaxed">
                        Note: If your net wealth exceeds either of these benchmarks, you are
                        eligible to pay Zakat (2.5% of total wealth).
                      </p>
                    </div>

                    <button
                      onClick={() => setCalcStep('calculator')}
                      className="w-full py-5 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all"
                    >
                      Calculate Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Contribution Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">
                          Rs
                        </span>
                        <input
                          type="number"
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                          className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-2xl text-[#0F172A] focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-500">Available Balance</span>
                      <span className="font-black text-[#0F172A]">
                        Rs {(user.balance || 0).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={handleInvest}
                      disabled={loading}
                      className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm Contribution'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {successMessage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              key="success-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <div className="relative z-[121] flex items-center justify-center w-full max-w-sm pointer-events-auto">
              <motion.div
                key="success-content"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm border border-slate-100 text-center"
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZakatPage;
