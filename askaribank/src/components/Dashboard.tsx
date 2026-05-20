import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  QrCode,
  Zap,
  FileText,
  Smartphone,
  CreditCard,
  Ticket,
  LineChart,
  Heart,
  Eye,
  EyeOff,
  Plus,
  Car,
  Banknote,
  GraduationCap,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  CheckCheck,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransferModal from './TransferModal';
import axios from 'axios';

interface Notification {
  id: string;
  type: 'transaction_in' | 'transaction_out' | 'login' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  amount?: number;
}

const QuickAction = ({
  icon,
  label,
  onClick,
  color = 'bg-slate-50 text-slate-600',
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color?: string;
}) => (
  <motion.button
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 group w-full"
  >
    <div
      className={`w-14 h-14 rounded-full ${color} flex items-center justify-center transition-transform group-hover:scale-110`}
    >
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-600">{label}</span>
  </motion.button>
);

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'transaction_in': return <ArrowDownLeft size={18} className="text-emerald-500" />;
    case 'transaction_out': return <ArrowUpRight size={18} className="text-rose-500" />;
    case 'login': return <Shield size={18} className="text-blue-500" />;
    case 'security': return <Shield size={18} className="text-amber-500" />;
    case 'system': return <Sparkles size={18} className="text-purple-500" />;
    default: return <Bell size={18} className="text-slate-500" />;
  }
};

const getNotificationBg = (type: string) => {
  switch (type) {
    case 'transaction_in': return 'bg-emerald-50';
    case 'transaction_out': return 'bg-rose-50';
    case 'login': return 'bg-blue-50';
    case 'security': return 'bg-amber-50';
    case 'system': return 'bg-purple-50';
    default: return 'bg-slate-50';
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const Dashboard = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferType, setTransferType] = useState<'send' | 'recharge'>('send');
  const [liveNotification, setLiveNotification] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from localStorage + generate from transactions
  useEffect(() => {
    const fetchAndBuildNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const { data } = await axios.get('http://localhost:5000/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const txList = Array.isArray(data) ? data : data?.data || [];
        const userId = user.id || user._id;
        const savedReadIds: string[] = JSON.parse(localStorage.getItem(`notif_read_${userId}`) || '[]');

        // Build notifications from transactions (last 20)
        const txNotifs: Notification[] = txList.slice(0, 20).map((tx: any) => {
          const isReceive = tx.type === 'receive';
          return {
            id: `tx_${tx.id || tx._id}`,
            type: isReceive ? 'transaction_in' as const : 'transaction_out' as const,
            title: isReceive ? 'Payment Received' : 'Payment Sent',
            message: isReceive
              ? `Rs ${(tx.amount || 0).toLocaleString()} received from ${tx.recipient || 'Askari User'}`
              : `Rs ${(tx.amount || 0).toLocaleString()} sent to ${tx.recipient || 'Recipient'}`,
            timestamp: tx.date || new Date().toISOString(),
            read: savedReadIds.includes(`tx_${tx.id || tx._id}`),
            amount: tx.amount,
          };
        });

        // Add login notification
        const loginNotif: Notification = {
          id: `login_${new Date().toDateString()}`,
          type: 'login',
          title: 'Secure Login Detected',
          message: `You logged in successfully on ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} at ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: new Date().toISOString(),
          read: savedReadIds.includes(`login_${new Date().toDateString()}`),
        };

        // Add welcome notification
        const welcomeNotif: Notification = {
          id: 'welcome_system',
          type: 'system',
          title: 'Welcome to AskariBank',
          message: 'Your premium banking portal is ready. Explore transfers, investments, and more.',
          timestamp: user.created_at || new Date().toISOString(),
          read: savedReadIds.includes('welcome_system'),
        };

        // Add security notification
        const securityNotif: Notification = {
          id: 'security_autologout',
          type: 'security',
          title: 'Auto-Logout Active',
          message: 'For your security, sessions auto-expire after 2 minutes of inactivity.',
          timestamp: new Date().toISOString(),
          read: savedReadIds.includes('security_autologout'),
        };

        setNotifications([loginNotif, securityNotif, ...txNotifs, welcomeNotif]);
      } catch (err) {
        // Still show system notifications even if tx fetch fails
        const userId = user.id || user._id;
        const savedReadIds: string[] = JSON.parse(localStorage.getItem(`notif_read_${userId}`) || '[]');
        setNotifications([
          {
            id: `login_${new Date().toDateString()}`,
            type: 'login',
            title: 'Secure Login',
            message: `Logged in at ${new Date().toLocaleTimeString()}`,
            timestamp: new Date().toISOString(),
            read: savedReadIds.includes(`login_${new Date().toDateString()}`),
          },
          {
            id: 'welcome_system',
            type: 'system',
            title: 'Welcome to AskariBank',
            message: 'Your premium banking portal is ready.',
            timestamp: new Date().toISOString(),
            read: savedReadIds.includes('welcome_system'),
          },
        ]);
      }
    };

    fetchAndBuildNotifications();
  }, [user]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    const userId = user.id || user._id;
    const readIds = notifications.map(n => n.id);
    localStorage.setItem(`notif_read_${userId}`, JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    const userId = user.id || user._id;
    const savedReadIds: string[] = JSON.parse(localStorage.getItem(`notif_read_${userId}`) || '[]');
    if (!savedReadIds.includes(id)) {
      savedReadIds.push(id);
      localStorage.setItem(`notif_read_${userId}`, JSON.stringify(savedReadIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAction = (type: 'send' | 'recharge') => {
    setTransferType(type);
    setIsTransferOpen(true);
  };

  // Monitor for incoming transactions
  useEffect(() => {
    if (user.transactions && user.transactions.length > 0) {
      const latestTx = user.transactions[0];
      if (latestTx.type === 'receive') {
        const txTime = new Date(latestTx.date).getTime();
        const now = new Date().getTime();
        if (now - txTime < 60000) {
          setLiveNotification({
            msg: `Incoming Payment: Rs ${latestTx.amount.toLocaleString()} received from ${latestTx.senderName || 'Askari User'}`,
            type: 'info'
          });
          setTimeout(() => setLiveNotification(null), 7000);
        }
      }
      if (latestTx.type === 'send') {
        const txTime = new Date(latestTx.date).getTime();
        const now = new Date().getTime();
        if (now - txTime < 60000) {
          setLiveNotification({
            msg: `Payment Sent: Rs ${latestTx.amount.toLocaleString()} successfully transferred to ${latestTx.recipientName || latestTx.recipientAccount}`,
            type: 'success'
          });
          setTimeout(() => setLiveNotification(null), 7000);
        }
      }
    }
  }, [user.transactions, refreshUser]);

  return (
    <div className="min-h-screen bg-white px-4 py-8 md:p-10 space-y-8 md:space-y-12">
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => {
          refreshUser();
        }}
        type={transferType}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">
            Welcome back, {user.name || 'Valued Member'}
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Ready to manage your finances today?
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => handleAction('recharge')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 md:px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-sm md:text-base"
          >
            <Plus size={18} /> Recharge
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-3 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-[380px] max-h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  {/* Panel Header */}
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                        <Bell size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">Notifications</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {unreadCount} unread
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors px-3 py-1.5 rounded-xl hover:bg-blue-50"
                        >
                          <CheckCheck size={14} /> Read All
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifPanel(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={28} className="text-slate-200" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                        <p className="text-xs text-slate-300 mt-1">Activity will appear here</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => markOneRead(notif.id)}
                          className={`flex items-start gap-4 p-4 hover:bg-slate-50/70 transition-all cursor-pointer ${
                            !notif.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${getNotificationBg(notif.type)}`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-sm truncate ${!notif.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-2">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-1.5 text-slate-300">
                              <Clock size={10} />
                              <span className="text-[10px] font-bold">{timeAgo(notif.timestamp)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Panel Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => {
                          setShowNotifPanel(false);
                          navigate('/transactions');
                        }}
                        className="w-full text-center text-xs font-black text-slate-900 uppercase tracking-widest py-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        View All Activity →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-[#0F172A] rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-6 md:space-y-8 w-full">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Available Balance</span>
                <button onClick={() => setShowBalance(!showBalance)} className="hover:text-white transition-colors">
                  {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
                <span className="text-xl md:text-2xl opacity-40">Rs</span>
                {showBalance ? (user.balance || 0).toLocaleString() : '••••••••'}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Account Number</span>
                <button onClick={() => setShowAccount(!showAccount)} className="hover:text-white transition-colors">
                  {showAccount ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-2 md:gap-4 font-mono text-base md:text-xl font-bold">
                {showAccount ? user.accountNumber : '**** **** **** ' + (user.accountNumber?.slice(-4) || '9556')}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-slate-900 rounded-xl md:rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm md:text-base whitespace-nowrap"
            >
              <Send size={18} />
              Send
            </button>
            <button
              onClick={() => navigate('/topup')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl md:rounded-2xl font-bold transition-all border border-white/10 text-sm md:text-base whitespace-nowrap"
            >
              <Plus size={18} />
              Add Money
            </button>
          </div>
        </div>
      </motion.div>

      {/* Real-time Notification Alert */}
      <AnimatePresence>
        {liveNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-10 right-10 z-[200] p-6 rounded-[24px] shadow-2xl border flex items-center gap-4 max-w-sm ${
              liveNotification.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-[#0F172A] border-slate-700 text-white'
            }`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Real-time Alert</p>
              <p className="text-sm font-bold">{liveNotification.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Quick Actions</h3>
          <button className="text-sm md:text-base text-slate-900 font-bold hover:underline">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          <QuickAction
            icon={<Send size={24} />}
            label="Send"
            onClick={() => navigate('/send')}
            color="bg-blue-50 text-blue-600"
          />
          <QuickAction
            icon={<QrCode size={24} />}
            label="Receive"
            onClick={() => navigate('/receive')}
            color="bg-purple-50 text-purple-600"
          />
          <QuickAction
            icon={<Zap size={24} />}
            label="Recharge"
            onClick={() => navigate('/recharge')}
            color="bg-amber-50 text-amber-600"
          />
          <QuickAction
            icon={<FileText size={24} />}
            label="Bills"
            onClick={() => navigate('/bills')}
            color="bg-emerald-50 text-emerald-600"
          />
          <QuickAction
            icon={<Smartphone size={24} />}
            label="Top Up"
            onClick={() => navigate('/topup')}
            color="bg-rose-50 text-rose-600"
          />
          <QuickAction
            icon={<CreditCard size={24} />}
            label="Cards"
            onClick={() => navigate('/cards')}
            color="bg-indigo-50 text-indigo-600"
          />
          <QuickAction
            icon={<Ticket size={24} />}
            label="Tickets"
            onClick={() => navigate('/tickets')}
            color="bg-orange-50 text-orange-600"
          />
          <QuickAction
            icon={<LineChart size={24} />}
            label="Invest"
            onClick={() => navigate('/invest')}
            color="bg-cyan-50 text-cyan-600"
          />
          <QuickAction
            icon={<Heart size={24} />}
            label="Zakat"
            onClick={() => navigate('/zakat')}
            color="bg-red-50 text-red-600"
          />
          <QuickAction
            icon={<Car size={24} />}
            label="Car Loan"
            onClick={() => navigate('/car-loan')}
            color="bg-emerald-50 text-emerald-600"
          />
          <QuickAction
            icon={<Banknote size={24} />}
            label="Loans Hub"
            onClick={() => navigate('/loans-hub')}
            color="bg-blue-50 text-blue-600"
          />
          <QuickAction
            icon={<GraduationCap size={24} />}
            label="Pay Fees"
            onClick={() => navigate('/pay-fees')}
            color="bg-purple-50 text-purple-600"
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
