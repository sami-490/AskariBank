import { motion } from 'framer-motion';
import { CheckCircle2, Download, Home } from 'lucide-react';
import { getPlatform, type PlatformId } from '../../constants/transferPlatforms';

type Props = {
  transactionId: string;
  amount: string;
  recipientName: string;
  account: string;
  platformId: PlatformId;
  description: string;
  onDownload: () => void;
  onHome: () => void;
};

const TransferSuccessScreen = ({
  transactionId,
  amount,
  recipientName,
  account,
  platformId,
  description,
  onDownload,
  onHome,
}: Props) => {
  const platform = getPlatform(platformId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${platform.gradient} p-10 text-white text-center`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 size={44} />
          </motion.div>
          <h2 className="text-3xl font-black">Transfer Successful</h2>
          <p className="text-white/80 font-bold text-sm mt-1">{platform.name}</p>
        </motion.div>

        <div className="p-8 space-y-4">
          <div className="text-center pb-4 border-b border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction ID</p>
            <p className="font-mono font-black text-lg text-slate-900 dark:text-white">{transactionId}</p>
          </div>
          {[
            ['Amount', `Rs ${parseFloat(amount).toLocaleString()}`],
            ['Recipient', recipientName],
            ['Account', account],
            ['Description', description || '—'],
            ['Date', new Date().toLocaleString()],
          ].map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-between gap-4"
            >
              <span className="text-slate-500 font-bold text-sm">{label}</span>
              <span className="font-black text-slate-900 dark:text-white text-right text-sm">{value}</span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 pt-4"
          >
            <button
              type="button"
              onClick={onDownload}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Receipt
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black flex items-center justify-center gap-2"
            >
              <Home size={18} /> Back to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransferSuccessScreen;
