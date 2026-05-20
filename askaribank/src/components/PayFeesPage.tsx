import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  Search,
  BookOpen,
  Building,
  School,
  FileText,
  Clock,
  Sparkles,
  Link2,
  FileCheck,
  Download,
  ShieldCheck
} from 'lucide-react';

interface PayFeesPageProps {
  user: any;
  refreshUser: () => void;
}

const PayFeesPage = ({ user, refreshUser }: PayFeesPageProps) => {
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState<'quick-pay' | 'vault'>('quick-pay');
  
  // Challan Search States
  const [institution, setInstitution] = useState<string>('NUST');
  const [challanId, setChallanId] = useState<string>('');
  const [fetchingVoucher, setFetchingVoucher] = useState<boolean>(false);
  const [voucherData, setVoucherData] = useState<any>(null);

  // Fee Installment States
  const [payPlan, setPayPlan] = useState<'full' | '3x' | '6x'>('full');

  // Linking Profiles States
  const [linkName, setLinkName] = useState<string>('');
  const [linkRollNo, setLinkRollNo] = useState<string>('');
  const [linkInst, setLinkInst] = useState<string>('NUST');
  const [linkedProfiles, setLinkedProfiles] = useState<any[]>([
    { id: 1, name: 'Zainab Sami', rollNo: 'CMS-20491', inst: 'NUST', status: 'Cleared' }
  ]);

  // Payment Confirmation States
  const [payingFee, setPayingFee] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<boolean>(false);
  const [receiptVoucher, setReceiptVoucher] = useState<any>(null);

  // Vault History
  const [vaultReceipts, setVaultReceipts] = useState<any[]>([
    { id: 'REC-9082', student: 'Zainab Sami', inst: 'NUST', amount: 145000, date: '12 May 2026', type: 'Semester 4 Tuition' },
    { id: 'REC-7621', student: 'Zainab Sami', inst: 'Beaconhouse School System', amount: 24000, date: '02 May 2026', type: 'Monthly Tuition' }
  ]);

  const handleFetchVoucher = () => {
    if (!challanId) {
      alert('Please enter a valid Challan / Voucher ID');
      return;
    }
    setFetchingVoucher(true);
    setTimeout(() => {
      let feeAmount = 145000;
      let student = 'Sami Ullah';
      let instFull = 'National University of Sciences & Technology (NUST)';

      if (institution === 'beaconhouse') {
        feeAmount = 28000;
        instFull = 'Beaconhouse School System';
      } else if (institution === 'nts') {
        feeAmount = 3500;
        instFull = 'National Testing Service (NTS)';
      } else if (institution === 'bise') {
        feeAmount = 4500;
        instFull = 'Board of Intermediate & Secondary Education';
      }

      setVoucherData({
        studentName: student,
        instName: instFull,
        amount: feeAmount,
        dueDate: 'May 28, 2026',
        challanNo: challanId,
        desc: 'Academic Semester 5 Tuition Voucher'
      });
      setFetchingVoucher(false);
    }, 1500);
  };

  const handleLinkProfile = () => {
    if (!linkName || !linkRollNo) {
      alert('Please fill out all profile parameters');
      return;
    }
    setLinkedProfiles([
      ...linkedProfiles,
      { id: Date.now(), name: linkName, rollNo: linkRollNo, inst: linkInst, status: 'No Due Vouchers' }
    ]);
    setLinkName('');
    setLinkRollNo('');
    alert('Student profile linked successfully!');
  };

  const handleExecutePayment = () => {
    setPayingFee(true);
    setTimeout(() => {
      const actualCost = payPlan === '3x' ? Math.round(voucherData.amount / 3) : payPlan === '6x' ? Math.round(voucherData.amount / 6) : voucherData.amount;
      
      if (user.balance < actualCost) {
        alert('Insufficient balance in your Askari primary account.');
        setPayingFee(false);
        return;
      }

      setReceiptVoucher({
        id: 'REC-' + Math.floor(100000 + Math.random() * 900000),
        student: voucherData.studentName,
        inst: voucherData.instName,
        amount: actualCost,
        date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: payPlan !== 'full' ? `Tuition - Installment Plan (${payPlan})` : 'Full Tuition Fee'
      });

      // Add to vault
      setVaultReceipts([
        {
          id: 'REC-' + Math.floor(100000 + Math.random() * 900000),
          student: voucherData.studentName,
          inst: voucherData.instName,
          amount: actualCost,
          date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          type: payPlan !== 'full' ? `Installment Plan (${payPlan})` : 'Semester Tuition'
        },
        ...vaultReceipts
      ]);

      setPayingFee(false);
      setPaySuccess(true);
      setVoucherData(null);
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
              <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/10">
                <Sparkles size={12} /> Smart Automation
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Education & Fees payment
            </h1>
          </div>
        </div>

        {/* Segments */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setActiveSegment('quick-pay')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSegment === 'quick-pay'
                ? 'bg-white dark:bg-slate-850 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Voucher Clearance
          </button>
          <button
            onClick={() => setActiveSegment('vault')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeSegment === 'vault'
                ? 'bg-white dark:bg-slate-850 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Receipts Vault
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <GraduationCap size={24} /> Education & Institutional Fees
          </h2>
          <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed">
            Skip the lines and clear academic dues instantly. Pay school, college, university, and entry test fees securely using your roll number or challan ID.
          </p>
        </div>
      </motion.div>

      {/* Main Switch Tier */}
      <AnimatePresence mode="wait">
        {activeSegment === 'quick-pay' ? (
          <motion.div
            key="quick-pay"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Institution Category selector Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { type: 'NUST', label: 'Universities', icon: <Building size={20} /> },
                { type: 'beaconhouse', label: 'Schools', icon: <School size={20} /> },
                { type: 'colleges', label: 'Degree Colleges', icon: <BookOpen size={20} /> },
                { type: 'nts', label: 'Entry Tests', icon: <FileText size={20} /> },
                { type: 'bise', label: 'BISE Boards', icon: <ShieldCheck size={20} /> }
              ].map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => setInstitution(cat.type)}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all font-bold ${
                    institution === cat.type
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-500 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  {cat.icon}
                  <span className="text-xs tracking-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Fetch Voucher Panel */}
            <div className="grid lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="text-emerald-500" size={22} /> Clear Fee Voucher
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Input your unique Challan / Student Voucher ID
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Target Educational Body</label>
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="NUST">NUST University</option>
                      <option value="beaconhouse">Beaconhouse School System</option>
                      <option value="colleges">Punjab Medical College Dues</option>
                      <option value="nts">National Testing Service (NTS)</option>
                      <option value="bise">BISE Board Enrollment</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Challan No / Consumer Voucher ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. V-90827"
                        value={challanId}
                        onChange={(e) => setChallanId(e.target.value)}
                        className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
                      />
                      <Search className="absolute left-4 top-4.5 text-slate-400" size={18} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchVoucher}
                    disabled={fetchingVoucher || !challanId}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
                  >
                    {fetchingVoucher ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Fetching Voucher details...
                      </span>
                    ) : (
                      'Fetch Voucher Details'
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Voucher Result Card */}
              <div className="lg:col-span-5 relative">
                <AnimatePresence mode="wait">
                  {voucherData ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gradient-to-br from-slate-900 to-[#102A24] rounded-[32px] p-6 md:p-8 text-white shadow-xl flex flex-col justify-between border border-white/5 space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
                            Unpaid Voucher Dues
                          </span>
                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                            <Clock size={14} /> Due: {voucherData.dueDate}
                          </span>
                        </div>

                        <div className="space-y-1.5 border-b border-white/10 pb-4">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Student / Applicant</span>
                          <h4 className="text-xl font-black text-white">{voucherData.studentName}</h4>
                          <p className="text-xs font-semibold text-emerald-400">{voucherData.instName}</p>
                        </div>

                        {/* Split Installment Options */}
                        <div className="space-y-3">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Choose Payment Schedule</span>
                          <div className="grid grid-cols-3 gap-2">
                            {(['full', '3x', '6x'] as const).map((plan) => (
                              <button
                                key={plan}
                                type="button"
                                onClick={() => setPayPlan(plan)}
                                className={`p-2.5 rounded-xl border text-center transition-all font-bold ${
                                  payPlan === plan
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                                }`}
                              >
                                <span className="text-xs block capitalize">{plan} Plan</span>
                                <span className="text-[10px] block opacity-60">
                                  {plan === 'full'
                                    ? '100%'
                                    : plan === '3x'
                                    ? '3 Months'
                                    : '6 Months'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Calculated payable dues */}
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-300">Target Clearing Due:</span>
                          <span className="text-2xl font-black text-emerald-400">
                            Rs{' '}
                            {payPlan === '3x'
                              ? Math.round(voucherData.amount / 3).toLocaleString()
                              : payPlan === '6x'
                              ? Math.round(voucherData.amount / 6).toLocaleString()
                              : voucherData.amount.toLocaleString()}
                          </span>
                        </div>

                        {/* Credit Option contextual link back to loans */}
                        <div
                          onClick={() => navigate('/loans-hub')}
                          className="p-3 bg-blue-950/40 hover:bg-blue-900/30 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs font-black text-blue-400 cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-1.5">
                            📚 Need Financing? Apply for Education Loan
                          </span>
                          <span>→</span>
                        </div>
                      </div>

                      <button
                        onClick={handleExecutePayment}
                        disabled={payingFee}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                      >
                        {payingFee ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Authorizing Account Debit...
                          </>
                        ) : (
                          `Pay Voucher Now`
                        )}
                      </button>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl min-h-[300px]">
                      <div>
                        <GraduationCap size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-sm font-black text-slate-500 dark:text-slate-400">Fetch Voucher to Review Dues</p>
                        <p className="text-xs text-slate-400 mt-1">Specify an educational institute and enter your Challan reference ID.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Link Student Profile Tool */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Link2 className="text-emerald-500" size={22} /> Link Student Profiles
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Save profiles to receive automated alerts whenever vouchers are generated
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Zainab Sami"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Roll Number / CMS ID</label>
                      <input
                        type="text"
                        placeholder="e.g. CMS-20491"
                        value={linkRollNo}
                        onChange={(e) => setLinkRollNo(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Institution</label>
                      <select
                        value={linkInst}
                        onChange={(e) => setLinkInst(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all"
                      >
                        <option value="NUST">NUST</option>
                        <option value="Beaconhouse">Beaconhouse</option>
                        <option value="PMC">Punjab Medical College</option>
                        <option value="NTS">NTS</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLinkProfile}
                    className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    Link Student Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Linked Student Accounts</span>
                  <div className="space-y-3">
                    {linkedProfiles.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{p.inst} • {p.rollNo}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-850 space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="text-emerald-500" size={22} /> Stamped Fee Receipts Archive
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Download legal, bank-stamped payment receipts
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-black uppercase">
                    <th className="py-4">Receipt ID</th>
                    <th className="py-4">Student</th>
                    <th className="py-4">Educational Body</th>
                    <th className="py-4">Particulars</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Paid On</th>
                    <th className="py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultReceipts.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-4 text-xs font-mono font-bold text-slate-500">{r.id}</td>
                      <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{r.student}</td>
                      <td className="py-4 text-xs">{r.inst}</td>
                      <td className="py-4 text-xs">{r.type}</td>
                      <td className="py-4 text-sm font-black text-emerald-600">Rs {r.amount.toLocaleString()}</td>
                      <td className="py-4 text-xs text-slate-400">{r.date}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => alert(`Initiating legal PDF download for ${r.id}...`)}
                          className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg text-xs font-black hover:bg-emerald-100 transition-colors flex items-center gap-1.5 ml-auto border border-emerald-500/10"
                        >
                          <Download size={14} /> Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Success Modal */}
      <AnimatePresence>
        {paySuccess && receiptVoucher && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-850 p-6 md:p-8 space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
                ✓
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-xl text-slate-900 dark:text-white">Fee Paid Successfully</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Bank-stamped transaction approved
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850/60 p-5 rounded-2xl text-left space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-350">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptVoucher.student}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Institution:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptVoucher.inst}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Reference ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{receiptVoucher.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Particulars:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptVoucher.type}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Paid Dues:</span>
                  <span className="font-black text-sm text-emerald-600">Rs {receiptVoucher.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => alert(`Downloading Legal PDF for receipt ${receiptVoucher.id}`)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> PDF Voucher
                </button>
                <button
                  onClick={() => setPaySuccess(false)}
                  className="flex-1 py-3.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                >
                  Clear & Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PayFeesPage;
