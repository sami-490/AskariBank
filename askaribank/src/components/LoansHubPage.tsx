import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Car,
  Home,
  Zap,
  ArrowLeft,
  ChevronRight,
  Calculator,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Upload,
  Lock
} from 'lucide-react';

interface LoansHubPageProps {
  user: any;
  refreshUser: () => void;
}

const LoansHubPage = ({ user: _user, refreshUser }: LoansHubPageProps) => {
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState<'hub' | 'planning'>('hub');
  
  // Universal Calculator States
  const [calcType, setCalcType] = useState<'personal' | 'auto' | 'home' | 'nano'>('personal');
  const [calcAmount, setCalcAmount] = useState<number>(1000000);
  const [calcTenure, setCalcTenure] = useState<number>(3); // Years
  const [calcRate, setCalcRate] = useState<number>(11.5);
  const [emiOutput, setEmiOutput] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);

  // Soft Eligibility Tool States
  const [income, setIncome] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [runningEligibility, setRunningEligibility] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  // Product Modals
  const [activeApplyModal, setActiveApplyModal] = useState<'personal' | 'home' | 'nano' | null>(null);
  const [appStep, setAppStep] = useState<number>(1);
  const [applyAmount, setApplyAmount] = useState<string>('');
  const [applyTenure, setApplyTenure] = useState<string>('');
  const [applyPurpose, setApplyPurpose] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
  const [submittingApp, setSubmittingApp] = useState<boolean>(false);
  const [appSuccess, setAppSuccess] = useState<boolean>(false);

  // Auto-set calculator bounds based on loan type selection
  useEffect(() => {
    switch (calcType) {
      case 'personal':
        setCalcAmount(1000000);
        setCalcTenure(3);
        setCalcRate(11.5);
        break;
      case 'auto':
        setCalcAmount(3000000);
        setCalcTenure(5);
        setCalcRate(8.9);
        break;
      case 'home':
        setCalcAmount(8000000);
        setCalcTenure(15);
        setCalcRate(7.5);
        break;
      case 'nano':
        setCalcAmount(25000);
        setCalcTenure(1); // 1 Month
        setCalcRate(0); // 0% interest, flat service charge
        break;
    }
  }, [calcType]);

  // Recalculate Universal EMI
  useEffect(() => {
    if (calcType === 'nano') {
      // Payday flat 5% processing fee, payable in 30 days
      const fee = calcAmount * 0.05;
      setEmiOutput(Math.round(calcAmount + fee));
      setTotalInterest(Math.round(fee));
      setTotalPayable(Math.round(calcAmount + fee));
      return;
    }

    const principal = calcAmount;
    const monthlyRate = (calcRate / 12) / 100;
    const months = calcTenure * 12;

    if (principal > 0 && monthlyRate > 0 && months > 0) {
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      const total = emi * months;
      const interest = total - principal;

      setEmiOutput(Math.round(emi));
      setTotalInterest(Math.round(interest));
      setTotalPayable(Math.round(total));
    }
  }, [calcType, calcAmount, calcTenure, calcRate]);

  // Eligibility pull
  const handleCheckEligibility = () => {
    if (!income || isNaN(Number(income))) {
      alert('Please enter your monthly income');
      return;
    }
    setRunningEligibility(true);
    setTimeout(() => {
      const netIncome = Number(income);
      const netExpenses = Number(expenses || 0);
      const savings = Math.max(0, netIncome - netExpenses);
      
      const maxLimit = savings * 15;
      const preApproved = maxLimit > 300000;

      setEligibilityResult({
        eligible: preApproved,
        maxLimit: preApproved ? Math.round(maxLimit) : 0,
        grade: savings > 150000 ? 'A+' : savings > 80000 ? 'A' : 'B',
        debtRatio: Math.round((netExpenses / netIncome) * 100)
      });
      setRunningEligibility(false);
    }, 2000);
  };

  // Submit General application
  const handleGeneralSubmit = () => {
    if (!applyAmount || !uploadedDoc) {
      alert('Please fill all required parameters & upload documents');
      return;
    }
    setSubmittingApp(true);
    setTimeout(() => {
      setSubmittingApp(false);
      setAppSuccess(true);
      refreshUser();
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
              <span className="p-1.5 bg-[#0D9488]/10 text-[#0D9488] rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> Digital Lending
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Loans & Financing Hub
            </h1>
          </div>
        </div>

        {/* Hub Segments */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setActiveSegment('hub')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSegment === 'hub'
                ? 'bg-white dark:bg-slate-850 text-[#0D9488] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Loan Products
          </button>
          <button
            onClick={() => setActiveSegment('planning')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSegment === 'planning'
                ? 'bg-white dark:bg-slate-850 text-[#0D9488] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Universal Planner
          </button>
        </div>
      </div>

      {/* Corporate Dashboard Card Description Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0D9488] p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#0D9488] flex items-center gap-2">
            <Banknote size={24} /> Askari Financing Hub
          </h2>
          <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed">
            Access fast, flexible financing options designed to power your milestones. From purchasing a home or vehicle to managing unexpected expenses, apply digitally and track your funds instantly.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              🚀 100% Digital Submission
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              ⚡ Instant Decisioning Engine
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
              🛡️ Zero Payday Collateral
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Switch Tier */}
      <AnimatePresence mode="wait">
        {activeSegment === 'hub' ? (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* Core Product Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Product 1: Car Loan */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-[#0D9488] rounded-2xl w-fit">
                      <Car size={26} />
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-500/10">
                      From 8.9% APR
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Car Loan (Auto Financing)</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dedicated vehicle financing</p>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                      Drive your dream car today. Access quick approvals, competitive interest rates, and flexible repayment plans tailored to fit your monthly budget.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/car-loan')}
                  className="w-full py-4 bg-[#0D9488] hover:bg-teal-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  Configure Auto Finance <ChevronRight size={16} />
                </button>
              </div>

              {/* Product 2: Personal Loan */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl w-fit">
                      <Calculator size={26} />
                    </div>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-lg border border-blue-500/10">
                      From 11.5% APR
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Loan</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Immediate Unsecured Financing</p>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                      Secure funding instantly for medical expenses, travel, weddings, or renovations. Features quick digital checking and zero collateral requirements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveApplyModal('personal');
                    setAppStep(1);
                    setAppSuccess(false);
                    setApplyAmount('');
                    setUploadedDoc(null);
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  Check Personal Loan Limit <ChevronRight size={16} />
                </button>
              </div>

              {/* Product 3: Home Loan / Mortgage */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl w-fit">
                      <Home size={26} />
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg border border-indigo-500/10">
                      From 7.5% APR
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Home Loans & Mortgages</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Long-Term Financing Solutions</p>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                      Purchase a residential flat, buy a plot of land, or finance structural construction. Access tailored tenure plans scaling comfortably up to 20 years.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveApplyModal('home');
                    setAppStep(1);
                    setAppSuccess(false);
                    setApplyAmount('');
                    setUploadedDoc(null);
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  Apply For Home Financing <ChevronRight size={16} />
                </button>
              </div>

              {/* Product 4: Salary Advance / Nano Loan */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-2xl w-fit">
                      <Zap size={26} />
                    </div>
                    <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-lg border border-purple-500/10">
                      0% Interest Payday
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Salary Advance / Nano Loan</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Instant pre-payday bridging</p>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                      Bridge small cash gaps right before payday. Draw up to 50% of your salary with flat processing fees. Fully integrated with automated payroll accounts.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveApplyModal('nano');
                    setAppStep(1);
                    setAppSuccess(false);
                    setApplyAmount('');
                    setUploadedDoc(null);
                  }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  Request Nano Payday Advance <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="planning"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Universal Loan Calculator Widget */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="text-[#0D9488]" size={22} /> Universal Loan Calculator
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Plan your loan specifications dynamically
                  </p>
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shrink-0">
                  {(['personal', 'auto', 'home', 'nano'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCalcType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        calcType === type
                          ? 'bg-white dark:bg-slate-800 text-[#0D9488] shadow-sm border border-slate-100/10'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Target Financing Amount</span>
                    <span className="text-[#0D9488] font-black text-base">Rs {calcAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={calcType === 'nano' ? 5000 : calcType === 'personal' ? 100000 : calcType === 'auto' ? 500000 : 2000000}
                    max={calcType === 'nano' ? 100000 : calcType === 'personal' ? 5000000 : calcType === 'auto' ? 15000000 : 50000000}
                    step={calcType === 'nano' ? 2500 : 50000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Rs {calcType === 'nano' ? '5K' : calcType === 'personal' ? '100K' : calcType === 'auto' ? '500K' : '2M'}</span>
                    <span>Rs {calcType === 'nano' ? '100K' : calcType === 'personal' ? '5M' : calcType === 'auto' ? '15M' : '50M'}</span>
                  </div>
                </div>

                {calcType !== 'nano' && (
                  <>
                    {/* Tenure */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Repayment Period</span>
                        <span className="text-[#0D9488] font-black text-base">{calcTenure} Years ({calcTenure * 12} Months)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={calcType === 'home' ? 20 : 7}
                        step="1"
                        value={calcTenure}
                        onChange={(e) => setCalcTenure(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                      />
                      <div className="flex justify-between text-xs text-slate-400 font-bold">
                        <span>1 Year</span>
                        <span>{calcType === 'home' ? '20 Years' : '7 Years'}</span>
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Rate of Interest (Per Annum)</span>
                        <span className="text-[#0D9488] font-black text-base">{calcRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="22"
                        step="0.1"
                        value={calcRate}
                        onChange={(e) => setCalcRate(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                      />
                      <div className="flex justify-between text-xs text-slate-400 font-bold">
                        <span>5.0%</span>
                        <span>22.0%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Calculations Breakdown Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-[32px] p-6 md:p-8 text-white shadow-xl flex flex-col justify-between border border-white/5 space-y-6">
              <div className="space-y-4">
                <span className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
                  {calcType === 'nano' ? 'Full Return Payable' : 'Calculated Monthly EMI'}
                </span>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Installment</span>
                  <h4 className="text-4xl md:text-5xl font-black text-[#0D9488] tracking-tight">
                    <span className="text-lg opacity-40 mr-1">Rs</span>
                    {emiOutput.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-4 border-t border-b border-white/10 py-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Principal Amount:</span>
                  <span>Rs {calcAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Interest & Services:</span>
                  <span className="text-teal-400">Rs {totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-3 border-t border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider">Total Repayment:</span>
                  <span>Rs {totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (calcType === 'auto') {
                      navigate('/car-loan');
                    } else {
                      setActiveApplyModal(calcType === 'home' ? 'home' : calcType === 'nano' ? 'nano' : 'personal');
                      setAppStep(1);
                      setApplyAmount(String(calcAmount));
                      setUploadedDoc(null);
                      setAppSuccess(false);
                    }
                  }}
                  className="w-full py-4 bg-[#0D9488] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-lg text-sm"
                >
                  Configure Application <ChevronRight size={16} />
                </button>
                <p className="text-[10px] text-slate-400 text-center font-bold">
                  *Calculations are indicative. Rates subject to final credit scoring.
                </p>
              </div>
            </div>

            {/* Credit Score Check Tool */}
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="text-[#0D9488]" size={22} /> Credit Score & Borrow Capacity Check
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Instant soft checking algorithm — Zero credit scoring footprint
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Net Income (Rs)</label>
                    <input
                      type="number"
                      placeholder="e.g. 180000"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Existing Monthly Expenses (Rs)</label>
                    <input
                      type="number"
                      placeholder="e.g. 40000"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckEligibility}
                    disabled={runningEligibility || !income}
                    className="w-full py-4 bg-[#0F172A] dark:bg-slate-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#1E293B] transition-all shadow-md"
                  >
                    {runningEligibility ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing credit registry profiles...
                      </span>
                    ) : (
                      'Check Credit & Borrow Limit'
                    )}
                  </button>
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {eligibilityResult ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-2xl border-2 flex flex-col gap-4 ${
                          eligibilityResult.eligible
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/20 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-base flex items-center gap-2">
                            {eligibilityResult.eligible ? (
                              <>
                                <CheckCircle size={20} className="text-emerald-650" /> Pre-Approved Borrower
                              </>
                            ) : (
                              <>
                                <HelpCircle size={20} className="text-rose-650" /> Action Required
                              </>
                            )}
                          </h4>
                          <span className="px-3 py-1 bg-white/40 dark:bg-white/5 border border-current rounded-lg text-xs font-black">
                            Score Grade: {eligibilityResult.grade}
                          </span>
                        </div>

                        <p className="text-xs font-semibold leading-relaxed">
                          {eligibilityResult.eligible
                            ? `Askari's automated underwriter systems authorize a maximum financing capacity up to Rs ${eligibilityResult.maxLimit.toLocaleString()} based on a soft debt-to-income metric of ${eligibilityResult.debtRatio}%.`
                            : `Your debt profile exceeds 55% of net monthly savings. Please settle outstanding balances or connect a salary proof account to unlock financing options.`}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <FileCheck size={36} className="mx-auto text-slate-300 dark:text-slate-755 mb-2" />
                        <p className="text-xs font-semibold">Enter your monthly finance profile data to extract borrowing limits.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Application Modals (Personal / Home / Nano) */}
      <AnimatePresence>
        {activeApplyModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-850 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                    {activeApplyModal} Loan Gateway
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Askari instant verification pathway
                  </p>
                </div>
                <button
                  onClick={() => setActiveApplyModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full font-black text-slate-500 transition-colors"
                >
                  X
                </button>
              </div>

              {appSuccess ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xl text-slate-900 dark:text-white">Application Received Successfully</h4>
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                      Your financing request for {activeApplyModal} loan has been logged under ID **#ASK-LN-{Math.floor(100000 + Math.random() * 900000)}**.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveApplyModal(null)}
                    className="px-6 py-3 bg-[#0D9488] hover:bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Return to Hub
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step Indicators */}
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    {[1, 2].map((step) => (
                      <div
                        key={step}
                        className={`px-3 py-1 rounded-full text-xs font-black border-2 transition-all ${
                          appStep === step
                            ? 'bg-[#0D9488] border-[#0D9488] text-white'
                            : appStep > step
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        Step {step}
                      </div>
                    ))}
                  </div>

                  {appStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Target Finance Amount (Rs)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500000"
                          value={applyAmount}
                          onChange={(e) => setApplyAmount(e.target.value)}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Desired Tenure</label>
                          <input
                            type="text"
                            placeholder={activeApplyModal === 'nano' ? '30 Days' : 'e.g. 3 Years'}
                            value={applyTenure}
                            onChange={(e) => setApplyTenure(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Employment Sector</label>
                          <select className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all">
                            <option>Salaried Corporate</option>
                            <option>Self Employed Professional</option>
                            <option>Government Employee</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Purpose of Financing</label>
                        <input
                          type="text"
                          placeholder="e.g. Renovation, Paycheck Gap, Immediate Expenses"
                          value={applyPurpose}
                          onChange={(e) => setApplyPurpose(e.target.value)}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-[#0D9488] outline-none transition-all"
                        />
                      </div>

                      <button
                        onClick={() => setAppStep(2)}
                        disabled={!applyAmount}
                        className="w-full py-4 bg-[#0D9488] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-md disabled:opacity-50"
                      >
                        Continue to Documents <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  )}

                  {appStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/20 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
                        <Lock className="shrink-0 mt-0.5" size={16} />
                        <p className="text-xs font-semibold leading-relaxed">
                          Askari bank-grade AES-256 decryption guarantees total data confidentiality. Your payloads are strictly utilized for scoring calculations.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Upload Verification Document (6-Month statement / PDF)</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center cursor-pointer hover:border-[#0D9488]/40 transition-colors relative">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setUploadedDoc(e.target.files[0]);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="text-slate-400" size={26} />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {uploadedDoc ? uploadedDoc.name : 'Select or drop statement document'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Max size limit: 15MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setAppStep(1)}
                          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleGeneralSubmit}
                          disabled={submittingApp || !uploadedDoc}
                          className="flex-1 py-4 bg-[#0D9488] text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {submittingApp ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Validating data...
                            </>
                          ) : (
                            'Authorize Submission'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LoansHubPage;
