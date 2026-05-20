import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Calculator,
  Compass,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Upload,
  Check,
  Lock,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CarLoanPageProps {
  user: any;
  refreshUser: () => void;
}

const partnerCars = [
  {
    id: 1,
    name: 'Toyota Fortuner Legender',
    type: 'SUV (New)',
    rate: '8.49%',
    price: 'Rs 15,800,000',
    discount: 'Rs 250,000 Cash Back',
    dealer: 'Toyota Central Motors',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Honda Civic Oriel',
    type: 'Sedan (New)',
    rate: '8.75%',
    price: 'Rs 8,300,000',
    discount: 'Free 1-Year Insurance',
    dealer: 'Honda Avenue Dealership',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 3,
    name: 'Hyundai Tucson AWD',
    type: 'Crossover (Used / 2023)',
    rate: '8.99%',
    price: 'Rs 7,900,000',
    discount: '50% Off Registration Fee',
    dealer: 'Hyundai Premium Motors',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
  },
];

const CarLoanPage = ({ user: _user, refreshUser }: CarLoanPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'planning' | 'actions'>('planning');
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(3000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenureYears, setTenureYears] = useState(5);
  const [interestRate, setInterestRate] = useState(8.9);
  const [calculatedEmi, setCalculatedEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  // Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('salaried');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    maxLimit: number;
    emiLimit: number;
    scoreGrade: string;
  } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Application State
  const [appStep, setAppStep] = useState<1 | 2 | 3>(1);
  const [carType, setCarType] = useState('new');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState('2026');
  const [salarySlip, setSalarySlip] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);

  // Active Loan Mock State (can be toggled in demo)
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [autoDebit, setAutoDebit] = useState(true);
  const [showAutoDebitToast, setShowAutoDebitToast] = useState(false);
  const [foreclosureOpen, setForeclosureOpen] = useState(false);
  const [foreclosing, setForeclosing] = useState(false);
  const [foreclosureSuccess, setForeclosureSuccess] = useState(false);

  // Dynamic EMI Calculation
  useEffect(() => {
    const principal = loanAmount * (1 - downPaymentPercent / 100);
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;
    
    if (principal > 0 && r > 0 && n > 0) {
      const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayable = emi * n;
      const totalInt = totalPayable - principal;
      
      setCalculatedEmi(Math.round(emi));
      setTotalInterest(Math.round(totalInt));
      setTotalRepayment(Math.round(totalPayable));
    }
  }, [loanAmount, downPaymentPercent, tenureYears, interestRate]);

  // Eligibility Pull Simulation
  const handleCheckEligibility = () => {
    if (!monthlyIncome || isNaN(Number(monthlyIncome))) {
      alert('Please enter a valid monthly income');
      return;
    }
    setCheckingEligibility(true);
    setTimeout(() => {
      const income = Number(monthlyIncome);
      const expenses = Number(monthlyExpenses || 0);
      const netSavings = Math.max(0, income - expenses);
      
      // Eligibility formula
      const maxMonthlyEmi = netSavings * 0.45; // Max 45% of net savings goes to EMI
      const r = (8.9 / 12) / 100;
      const n = 60; // 5 years default
      const maxLoan = (maxMonthlyEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      
      if (maxLoan > 500000) {
        setEligibilityResult({
          eligible: true,
          maxLimit: Math.round(maxLoan / 50000) * 50000, // round to nearest 50k
          emiLimit: Math.round(maxMonthlyEmi),
          scoreGrade: income > 150000 ? 'Excellent (780+)' : 'Good (720+)',
        });
      } else {
        setEligibilityResult({
          eligible: false,
          maxLimit: 0,
          emiLimit: 0,
          scoreGrade: 'Needs Improvement (<600)',
        });
      }
      setCheckingEligibility(false);
    }, 1500);
  };

  // Submit Application Simulation
  const handleApply = () => {
    if (!makeModel) {
      alert('Please specify the Vehicle Make and Model');
      return;
    }
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setAppSubmitted(true);
      setAppStep(3);
    }, 2000);
  };

  // Pre-fill loan calculator with catalog item
  const configureCatalogFinance = (priceStr: string, rateStr: string) => {
    const rawPrice = Number(priceStr.replace(/\D/g, ''));
    const rawRate = parseFloat(rateStr.replace('%', ''));
    setLoanAmount(rawPrice);
    setInterestRate(rawRate);
    setActiveTab('planning');
    // Smooth scroll back to top of planning tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Foreclosure process simulation
  const handleForeclosure = () => {
    setForeclosing(true);
    setTimeout(() => {
      setForeclosing(false);
      setForeclosureSuccess(true);
      setTimeout(() => {
        setForeclosureOpen(false);
        setHasActiveLoan(false);
        setForeclosureSuccess(false);
        refreshUser();
      }, 2500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] px-4 py-8 md:p-10 space-y-8 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> Auto FinTech
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Askari Auto Loans
            </h1>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-200/20 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('planning')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'planning'
                ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calculator size={16} /> Discovery & Planning
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'actions'
                ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass size={16} /> Loans & Management
          </button>
        </div>
      </div>

      {/* Hero Descriptive Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0D9488] p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#0D9488] flex items-center gap-2">
            <Car size={24} /> Drive Your Dream Car Today
          </h2>
          <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed">
            Drive your dream car today. Access quick approvals, competitive interest rates, and flexible repayment plans tailored to fit your monthly budget.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              ⚡ Instant Eligibility Pull
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              📅 Flexible 1-7 Year Tenure
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              🏷️ Dealership Partner Specials
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'planning' ? (
          <motion.div
            key="planning"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* EMI Estimator Widget */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="text-[#0D9488]" size={22} /> EMI Estimator
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Plan your vehicle finance dynamically
                  </p>
                </div>
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-600 rounded-lg text-xs font-black uppercase">
                  9.5% Rate Cap
                </span>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Vehicle Cost (Loan Amount)</span>
                    <span className="text-[#0D9488] font-black text-base">Rs {loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="15000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Rs 500K</span>
                    <span>Rs 15M</span>
                  </div>
                </div>

                {/* Down Payment Percent */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Down Payment ({downPaymentPercent}%)</span>
                    <span className="text-[#0D9488] font-black text-base">
                      Rs {Math.round(loanAmount * (downPaymentPercent / 100)).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>10% (Min)</span>
                    <span>80% (Max)</span>
                  </div>
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Repayment Tenure</span>
                    <span className="text-[#0D9488] font-black text-base">{tenureYears} Years ({tenureYears * 12} Months)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>1 Year</span>
                    <span>7 Years</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Interest Rate (Per Annum)</span>
                    <span className="text-[#0D9488] font-black text-base">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>5.0%</span>
                    <span>20.0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EMI Summary Calculation Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-[32px] p-6 md:p-8 text-white shadow-xl flex flex-col justify-between border border-white/5 space-y-6">
              <div className="space-y-4">
                <span className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
                  Monthly Estimate
                </span>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated EMI</span>
                  <h4 className="text-4xl md:text-5xl font-black text-[#0D9488] tracking-tight">
                    <span className="text-lg opacity-40 mr-1">Rs</span>
                    {calculatedEmi.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-4 border-t border-b border-white/10 py-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Principal Amount:</span>
                  <span>Rs {Math.round(loanAmount * (1 - downPaymentPercent / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Interest Payable:</span>
                  <span className="text-teal-400">Rs {totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Total Repayment:</span>
                  <span>Rs {totalRepayment.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('actions');
                    setAppStep(1);
                    setMakeModel('Configured Vehicle');
                  }}
                  className="w-full py-4 bg-[#0D9488] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-lg text-sm"
                >
                  Apply For Loan <ChevronRight size={16} />
                </button>
                <p className="text-[10px] text-slate-400 text-center font-bold">
                  *Calculations are indicative. Rates subject to final credit scoring.
                </p>
              </div>
            </div>

            {/* Soft-Credit Eligibility Checker */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="text-[#0D9488]" size={22} /> Eligibility Checker
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Instant soft credit check — No credit score impact
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Monthly Net Income (Rs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Employment Status</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                    >
                      <option value="salaried">Salaried Employee</option>
                      <option value="self_employed">Self Employed Professional</option>
                      <option value="business">Business Owner</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Other Monthly Expenses (Rs)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                    >
                    </input>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckEligibility}
                  disabled={checkingEligibility || !monthlyIncome}
                  className="w-full py-4 bg-[#0F172A] dark:bg-slate-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#1E293B] dark:hover:bg-slate-700 transition-all shadow-md"
                >
                  {checkingEligibility ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing soft-pull credit profile...
                    </span>
                  ) : (
                    'Check Eligibility Limit'
                  )}
                </button>
              </div>

              {/* Eligibility Result Animation */}
              <AnimatePresence>
                {eligibilityResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-6 rounded-2xl border-2 flex items-start gap-4 ${
                      eligibilityResult.eligible
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/20 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-full shrink-0 ${
                      eligibilityResult.eligible ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600'
                    }`}>
                      {eligibilityResult.eligible ? <CheckCircle size={20} /> : <HelpCircle size={20} />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-base">
                        {eligibilityResult.eligible ? 'Congratulations! You are Pre-Approved' : 'Action Required'}
                      </h4>
                      <p className="text-xs opacity-80 leading-relaxed font-semibold">
                        {eligibilityResult.eligible
                          ? `Based on your soft credit profile, you qualify for vehicle financing up to Rs ${eligibilityResult.maxLimit.toLocaleString()} with estimated monthly EMIs starting around Rs ${eligibilityResult.emiLimit.toLocaleString()}.`
                          : 'Your debt-to-income ratio is currently above recommended guidelines. Consider increasing your down payment size or lowering vehicle cost target.'}
                      </p>
                      {eligibilityResult.eligible && (
                        <div className="flex gap-4 pt-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>Grade: <strong className="text-emerald-600">{eligibilityResult.scoreGrade}</strong></span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Catalog Deals Card (Dealership Catalogs) */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Car className="text-[#0D9488]" size={22} /> Dealership Deals
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Exclusive discounted financing rates from partner dealerships
                </p>
              </div>

              <div className="space-y-4">
                {partnerCars.map((car) => (
                  <div
                    key={car.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#0D9488]/40 transition-colors"
                  >
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full sm:w-28 h-28 object-cover rounded-xl"
                    />
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{car.type}</span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                            {car.rate} APR
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white text-base mt-1">{car.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{car.dealer}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</p>
                          <p className="font-black text-sm text-slate-900 dark:text-white">{car.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => configureCatalogFinance(car.price, car.rate)}
                          className="px-4 py-2 bg-[#0F172A] dark:bg-slate-800 hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          Configure Finance
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Demo Helper Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-850 backdrop-blur rounded-2xl border border-slate-200/20 max-w-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Toggle Active Loan Dashboard vs Application Gateways
              </span>
              <button
                type="button"
                onClick={() => setHasActiveLoan(!hasActiveLoan)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  hasActiveLoan
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                }`}
              >
                {hasActiveLoan ? 'Showing Active Loan Account' : 'Show Active Loan Account'}
              </button>
            </div>

            {!hasActiveLoan ? (
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Application Flow */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
                  {/* Step Wizard Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Car className="text-[#0D9488]" size={22} /> Loan Application Wizard
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Submit verification documents securely
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((stepNum) => (
                        <div
                          key={stepNum}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                            appStep === stepNum
                              ? 'bg-[#0D9488] border-[#0D9488] text-white'
                              : appStep > stepNum
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          {appStep > stepNum ? <Check size={12} /> : stepNum}
                        </div>
                      ))}
                    </div>
                  </div>

                  {appStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Type</label>
                          <div className="grid grid-cols-3 gap-4">
                            {['new', 'used', 'imported'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setCarType(type)}
                                className={`p-4 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                                  carType === type
                                    ? 'border-[#0F172A] dark:border-white bg-[#0F172A]/5 dark:bg-white/5 text-slate-900 dark:text-white'
                                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Make & Model</label>
                            <input
                              type="text"
                              placeholder="e.g. Toyota Civic"
                              value={makeModel}
                              onChange={(e) => setMakeModel(e.target.value)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Model Year</label>
                            <select
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                            >
                              <option value="2026">2026</option>
                              <option value="2025">2025</option>
                              <option value="2024">2024</option>
                              <option value="2023">2023</option>
                              <option value="2022">2022</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAppStep(2)}
                        disabled={!makeModel}
                        className="w-full py-4 bg-[#0D9488] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-teal-600 transition-all shadow-md"
                      >
                        Continue to Documents <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  )}

                  {appStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/20 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
                          <Lock className="shrink-0 mt-0.5" size={16} />
                          <p className="text-xs font-semibold leading-relaxed">
                            AskariBank enforces banking-grade AES-256 encryption. Your payroll slips and bank logs are exclusively utilized for instant credit profiling and never shared.
                          </p>
                        </div>

                        {/* Salary Slip */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Upload Salary Slip (PDF, JPG)</label>
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0D9488]/40 transition-colors relative">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setSalarySlip(e.target.files[0]);
                                }
                              }}
                            />
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="text-slate-400" size={24} />
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {salarySlip ? salarySlip.name : 'Drag & drop salary slip, or browse files'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">Max file size 10MB</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank Statement */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Upload 6-Month Bank Statement (PDF)</label>
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0D9488]/40 transition-colors relative">
                            <input
                              type="file"
                              accept=".pdf"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setBankStatement(e.target.files[0]);
                                }
                              }}
                            />
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="text-slate-400" size={24} />
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {bankStatement ? bankStatement.name : 'Drag & drop statement, or browse files'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">Max file size 15MB</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setAppStep(1)}
                          className="flex-1 py-4 bg-slate-100 dark:bg-slate-850 rounded-xl font-black text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200/10"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleApply}
                          disabled={applying || !salarySlip || !bankStatement}
                          className="flex-1 py-4 bg-[#0D9488] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-teal-600 transition-all shadow-lg"
                        >
                          {applying ? (
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Encrypting & uploading...
                            </span>
                          ) : (
                            'Submit Application'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {appStep === 3 && appSubmitted && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-10 space-y-6"
                    >
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl">
                        ✓
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">Application Received</h4>
                        <p className="text-slate-500 font-semibold text-xs leading-relaxed max-w-md mx-auto">
                          Your vehicle financing package for the <strong>{makeModel} ({year})</strong> is successfully registered under reference ID <strong>#ASK-LN-82947</strong>.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl max-w-xs mx-auto border border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Next Audit Stage:</span>
                        <span className="text-[#0D9488]">Credit Appraisal (Automated)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAppStep(1);
                          setAppSubmitted(false);
                          setMakeModel('');
                          setSalarySlip(null);
                          setBankStatement(null);
                        }}
                        className="py-3 px-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md"
                      >
                        File Another Request
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Application Status Tracker */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="text-[#0D9488]" size={22} /> Status Tracker
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Real-time financing lifecycle track
                    </p>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                    {[
                      {
                        title: 'Document Upload & Verification',
                        desc: 'Salary slips and statements compiled.',
                        status: 'completed',
                      },
                      {
                        title: 'Credit Appraisal & Scoring',
                        desc: 'Automated soft checking active.',
                        status: 'active',
                      },
                      {
                        title: 'Final Bank Underwriter Approval',
                        desc: 'Formal loan agreement signature.',
                        status: 'pending',
                      },
                      {
                        title: 'Dealer Escrow Funds Disbursed',
                        desc: 'Secured delivery matching dealership.',
                        status: 'pending',
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="relative space-y-1">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[30px] top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                            step.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-950 text-white'
                              : step.status === 'active'
                              ? 'bg-[#0D9488] border-teal-100 dark:border-teal-950 text-white animate-pulse'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          {step.status === 'completed' && <Check size={10} />}
                        </div>
                        <h4
                          className={`text-sm font-black ${
                            step.status === 'completed'
                              ? 'text-emerald-600'
                              : step.status === 'active'
                              ? 'text-[#0D9488]'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Post-Approval Active Car Loan Dashboard */
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Active Loan Specs */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0D9488] bg-teal-50 dark:bg-teal-950/30 px-2.5 py-1 rounded-lg border border-teal-500/10">
                        Active Agreement
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        Honda Civic Oriel Financing
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                        Contract ref: #LN-829472-HONDA
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Calendar size={14} /> Issued Jun 2025
                    </span>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Loan</span>
                      <p className="text-lg font-black text-slate-950 dark:text-white">Rs 6,640,000</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out. Principal</span>
                      <p className="text-lg font-black text-[#0D9488]">Rs 5,810,000</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next EMI Due</span>
                      <p className="text-lg font-black text-slate-950 dark:text-white">Rs 118,500</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
                      <p className="text-lg font-black text-amber-600">05 Jun 2026</p>
                    </div>
                  </div>

                  {/* Progress repayment slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Repayment Progress (12 / 60 Months)</span>
                      <span className="text-[#0D9488]">20.0% Completed</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] rounded-full" style={{ width: '20%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Start: Jun 2025</span>
                      <span>End: Jun 2030</span>
                    </div>
                  </div>
                </div>

                {/* Gateways Actions: Auto-Debit & Prepayment */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Auto Debit Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">E-Mandate Auto-Debit</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Automated payments</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Enable automatic balance withdrawals on the 5th of each month from your primary checking balance to avoid late charges.
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Auto Debit Status</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoDebit(!autoDebit);
                          setShowAutoDebitToast(true);
                          setTimeout(() => setShowAutoDebitToast(false), 3000);
                        }}
                        className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                          autoDebit ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${
                            autoDebit ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAutoDebitToast && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-wider"
                        >
                          Auto Debit Mandate: {autoDebit ? 'Enabled ✓' : 'Disabled'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Prepayment & Foreclosure Card */}
                  <div className="bg-[#0F172A] rounded-[32px] p-6 md:p-8 text-white shadow-xl space-y-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 text-white rounded-xl">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white uppercase tracking-wider">Early Repayment</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Foreclosure settlement</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      Settle your auto agreement ahead of schedule. Access dynamic payoff quote computations, incorporating a minimal 1% foreclosure premium.
                    </p>

                    <button
                      type="button"
                      onClick={() => setForeclosureOpen(true)}
                      className="w-full py-3.5 bg-white text-slate-950 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all shadow-md"
                    >
                      Calculate Settlement Payoff
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

          {/* Foreclosure Calculation Settlement Modal */}
          <AnimatePresence>
            {foreclosureOpen && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-850 p-8 space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Foreclosure Quote</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Early agreement settlement</p>
                  </div>

                  {foreclosureSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                        ✓
                      </div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-white">Agreement Settled</h4>
                      <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
                        Your auto loan contract #LN-829472-HONDA has been closed successfully. Remaining balance cleared.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Outstanding Principal:</span>
                          <span className="text-slate-950 dark:text-white">Rs 5,810,000</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Early Termination (1%):</span>
                          <span className="text-teal-600">Rs 58,100</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500">Payoff Settlement Total:</span>
                          <span className="text-slate-950 dark:text-white text-base font-black">Rs 5,868,100</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        By authorizing below, Rs 5,868,100 will be instantly deducted from your primary Askari checking account to permanently discharge your car loan liabilities.
                      </p>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setForeclosureOpen(false)}
                          disabled={foreclosing}
                          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-black text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleForeclosure}
                          disabled={foreclosing}
                          className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          {foreclosing ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Discharging...
                            </span>
                          ) : (
                            'Authorize Settle Payoff'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
      </div>
  );
};

export default CarLoanPage;
