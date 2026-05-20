import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Banknote,
  PieChart,
  ShieldCheck,
  Building2,
  Globe,
  Wallet,
  Landmark,
  Coins,
  CheckCircle2,
  X,
  ChevronRight,
  BarChart4,
} from 'lucide-react';
import axios from 'axios';

const MUTUAL_FUNDS = [
  {
    category: 'Core Mutual Fund Types',
    items: [
      {
        id: 'mf-equity',
        title: 'Equity Funds (Growth Funds)',
        desc: 'Invest primarily in stocks and shares of companies. Focus on long-term capital appreciation but carry higher market risk.',
        minAmount: 5000,
        icon: TrendingUp,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-debt',
        title: 'Debt Funds (Income Funds)',
        desc: 'Invest in fixed-income securities like government bonds, corporate debentures, and treasury bills. Focus on providing steady, regular returns with lower risk.',
        minAmount: 2000,
        icon: Landmark,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-hybrid',
        title: 'Hybrid Funds (Balanced Funds)',
        desc: 'Invest in a mix of both equity (stocks) and debt (bonds) instruments to balance risk and reward.',
        minAmount: 3000,
        icon: PieChart,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-money',
        title: 'Money Market Funds (Liquid Funds)',
        desc: 'Invest in short-term, high-liquidity debt instruments. Used for preserving capital and earning short-term interest with minimal risk.',
        minAmount: 1000,
        icon: Wallet,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-index',
        title: 'Index Funds',
        desc: 'Passively managed funds that mimic a specific market index (like the S&P 500 or KSE-100) to replicate its performance.',
        minAmount: 2000,
        icon: BarChart4,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Specialized Investment Categories',
    items: [
      {
        id: 'mf-elss',
        title: 'ELSS (Equity Linked Savings Schemes)',
        desc: 'Tax-saving equity mutual funds that come with a mandatory statutory lock-in period.',
        minAmount: 5000,
        icon: Banknote,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-sector',
        title: 'Sector / Thematic Funds',
        desc: 'Restrict investments to a specific sector (e.g., Technology, Healthcare, Banking) or a broader theme (e.g., Infrastructure, ESG/Sustainability).',
        minAmount: 5000,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-gilt',
        title: 'Gilt Funds',
        desc: 'A specific type of debt fund that invests exclusively in government securities, virtually eliminating credit risk.',
        minAmount: 10000,
        icon: ShieldCheck,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-fof',
        title: 'Fund of Funds (FoF)',
        desc: 'A mutual fund that invests in other mutual funds rather than investing directly in stocks or bonds.',
        minAmount: 2500,
        icon: Coins,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'mf-intl',
        title: 'International / Global Funds',
        desc: 'Invest in companies located outside your domestic market to provide geographical diversification.',
        minAmount: 15000,
        icon: Globe,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
];

const ASSETS = [
  {
    id: 'mutual-funds',
    title: 'Mutual Funds',
    desc: 'Diversified portfolios managed by professionals.',
    returns: '15-18% p.a',
    icon: Landmark,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 'stocks',
    title: 'Stocks',
    desc: 'Directly invest in top companies across the market.',
    returns: '20-25% p.a',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    id: 'gold',
    title: 'Digital Gold',
    desc: 'Secure, physical gold backed by digital convenience.',
    returns: '8-12% p.a',
    icon: Coins,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
];

const TOP_FUNDS = [
  {
    title: 'Growth Equity Fund',
    type: 'High Risk • Equity',
    returns: '+24.5%',
    icon: TrendingUp,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Stable Income Fund',
    type: 'Low Risk • Money Market',
    returns: '+14.2%',
    icon: Wallet,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Shariah Compliant ETF',
    type: 'Medium Risk • Balanced',
    returns: '+18.9%',
    icon: PieChart,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Tech Innovators Fund',
    type: 'High Risk • Sector',
    returns: '+28.4%',
    icon: Building2,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Global Infrastructure Fund',
    type: 'Medium Risk • Thematic',
    returns: '+16.7%',
    icon: Globe,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Sovereign Bond Fund',
    type: 'Low Risk • Gilt',
    returns: '+9.5%',
    icon: ShieldCheck,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Bluechip Value Fund',
    type: 'Medium Risk • Equity',
    returns: '+21.2%',
    icon: Landmark,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    title: 'Liquid Reserve Fund',
    type: 'Low Risk • Money Market',
    returns: '+11.8%',
    icon: Banknote,
    color: 'text-slate-700',
    bg: '#989898',
  },
];

const STOCKS_FUNDS = [
  {
    category: 'By Company Size (Market Capitalization)',
    items: [
      {
        id: 'st-large',
        title: 'Large-Cap Funds',
        desc: 'Invest in large, well-established companies with stable returns.',
        minAmount: 5000,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-mid',
        title: 'Mid-Cap Funds',
        desc: 'Invest in medium-sized companies with high growth potential.',
        minAmount: 5000,
        icon: TrendingUp,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-small',
        title: 'Small-Cap Funds',
        desc: 'Invest in smaller companies for aggressive growth, higher risk.',
        minAmount: 5000,
        icon: Coins,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-multi',
        title: 'Multi-Cap / Flexi-Cap Funds',
        desc: 'Invest across companies of all sizes dynamically based on market conditions.',
        minAmount: 5000,
        icon: PieChart,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'By Investment Strategy',
    items: [
      {
        id: 'st-growth',
        title: 'Growth Funds',
        desc: 'Focus on companies expected to grow at an above-average rate.',
        minAmount: 5000,
        icon: TrendingUp,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-value',
        title: 'Value Funds',
        desc: 'Invest in undervalued companies with solid fundamentals.',
        minAmount: 5000,
        icon: Landmark,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-dividend',
        title: 'Dividend Yield Funds',
        desc: 'Target companies that pay consistent and high dividends.',
        minAmount: 5000,
        icon: Banknote,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-contra',
        title: 'Contra Funds',
        desc: 'Take a contrarian view, investing in underperforming sectors expecting a turnaround.',
        minAmount: 5000,
        icon: ShieldCheck,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'By Industry Focus',
    items: [
      {
        id: 'st-sector',
        title: 'Sector Funds',
        desc: 'Invest exclusively in specific sectors like IT, Pharma, or Banking.',
        minAmount: 5000,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-thematic',
        title: 'Thematic Funds',
        desc: 'Invest based on broad themes like Infrastructure, ESG, or Consumption.',
        minAmount: 5000,
        icon: Globe,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'By Management Style',
    items: [
      {
        id: 'st-index',
        title: 'Index Funds (Passive Equity)',
        desc: 'Mirror a stock market index to match its performance.',
        minAmount: 5000,
        icon: BarChart4,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'st-active',
        title: 'Actively Managed Equity Funds',
        desc: 'Fund managers actively pick stocks to outperform the market index.',
        minAmount: 5000,
        icon: Wallet,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
];

const GOLD_FUNDS = [
  {
    category: 'Advanced Gold Investment Models',
    items: [
      {
        id: 'gold-lease',
        title: 'Gold Leasing',
        desc: 'Lease your digital or physical gold to vetted jewelers for up to 5% p.a. extra return.',
        minAmount: 10000,
        icon: TrendingUp,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'gold-sip',
        title: 'Gold SIP',
        desc: 'Automated micro-savings starting as low as Rs 100/day regularly invested in 24K gold.',
        minAmount: 100,
        icon: Landmark,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'gold-roundup',
        title: 'Spare Change Round-ups',
        desc: 'Automatically rounds up daily transactions and invests the difference into digital gold.',
        minAmount: 50,
        icon: Coins,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Physical & Lifestyle Integration',
    items: [
      {
        id: 'gold-jewelry',
        title: 'Jewelry Conversion',
        desc: 'Redeem digital gold balance at partner retail outlets to purchase physical jewelry.',
        minAmount: 5000,
        icon: Building2,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'gold-gifting',
        title: 'Gold Gifting',
        desc: 'Instant peer-to-peer transfer of 24K digital gold to friends or family.',
        minAmount: 500,
        icon: Wallet,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'gold-temple',
        title: 'Temple Offerings (Daan)',
        desc: 'Donate digital gold directly to religious institutions.',
        minAmount: 250,
        icon: ShieldCheck,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Alternative Precious Metals',
    items: [
      {
        id: 'gold-silver',
        title: 'Digital Silver',
        desc: '24K (99.9% pure) silver starting from very low minimums.',
        minAmount: 500,
        icon: Coins,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
      {
        id: 'gold-silver-etf',
        title: 'Silver ETFs',
        desc: 'Exchange-traded funds that track the domestic price of silver.',
        minAmount: 2500,
        icon: BarChart4,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
  {
    category: 'Reward-Based Investing',
    items: [
      {
        id: 'gold-rewards',
        title: 'Jewel/Reward Redemption',
        desc: 'Convert daily spends rewards (Jewels) into 99.99% pure digital gold.',
        minAmount: 100,
        icon: Banknote,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
      },
    ],
  },
];

const InvestPage = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const [isMutualFundsModalOpen, setIsMutualFundsModalOpen] = useState(false);
  const [isStocksModalOpen, setIsStocksModalOpen] = useState(false);
  const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
  const [showAllTopFunds, setShowAllTopFunds] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const calculatePortfolioValue = () => {
    if (!user || !user.transactions) return 0;
    const investmentTxs = user.transactions.filter(
      (tx: any) =>
        tx.recipient?.includes('INVESTMENT-HOUSE') ||
        tx.recipient?.includes('Invest:') ||
        ['mutual-fund', 'stock', 'gold'].includes(tx.targetType),
    );
    return investmentTxs.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const dummyProfit = portfolioValue * 0.124;

  const handleAssetClick = (id: string) => {
    if (id === 'mutual-funds') {
      setIsMutualFundsModalOpen(true);
    } else if (id === 'stocks') {
      setIsStocksModalOpen(true);
    } else if (id === 'gold') {
      setIsGoldModalOpen(true);
    } else {
      alert('This asset class is coming soon!');
    }
  };

  const openFundInvestment = (fund: any) => {
    setSelectedFund(fund);
    setInvestAmount(fund.minAmount.toString());
  };

  const handleInvest = async () => {
    const amount = Number(investAmount);
    if (isNaN(amount) || amount < selectedFund.minAmount) {
      alert(`Minimum investment amount is Rs ${selectedFund.minAmount.toLocaleString()}`);
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
        recipientName: `Invest: ${selectedFund.title}`,
        amount: amount,
        type: 'investment',
        targetType: 'mutual-fund',
      };

      await axios.post('http://localhost:5000/api/user/transfer', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshUser();
      setSelectedFund(null);
      setIsMutualFundsModalOpen(false);
      setIsStocksModalOpen(false);
      setIsGoldModalOpen(false);
      setSuccessMessage('Transaction Successful!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Investment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Portfolio Section */}
      <div className="bg-white pt-6 md:pt-10 pb-16 md:pb-20 px-4 md:px-10 flex flex-col items-center border-b border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] md:min-h-[240px]"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">
              Total Portfolio Value
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Rs{' '}
              {portfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          <div className="mt-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-5 py-3 rounded-2xl font-black text-sm w-full sm:w-auto">
              <TrendingUp size={16} />
              <span>
                +12.4% (Rs{' '}
                {dummyProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
                )
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Explore Assets */}
      <div className="px-4 md:px-10 mt-8 md:mt-12 mb-12 md:mb-16 max-w-6xl mx-auto space-y-6">
        <h3 className="text-xl font-black text-[#0F172A]">Explore Assets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {ASSETS.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleAssetClick(asset.id)}
              className="bg-[#989898] rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-black/5 shadow-sm hover:shadow-xl hover:border-black/10 transition-all cursor-pointer group flex flex-col justify-between min-h-[200px] md:min-h-[220px]"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl ${asset.bg} ${asset.color} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}
                >
                  <asset.icon size={24} />
                </div>
                <h4 className="text-xl font-black text-black mb-2">{asset.title}</h4>
                <p className="text-sm text-black/70 font-medium leading-relaxed">{asset.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-black/10">
                <span className="text-sm font-bold text-black">{asset.returns}</span>
                <ChevronRight
                  size={20}
                  className="text-black/60 group-hover:text-black transition-colors"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Performing Funds */}
      <div className="px-4 md:px-10 mb-16 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-[#0F172A]">Top Performing Funds</h3>
          <button
            onClick={() => setShowAllTopFunds(!showAllTopFunds)}
            className="text-blue-600 font-bold hover:underline text-sm"
          >
            {showAllTopFunds ? 'Show Less' : 'See All'}
          </button>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-500">
          {(showAllTopFunds ? TOP_FUNDS : TOP_FUNDS.slice(0, 3)).map((fund, idx) => (
            <div
              key={idx}
              className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${idx !== (showAllTopFunds ? TOP_FUNDS.length - 1 : 2) ? 'border-b border-slate-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${fund.bg} ${fund.color} flex items-center justify-center`}
                >
                  <fund.icon size={20} />
                </div>
                <div className="min-w-0">
                  <h5 className="font-black text-[#0F172A] truncate">{fund.title}</h5>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    {fund.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-emerald-500">{fund.returns}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  3Y Return
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-4 md:px-10 mb-10 md:mb-16 max-w-6xl mx-auto">
        <div className="bg-[#0A0F1C] rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl md:text-4xl font-black text-white">
              Ready to build your future?
            </h3>
            <p className="text-slate-400 font-medium text-lg">
              Start with as little as Rs 1,000 only.
            </p>
            <button
              onClick={() => setIsMutualFundsModalOpen(true)}
              className="mt-4 px-10 py-5 bg-white text-[#0F172A] rounded-[24px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* Mutual Funds List Drawer/Modal */}
      <AnimatePresence>
        {isMutualFundsModalOpen && !selectedFund && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMutualFundsModalOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col h-full pointer-events-auto"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Mutual Funds</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    Diversified portfolios managed by professionals.
                  </p>
                </div>
                <button
                  onClick={() => setIsMutualFundsModalOpen(false)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {MUTUAL_FUNDS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <h3 className="text-xl font-black text-[#0F172A] border-l-4 border-blue-500 pl-4">
                      {section.category}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {section.items.map((fund) => (
                        <div
                          key={fund.id}
                          className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col md:flex-row gap-6"
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl ${fund.bg} ${fund.color} flex items-center justify-center shrink-0`}
                          >
                            <fund.icon size={28} />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg font-black text-[#0F172A] mb-2">
                                {fund.title}
                              </h4>
                              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                {fund.desc}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                  Min. Investment
                                </span>
                                <span className="font-black text-[#0F172A]">
                                  Rs {fund.minAmount.toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => openFundInvestment(fund)}
                                className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                              >
                                Invest
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stocks List Drawer/Modal */}
      <AnimatePresence>
        {isStocksModalOpen && !selectedFund && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              key="stocks-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStocksModalOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              key="stocks-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col h-full pointer-events-auto"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Stocks & Equity</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    Directly invest in top companies across the market.
                  </p>
                </div>
                <button
                  onClick={() => setIsStocksModalOpen(false)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {STOCKS_FUNDS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <h3 className="text-xl font-black text-[#0F172A] border-l-4 border-emerald-500 pl-4">
                      {section.category}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {section.items.map((fund) => (
                        <div
                          key={fund.id}
                          className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col md:flex-row gap-6"
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl ${fund.bg} ${fund.color} flex items-center justify-center shrink-0`}
                          >
                            <fund.icon size={28} />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg font-black text-[#0F172A] mb-2">
                                {fund.title}
                              </h4>
                              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                {fund.desc}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                  Min. Investment
                                </span>
                                <span className="font-black text-[#0F172A]">
                                  Rs {fund.minAmount.toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => openFundInvestment(fund)}
                                className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                              >
                                Invest
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Gold List Drawer/Modal */}
      <AnimatePresence>
        {isGoldModalOpen && !selectedFund && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              key="gold-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoldModalOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              key="gold-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col h-full pointer-events-auto"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">
                    Digital Gold & Precious Metals
                  </h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    Secure, physical gold backed by digital convenience.
                  </p>
                </div>
                <button
                  onClick={() => setIsGoldModalOpen(false)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {GOLD_FUNDS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <h3 className="text-xl font-black text-[#0F172A] border-l-4 border-amber-500 pl-4">
                      {section.category}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {section.items.map((fund) => (
                        <div
                          key={fund.id}
                          className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col md:flex-row gap-6"
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl ${fund.bg} ${fund.color} flex items-center justify-center shrink-0`}
                          >
                            <fund.icon size={28} />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg font-black text-[#0F172A] mb-2">
                                {fund.title}
                              </h4>
                              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                {fund.desc}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                  Min. Investment
                                </span>
                                <span className="font-black text-[#0F172A]">
                                  Rs {fund.minAmount.toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => openFundInvestment(fund)}
                                className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                              >
                                Invest
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Investment Input Modal */}
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
            <div className="relative z-[111] flex items-center justify-center w-full max-w-lg pointer-events-auto">
              <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
              >
                <div
                  className={`p-10 ${selectedFund.bg} ${selectedFund.color} flex flex-col items-center text-center relative`}
                >
                  <button
                    onClick={() => setSelectedFund(null)}
                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                  >
                    <X size={20} className="text-current" />
                  </button>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <selectedFund.icon size={36} className="text-current" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0F172A] leading-tight mb-2">
                    {selectedFund.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-700/80">{selectedFund.desc}</p>
                </div>

                <div className="p-10 flex flex-col space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Investment Amount
                      </label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Min: Rs {selectedFund.minAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">
                        Rs
                      </span>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-2xl text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:bg-white transition-all shadow-sm"
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
                    className="w-full py-5 bg-[#0F172A] text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm Investment'}
                  </button>
                </div>
              </motion.div>
            </div>
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

export default InvestPage;
