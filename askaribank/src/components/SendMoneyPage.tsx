import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSmsOtpAutofill } from '../hooks/useSmsOtpAutofill';
import { confirmTransferOtp, requestTransferOtp } from '../utils/otpApi';

const SendMoneyPage = ({ refreshUser }: { user: any; refreshUser: () => void }) => {
  const navigate = useNavigate();
  const [transferType] = useState('askaribank');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(0); // 0: Select Beneficiary, 1: Amount/Purpose, 2: OTP, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([
    { id: 1, name: 'Sami Ullah', account: 'PK89ASKR0000001234567890', nickname: 'Personal', bank: 'Askari Bank' },
    { id: 2, name: 'John Doe', account: '03001234567', nickname: 'John', bank: 'EasyPaisa' },
    { id: 3, name: 'Ayesha Khan', account: '03121234567', nickname: 'Ayesha', bank: 'NayaPay' },
    { id: 4, name: 'Zaid Ahmed', account: '03451234567', nickname: 'Zaid', bank: 'SadaPay' },
    { id: 5, name: 'Fatima Ali', account: '03331234567', nickname: 'Fatima', bank: 'UPaisa' }
  ]);
  const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
  const [isDirect, setIsDirect] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [newBene, setNewBene] = useState({ bank: 'askaribank', account: '', nickname: '', name: '' });
  const [selectedBene, setSelectedBene] = useState<any>(null);
  const [purpose, setPurpose] = useState('Family Support');
  const [saveAfterPay, setSaveAfterPay] = useState(false);

  const walletTypes = [
    { id: 'askaribank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'raast', name: 'Raast Pay', icon: '⚡' },
    { id: 'jazzcash', name: 'JazzCash', icon: '🔴' },
    { id: 'easypaisa', name: 'EasyPaisa', icon: '🟢' },
    { id: 'nayapay', name: 'NayaPay', icon: '🟠' },
    { id: 'sadapay', name: 'SadaPay', icon: '🔵' },
    { id: 'upaisa', name: 'UPaisa', icon: '🟡' },
  ];

  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [smsDelivered, setSmsDelivered] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');


  const generateTxId = () => {
    return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleAddBeneficiary = () => {
    setLoading(true);
    // Simulate OTP step for adding
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        name: 'Verified User', // Mocked title fetch
        account: newBene.account,
        nickname: newBene.nickname,
        bank: walletTypes.find(t => t.id === newBene.bank)?.name || 'Other'
      };
      setBeneficiaries(prev => [...prev, newEntry]);
      setSelectedBene(newEntry);
      setIsAddingBeneficiary(false);
      setIsDirect(false);
      setLoading(false);
      setStep(1);
    }, 1500);
  };

  const requestOtp = useCallback(async () => {
    setOtpLoading(true);
    setError('');
    const recipientInfo = isDirect ? newBene : selectedBene;
    try {
      const data = await requestTransferOtp({
        recipientAccount: recipientInfo.account,
        recipientName: recipientInfo.name || recipientInfo.nickname,
        amount: parseFloat(amount),
        targetType: isDirect ? newBene.bank : transferType,
        purpose,
      });
      setMaskedPhone(data.maskedPhone || 'your registered mobile');
      setSmsDelivered(Boolean(data.smsDelivered));
      setOtp('');
      setDevCode(data.code);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }, [isDirect, newBene, selectedBene, amount, transferType, purpose]);

  const handleVerifyAndSend = useCallback(async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await confirmTransferOtp(otp);

      if (saveAfterPay && isDirect) {
        const newEntry = {
          id: Date.now(),
          name: newBene.name || 'Verified User',
          account: newBene.account,
          nickname: newBene.nickname,
          bank: walletTypes.find(t => t.id === newBene.bank)?.name || 'Other',
        };
        setBeneficiaries((prev) => [...prev, newEntry]);
      }

      setTransactionId(generateTxId());
      setStep(3);
      refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }, [otp, saveAfterPay, isDirect, newBene, refreshUser]);

  useEffect(() => {
    if (step === 2 && otp.length === 6 && !loading) {
      handleVerifyAndSend();
    }
  }, [otp, step, loading, handleVerifyAndSend]);

  useSmsOtpAutofill(step === 2, useCallback((code) => setOtp(code), []), devCode);

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
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Send Money</h1>
          <p className="text-black font-medium opacity-70">
            Transfer funds instantly to any account or wallet
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center bg-[#0F172A] p-10 rounded-[40px] text-white">
              <div>
                <h2 className="text-3xl font-black">Select Beneficiary</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Saved Recipients</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsDirect(true);
                    setStep(1);
                  }}
                  className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black border border-white/20 hover:bg-white/20 transition-all"
                >
                  Direct Transfer
                </button>
                <button 
                  onClick={() => setIsAddingBeneficiary(true)}
                  className="px-8 py-4 bg-white text-[#0F172A] rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
                >
                  + Add New
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beneficiaries.map((bene) => (
                <button
                  key={bene.id}
                  onClick={() => {
                    setSelectedBene(bene);
                    setStep(1);
                  }}
                  className="flex items-center gap-6 p-8 bg-white rounded-[32px] border-2 border-slate-100 hover:border-primary transition-all text-left group"
                >
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary/10 group-hover:text-primary">
                    🏦
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-slate-900">{bene.name}</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{bene.bank} • {bene.nickname}</p>
                  </div>
                </button>
              ))}
            </div>

            {isAddingBeneficiary && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 w-full max-w-xl space-y-8">
                  <h3 className="text-3xl font-black text-[#0F172A]">Add Beneficiary</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {walletTypes.map(t => (
                        <button key={t.id} onClick={() => setNewBene({...newBene, bank: t.id})} className={`p-4 rounded-2xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest ${newBene.bank === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Account Number / IBAN" 
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none"
                      value={newBene.account}
                      onChange={e => setNewBene({...newBene, account: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Nickname" 
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none"
                      value={newBene.nickname}
                      onChange={e => setNewBene({...newBene, nickname: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsAddingBeneficiary(false)} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black">Cancel</button>
                    <button onClick={handleAddBeneficiary} className="flex-1 py-5 bg-[#0F172A] text-white rounded-2xl font-black shadow-xl">Verify & Add</button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <section className="bg-[#0F172A] rounded-[40px] p-10 shadow-xl border-solid">
              {isDirect ? (
                <div className="space-y-8 mb-10 pb-10 border-b border-white/10">
                  <h3 className="text-2xl font-black text-white">Enter Recipient Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number / IBAN</label>
                      <input 
                        type="text" 
                        value={newBene.account}
                        onChange={e => setNewBene({...newBene, account: e.target.value})}
                        className="w-full p-5 bg-white/5 rounded-2xl text-white font-bold outline-none border border-white/5 focus:border-primary transition-all"
                        placeholder="03XXXXXXXXX or IBAN"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nickname (Optional)</label>
                      <input 
                        type="text" 
                        value={newBene.nickname}
                        onChange={e => setNewBene({...newBene, nickname: e.target.value})}
                        className="w-full p-5 bg-white/5 rounded-2xl text-white font-bold outline-none border border-white/5 focus:border-primary transition-all"
                        placeholder="e.g. Rent Payment"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🏦</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedBene.name}</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{selectedBene.bank} • {selectedBene.account}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-widest px-2 opacity-60">
                    Amount to Send
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20">Rs</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-20 pr-8 py-6 bg-white/10 border-none rounded-3xl text-4xl font-black text-white focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-widest px-2 opacity-60">
                    Purpose of Payment
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Family Support', 'Education', 'Bill Payment', 'Gift'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPurpose(p)}
                        className={`p-4 rounded-2xl border-2 transition-all font-bold text-xs ${purpose === p ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    disabled={!amount || loading || otpLoading || (isDirect && !newBene.account)}
                    onClick={() => {
                      if (isDirect) setShowPaymentChoice(true);
                      else requestOtp();
                    }}
                    className="w-full py-6 bg-white text-[#0F172A] rounded-[32px] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Proceed to Authorization'}
                  </button>
                  <button 
                    onClick={() => {
                      setStep(0);
                      setIsDirect(false);
                    }} 
                    className="w-full text-center text-slate-500 font-bold text-sm mt-6"
                  >
                    Cancel
                  </button>
                  {error && <p className="text-rose-500 text-center font-bold mt-4">{error}</p>}
                </div>
              </div>
            </section>

            {/* Pay Once vs Save Modal */}
            {showPaymentChoice && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="bg-white rounded-[48px] p-12 w-full max-w-lg text-center space-y-10 shadow-2xl"
                >
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-primary" size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-[#0F172A]">Payment Strategy</h3>
                    <p className="text-slate-500 font-bold">Would you like to save this recipient for future transfers?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => {
                        setSaveAfterPay(false);
                        setShowPaymentChoice(false);
                        requestOtp();
                      }}
                      className="py-6 bg-slate-100 text-slate-900 rounded-3xl font-black text-xl hover:bg-slate-200 transition-all"
                    >
                      Pay Once
                    </button>
                    <button 
                      onClick={() => {
                        setSaveAfterPay(true);
                        setShowPaymentChoice(false);
                        requestOtp();
                      }}
                      className="py-6 bg-[#0F172A] text-white rounded-3xl font-black text-xl shadow-xl hover:scale-[1.02] transition-all"
                    >
                      Save and Pay
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowPaymentChoice(false)}
                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    Go Back
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl mx-auto space-y-8"
          >
            <div className="bg-[#0F172A] rounded-[40px] p-10 text-white shadow-2xl text-center space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <Send className="text-primary" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Security Verification</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  {smsDelivered
                    ? `SMS sent to ${maskedPhone} — check Google Messages on your SIM`
                    : `Code for ${maskedPhone || 'your registered mobile'}`}
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Sending to</span>
                  <span className="font-black">{isDirect ? (newBene.name || newBene.nickname || newBene.account) : selectedBene.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Amount</span>
                  <span className="font-black text-primary text-xl">Rs {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Purpose</span>
                  <span className="font-black text-white/80">{purpose}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Enter the 6-digit code from your SMS
                </p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-12 h-14 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-black">
                      {otp[i-1] ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-rose-400 font-bold text-sm">{error}</p>}

              {loading && (
                <p className="text-primary font-bold animate-pulse">Verifying & sending money...</p>
              )}

              <button
                type="button"
                disabled={loading || otpLoading}
                onClick={requestOtp}
                className="flex items-center justify-center gap-2 mx-auto text-primary font-bold text-sm hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} /> Resend SMS
              </button>

              <button 
                onClick={() => setStep(1)}
                className="text-slate-500 font-bold hover:text-white transition-colors text-sm"
              >
                Cancel & Go Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto space-y-8"
          >
            {/* Digital Receipt View */}
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-emerald-500 p-10 text-white text-center space-y-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black">Transfer Successful</h2>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Digital Receipt</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="text-center">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">{transactionId}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Amount Sent</span>
                    <span className="text-2xl font-black text-slate-900">Rs {parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Recipient Name</span>
                    <span className="font-black text-slate-900">{isDirect ? (newBene.name || newBene.nickname || newBene.account) : selectedBene.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Account/IBAN</span>
                    <span className="font-black text-slate-900">{isDirect ? newBene.account : selectedBene.account}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Purpose</span>
                    <span className="font-black text-slate-900">{purpose}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Payment Method</span>
                    <span className="font-black text-slate-900 uppercase">{walletTypes.find(t => t.id === transferType)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Date & Time</span>
                    <span className="font-black text-slate-900">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                  >
                    Download Receipt
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-5 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SendMoneyPage;
