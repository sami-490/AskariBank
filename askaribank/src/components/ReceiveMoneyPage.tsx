import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiveMoneyPage = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const username = `@${user.name.toLowerCase().replace(/\s+/g, '_')}_${user.accountNumber.slice(-4)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`http://askaribank.com/pay/${username}`);
    alert('Payment link copied!');
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(user.accountNumber);
    alert('Account number copied!');
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AskariBank QR',
          text: `Scan to pay ${user.name} on AskariBank`,
          url: `http://askaribank.com/pay/${username}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this browser. You can copy the link instead.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] p-10 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Receive Money</h1>
          <p className="text-black font-medium opacity-70">Accept payments instantly via QR</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] overflow-hidden shadow-2xl border border-slate-100"
        >
          {/* QR Section */}
          <div className="bg-[#0F172A] p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
            
            <p className="relative z-10 text-white/80 font-bold uppercase tracking-[0.2em] text-xs">Your Personal QR Code</p>
            
            <div className="relative z-10 w-64 h-64 bg-white rounded-[40px] mx-auto p-6 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-slate-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${user.accountNumber}`} 
                alt="Payment QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">{username}</h2>
              <p className="text-white/80 font-medium text-lg">{user.name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-12 space-y-10">
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-3 py-5 px-6 rounded-3xl border-2 border-slate-100 font-bold text-black hover:bg-slate-50 transition-all group"
              >
                <Copy size={20} className="text-black/40 group-hover:text-primary transition-colors" />
                Copy Link
              </button>
              <button 
                onClick={shareQR}
                className="flex items-center justify-center gap-3 py-5 px-6 rounded-3xl bg-[#0F172A] text-white font-bold hover:bg-[#1E293B] transition-all"
              >
                <Share2 size={20} />
                Share QR
              </button>
            </div>

            <div className="text-center">
              <p className="text-black/60 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                Your AskariBank ID is unique. Anyone can scan this code using their banking app to send you money instantly.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account Info Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-8 bg-white rounded-[32px] border border-slate-100 shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold text-black uppercase tracking-widest mb-1">Direct Account Number</p>
            <p className="text-xl font-black text-[#0F172A] tracking-widest">{user.accountNumber}</p>
          </div>
          <button 
            onClick={copyAccountNumber}
            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
          >
             <Copy size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiveMoneyPage;
