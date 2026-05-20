import { motion } from 'framer-motion';
import { Send, User, Building2, Star } from 'lucide-react';
import {
  TRANSFER_PLATFORMS,
  PAKISTAN_BANKS,
  getPlatform,
  type PlatformId,
} from '../../constants/transferPlatforms';

export type SendFormState = {
  platform: PlatformId;
  receiverName: string;
  account: string;
  bankName: string;
  amount: string;
  description: string;
  saveBeneficiary: boolean;
};

type Beneficiary = {
  _id: string;
  name: string;
  account: string;
  platform: string;
  bankName?: string;
};

type Props = {
  user: { balance?: number; phone?: string };
  form: SendFormState;
  setForm: React.Dispatch<React.SetStateAction<SendFormState>>;
  beneficiaries: Beneficiary[];
  onSelectBeneficiary: (b: Beneficiary) => void;
  onProceed: () => void;
  loading: boolean;
  error: string;
};

const SendMoneyForm = ({
  user,
  form,
  setForm,
  beneficiaries,
  onSelectBeneficiary,
  onProceed,
  loading,
  error,
}: Props) => {
  const platform = getPlatform(form.platform);
  const isBank = form.platform === 'bank';
  const accountDigits = form.account.replace(/\s/g, '');
  const accountValid =
    isBank
      ? accountDigits.length >= 8
      : platform.accountPattern.test(accountDigits);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0D9488] p-8 md:p-10 text-white shadow-2xl"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"
        />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <p className="text-white/70 font-bold text-xs uppercase tracking-[0.2em]">Available Balance</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1">
            Rs {(user.balance || 0).toLocaleString()}
          </h2>
          <p className="text-white/60 text-sm mt-3 font-medium">
            Secure transfer via OTP to {user.phone || 'your registered mobile'}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[28px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700 p-6 md:p-8 shadow-xl space-y-6"
      >
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Select Transfer Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRANSFER_PLATFORMS.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm((f) => ({ ...f, platform: p.id }))}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                form.platform === p.id
                  ? `border-transparent bg-gradient-to-br ${p.gradient} text-white shadow-lg ring-2 ${p.ring}`
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-200'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <p className="font-black text-sm mt-2">{p.shortName}</p>
            </motion.button>
          ))}
        </div>

        {beneficiaries.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Star size={14} /> Favorite Beneficiaries
            </p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {beneficiaries.slice(0, 6).map((b) => (
                <motion.button
                  key={b._id}
                  type="button"
                  variants={{ hidden: { opacity: 0, x: 8 }, visible: { opacity: 1, x: 0 } }}
                  onClick={() => onSelectBeneficiary(b)}
                  className="shrink-0 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700"
                >
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{b.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{b.account}</p>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Receiver Name</label>
            <motion.div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={form.receiverName}
                onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
                placeholder="Full name"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {isBank ? 'Account / IBAN' : 'Wallet Number'}
            </label>
            <input
              value={form.account}
              onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
              placeholder={platform.accountPlaceholder}
              className={`w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border font-bold outline-none focus:ring-4 focus:ring-emerald-500/20 ${
                accountValid && form.account ? 'border-emerald-300' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </motion.div>
        </div>

        {isBank && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Building2 size={14} /> Bank Name
            </label>
            <select
              value={form.bankName}
              onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
            >
              <option value="">Select bank</option>
              {PAKISTAN_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (Rs)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xl font-black outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </motion.div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Payment purpose"
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none"
            />
          </div>
        </motion.div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.saveBeneficiary}
            onChange={(e) => setForm((f) => ({ ...f, saveBeneficiary: e.target.checked }))}
            className="w-5 h-5 rounded accent-emerald-600"
          />
          <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">Save as favorite beneficiary</span>
        </label>

        {error && <p className="text-rose-500 font-bold text-sm text-center">{error}</p>}

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={
            loading ||
            !form.receiverName ||
            !form.account ||
            !form.amount ||
            (isBank && !form.bankName) ||
            !accountValid
          }
          onClick={onProceed}
          className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 bg-gradient-to-r ${platform.gradient}`}
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={22} /> Proceed to Authorization
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SendMoneyForm;
