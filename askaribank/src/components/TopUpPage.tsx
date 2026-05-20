import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Landmark, Apple, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SendMoneyForm, { type SendFormState } from './transfer/SendMoneyForm';
import OtpVerificationModal from './transfer/OtpVerificationModal';
import TransferSuccessScreen from './transfer/TransferSuccessScreen';
import { getPlatform, type PlatformId } from '../constants/transferPlatforms';
import { confirmTransferOtp, getBeneficiaries, requestTransferOtp } from '../utils/otpApi';
import { downloadTransferReceipt } from '../utils/receiptPdf';

const API = 'http://localhost:5000/api/user';

const defaultSendForm = (): SendFormState => ({
  platform: 'jazzcash',
  receiverName: '',
  account: '',
  bankName: '',
  amount: '',
  description: '',
  saveBeneficiary: false,
});

const TopUpPage = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'topup' | 'send'>('send');

  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const [loading, setLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);

  const [sendForm, setSendForm] = useState<SendFormState>(defaultSendForm);
  const [sendStep, setSendStep] = useState<'form' | 'success'>('form');
  const [otpOpen, setOtpOpen] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [smsDelivered, setSmsDelivered] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [sendError, setSendError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [successData, setSuccessData] = useState({
    transactionId: '',
    platform: '',
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    if (mode === 'send') {
      getBeneficiaries().then(setBeneficiaries).catch(() => {});
    }
  }, [mode]);

  const handleTopUp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/recharge`, { amount: parseFloat(amount) }, authHeaders());
      setTopupSuccess(true);
      refreshUser();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      alert('Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = useCallback(async () => {
    setLoading(true);
    setSendError('');
    setOtpError('');
    try {
      const data = await requestTransferOtp({
        recipientAccount: sendForm.account.replace(/\s/g, ''),
        recipientName: sendForm.receiverName,
        amount: parseFloat(sendForm.amount),
        targetType: sendForm.platform,
        description: sendForm.description,
        purpose: sendForm.description,
        bankName: sendForm.platform === 'bank' ? sendForm.bankName : undefined,
        saveBeneficiary: sendForm.saveBeneficiary,
      });
      setMaskedPhone(data.maskedPhone || 'your mobile');
      setSmsDelivered(Boolean(data.smsDelivered));
      setOtpExpiresIn(data.expiresIn || 60);
      setDevCode(data.code);
      setOtpOpen(true);
    } catch (err: any) {
      setSendError(err.response?.data?.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  }, [sendForm]);

  const verifyOtp = useCallback(
    async (otp: string) => {
      setLoading(true);
      setOtpError('');
      try {
        const data = await confirmTransferOtp(otp);
        setSuccessData({
          transactionId: data.transactionId || `TXN-${Date.now()}`,
          platform: data.platform || getPlatform(sendForm.platform).name,
        });
        setOtpOpen(false);
        setSendStep('success');
        refreshUser();
        getBeneficiaries().then(setBeneficiaries).catch(() => {});
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Verification failed';
        setOtpError(msg);
        if (err.response?.data?.locked) setOtpOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [sendForm.platform, refreshUser]
  );

  const resetSend = () => {
    setSendForm(defaultSendForm());
    setSendStep('form');
    setOtpOpen(false);
    setSendError('');
    setOtpError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 dark:from-[#020617] dark:to-[#0F172A] px-4 py-8 md:p-10"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Top Up & Transfer</h1>
            <p className="text-slate-500 font-medium text-sm">Bank accounts & Pakistani digital wallets</p>
          </div>
        </div>

        <motion.div
          layout
          className="flex gap-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl w-fit mb-8 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          {[
            { id: 'send' as const, label: 'Send Money' },
            { id: 'topup' as const, label: 'Top Up Wallet' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                if (tab.id === 'send') resetSend();
                setTopupSuccess(false);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === tab.id
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white shadow-md'
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {mode === 'send' && sendStep === 'success' && (
          <TransferSuccessScreen
            transactionId={successData.transactionId}
            amount={sendForm.amount}
            recipientName={sendForm.receiverName}
            account={sendForm.account}
            platformId={sendForm.platform}
            description={sendForm.description}
            onDownload={() =>
              downloadTransferReceipt({
                transactionId: successData.transactionId,
                amount: sendForm.amount,
                recipientName: sendForm.receiverName,
                account: sendForm.account,
                platform: successData.platform,
                description: sendForm.description,
              })
            }
            onHome={() => navigate('/dashboard')}
          />
        )}

        {mode === 'send' && sendStep === 'form' && (
          <SendMoneyForm
            user={user}
            form={sendForm}
            setForm={setSendForm}
            beneficiaries={beneficiaries}
            onSelectBeneficiary={(b) =>
              setSendForm((f) => ({
                ...f,
                receiverName: b.name,
                account: b.account,
                platform: (b.platform as PlatformId) || f.platform,
                bankName: b.bankName || f.bankName,
              }))
            }
            onProceed={sendOtp}
            loading={loading}
            error={sendError}
          />
        )}

        {mode === 'topup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {topupSuccess ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-[32px] p-16 text-center shadow-xl"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  ✓
                </div>
                <h2 className="text-2xl font-black">Top-Up Successful</h2>
                <p className="text-slate-500 mt-2">Rs {amount} added to your wallet</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div className="rounded-[32px] bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-10 text-white shadow-2xl">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Balance</p>
                  <p className="text-5xl font-black mt-2">Rs {(user.balance || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-[32px] bg-white/80 backdrop-blur p-8 shadow-xl border border-slate-100 space-y-6">
                  <h3 className="font-black text-xl">Add Funds</h3>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full p-4 rounded-2xl bg-slate-50 text-2xl font-black border border-slate-200 outline-none"
                  />
                  {[
                    { id: 'visa', name: 'Visa', icon: CreditCard },
                    { id: 'hbl', name: 'Askari Savings', icon: Landmark },
                    { id: 'apple', name: 'Apple Pay', icon: Apple },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${
                        selectedMethod === m.id ? 'border-[#0F172A]' : 'border-slate-100'
                      }`}
                    >
                      <m.icon size={20} />
                      <span className="font-bold">{m.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={loading || !amount}
                    onClick={handleTopUp}
                    className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={20} /> {loading ? 'Processing…' : 'Confirm Top Up'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <OtpVerificationModal
        open={otpOpen}
        maskedPhone={maskedPhone}
        smsDelivered={smsDelivered}
        amount={sendForm.amount}
        recipientName={sendForm.receiverName}
        platformName={getPlatform(sendForm.platform).name}
        loading={loading}
        error={otpError}
        expiresIn={otpExpiresIn}
        devCode={devCode}
        onClose={() => setOtpOpen(false)}
        onResend={sendOtp}
        onVerify={verifyOtp}
      />
    </motion.div>
  );
};

export default TopUpPage;
