import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Activity,
  DollarSign,
  ShieldAlert,
  Search,
  LogOut,
  Trash2,
  Plus,
  Check,
  X,
  Lock,
  TrendingUp,
  HardDrive,
  Download,
  BookOpen,
  Heart,
  Coins,
  AlertTriangle,
  MessageSquare,
  Percent,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface AdminDashboardProps {
  onLogout?: () => void;
  user?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [zakatMetrics, setZakatMetrics] = useState<any>({
    totalZakatCollected: 0,
    totalDisbursed: 0,
    remainingBalance: 0,
    contributions: [],
    disbursements: []
  });
  const [goldVault, setGoldVault] = useState<any>({
    totalAllocatedGrams: 0,
    goldHoldings: [],
    goldSpread: { buyPrice: 12500, sellPrice: 12700 },
    vaultAuditLogs: []
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Search & Filter state
  const [userSearch, setUserSearch] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [txnSearch, setTxnSearch] = useState<string>('');
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>('all');

  // Modals & Action Forms
  const [showCreateUser, setShowCreateUser] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    balance: '0',
    role: 'user'
  });

  const [adjustingUser, setAdjustingUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [showBlockModal, setShowBlockModal] = useState<any | null>(null);
  const [blockDuration, setBlockDuration] = useState<number>(300000);
  const [blockType, setBlockType] = useState<'temporary' | 'permanent'>('temporary');

  const [managingCardsUser, setManagingCardsUser] = useState<any | null>(null);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);

  const [reviewLoan, setReviewLoan] = useState<any | null>(null);
  const [loanFeedback, setLoanFeedback] = useState<string>('');

  const [showAddInst, setShowAddInst] = useState<boolean>(false);
  const [newInstForm, setNewInstForm] = useState({
    name: '',
    merchantCode: '',
    category: 'Education'
  });

  const [disburseZakatForm, setDisburseZakatForm] = useState({
    org: 'Saylani Welfare Trust',
    amount: '',
    remarks: ''
  });

  const [goldBuyPrice, setGoldBuyPrice] = useState<number>(12500);
  const [goldSellPrice, setGoldSellPrice] = useState<number>(12700);

  const [replyTicket, setReplyTicket] = useState<any | null>(null);
  const [replyMsg, setReplyMsg] = useState<string>('');

  // Interest Rates State
  const [interestRates, setInterestRates] = useState({
    carLoan: 8.5,
    personalLoan: 12.0,
    businessLoan: 10.5
  });

  // Current Admin Session Data
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [newPassword, setNewPassword] = useState<string>('');
  const [passStrengthError, setPassStrengthError] = useState<string>('');

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/admin/users`, config),
        axios.get(`${API_URL}/admin/transactions`, config),
        axios.get(`${API_URL}/admin/loans`, config),
        axios.get(`${API_URL}/admin/institutions`, config),
        axios.get(`${API_URL}/admin/zakat`, config),
        axios.get(`${API_URL}/admin/gold`, config),
        axios.get(`${API_URL}/admin/tickets`, config),
        axios.get(`${API_URL}/admin/security-logs`, config)
      ]);

      const getValue = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? r.value : null;

      const usersRes = getValue(results[0]);
      const transRes = getValue(results[1]);
      const loansRes = getValue(results[2]);
      const instRes = getValue(results[3]);
      const zakatRes = getValue(results[4]);
      const goldRes = getValue(results[5]);
      const ticketsRes = getValue(results[6]);
      const secLogsRes = getValue(results[7]);

      setUsers(usersRes?.data?.data || []);
      setTransactions(transRes?.data?.data || []);
      setLoans(loansRes?.data?.data || []);
      setInstitutions(instRes?.data?.data || []);
      setZakatMetrics(zakatRes?.data?.data || zakatMetrics);
      setGoldVault(goldRes?.data?.data || goldVault);
      setGoldBuyPrice(goldRes?.data?.data?.goldSpread?.buyPrice || 12500);
      setGoldSellPrice(goldRes?.data?.data?.goldSpread?.sellPrice || 12700);
      setTickets(ticketsRes?.data?.data || []);
      setSecurityLogs(secLogsRes?.data?.data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch global security system telemetry.');
      setLoading(false);
    }
  };

  // ── Action Handlers ────────────────────────────────────────────────────────

  const triggerNotify = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassStrengthError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/change-password`, { password: newPassword }, config);
      
      const updatedUser = { ...currentUser, isFirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      triggerNotify('Default password changed successfully! Security compliance cleared.');
    } catch (err: any) {
      setPassStrengthError(err.response?.data?.message || 'Failed to update administrative password.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/admin/users`, newUserForm, config);
      setUsers([res.data.data, ...users]);
      setShowCreateUser(false);
      setNewUserForm({ name: '', email: '', phone: '', password: '', balance: '0', role: 'user' });
      triggerNotify('New AskariBank user profile generated successfully.');
    } catch (err: any) {
      triggerNotify(err.response?.data?.message || 'Failed to register profile.', false);
    }
  };

  const handleBlockUser = async (userId: string, type: 'temporary' | 'permanent', duration?: number) => {
    try {
      const res = await axios.post(`${API_URL}/admin/users/${userId}/block`, { type, duration }, config);
      const updatedUser = res.data.data;
      setUsers(users.map(u => (u._id === userId || u.id === userId) ? updatedUser : u));
      triggerNotify(`User successfully blocked (${type === 'temporary' ? 'Temporary' : 'Permanent'}).`);
      setShowBlockModal(null);
    } catch (err: any) {
      triggerNotify(err.response?.data?.message || 'Failed to block user.', false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const res = await axios.post(`${API_URL}/admin/users/${userId}/unblock`, {}, config);
      const updatedUser = res.data.data;
      setUsers(users.map(u => (u._id === userId || u.id === userId) ? updatedUser : u));
      triggerNotify('User unblocked successfully.');
    } catch (err: any) {
      triggerNotify(err.response?.data?.message || 'Failed to unblock user.', false);
    }
  };

  const handleOpenCardsManagement = async (user: any) => {
    setManagingCardsUser(user);
    setLoadingCards(true);
    setUserCards([]);
    try {
      const res = await axios.get(`${API_URL}/admin/users/${user._id || user.id}/cards`, config);
      setUserCards(res.data || []);
    } catch (err) {
      triggerNotify('Failed to load user cards.', false);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleBlockCard = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to permanently block this card? This action is irreversible.')) return;
    try {
      await axios.post(`${API_URL}/cards/${cardId}/block`, {}, config);
      setUserCards(userCards.map(c => (c._id === cardId || c.id === cardId) ? { ...c, status: 'blocked' } : c));
      triggerNotify('Card permanently blocked successfully.');
    } catch (err) {
      triggerNotify('Failed to block card.', false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    try {
      const res = await axios.post(
        `${API_URL}/admin/users/${adjustingUser._id}/adjust-balance`,
        { amount: adjustAmount, reason: adjustReason },
        config
      );
      setUsers(users.map(u => u._id === adjustingUser._id ? res.data.data : u));
      setAdjustingUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      triggerNotify('User balance adjusted and audit log recorded.');
      fetchData(); // reload transactions log
    } catch (err: any) {
      triggerNotify('Failed to execute balance adjustment.', false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user profile? All transactions and card access will be revoked.')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, config);
      setUsers(users.filter(u => u._id !== userId && u.id !== userId));
      triggerNotify('User profile deleted.');
    } catch (err: any) {
      triggerNotify('Could not delete profile.', false);
    }
  };

  const handleReverseTxn = async (txnId: string) => {
    if (!window.confirm('Execute core reversal? Funds will be re-credited/debited from user accounts.')) return;
    try {
      await axios.post(`${API_URL}/admin/transactions/${txnId}/reverse`, {}, config);
      triggerNotify('Transaction reversed. Audits generated.');
      fetchData();
    } catch (err: any) {
      triggerNotify(err.response?.data?.message || 'Could not reverse transaction.', false);
    }
  };

  const handleProcessLoan = async (loanId: string, status: 'approved' | 'rejected') => {
    try {
      await axios.post(`${API_URL}/admin/loans/${loanId}/status`, { status, remarks: loanFeedback }, config);
      triggerNotify(`Loan request successfully ${status.toUpperCase()}.`);
      setReviewLoan(null);
      setLoanFeedback('');
      fetchData();
    } catch (err: any) {
      triggerNotify('Failed to evaluate loan application.', false);
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/admin/institutions`, newInstForm, config);
      setInstitutions([...institutions, res.data.data]);
      setShowAddInst(false);
      setNewInstForm({ name: '', merchantCode: '', category: 'Education' });
      triggerNotify('Fee merchant partner approved.');
    } catch (err: any) {
      triggerNotify(err.response?.data?.message || 'Failed to link merchant.', false);
    }
  };

  const handleDisburseZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/zakat/disburse`, {
        organizationName: disburseZakatForm.org,
        amount: disburseZakatForm.amount,
        remarks: disburseZakatForm.remarks
      }, config);
      triggerNotify(`Disbursed Rs. ${Number(disburseZakatForm.amount).toLocaleString()} Zakat funds to ${disburseZakatForm.org}`);
      setDisburseZakatForm({ org: 'Saylani Welfare Trust', amount: '', remarks: '' });
      fetchData();
    } catch (err: any) {
      triggerNotify('Disbursement failed: Insufficient funds in Zakat reserve.', false);
    }
  };

  const handleUpdateGoldSpreads = async () => {
    try {
      await axios.post(`${API_URL}/admin/gold/pricing`, { buyPrice: goldBuyPrice, sellPrice: goldSellPrice }, config);
      triggerNotify('Gold prices updated.');
      fetchData();
    } catch (err: any) {
      triggerNotify('Failed to adjust pricing grids.', false);
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicket) return;
    try {
      await axios.post(`${API_URL}/api/admin/tickets/${replyTicket._id}/reply`, { message: replyMsg }, config);
      // Fallback fallback to local api endpoint if router issues
      triggerNotify('Response dispatched. Support ticket marked as RESOLVED.');
      setReplyTicket(null);
      setReplyMsg('');
      fetchData();
    } catch (err: any) {
      // Local fallback in case custom reply endpoint mounts slightly differently
      try {
        await axios.post(`${API_URL}/admin/tickets/${replyTicket._id}/reply`, { message: replyMsg }, config);
        triggerNotify('Response dispatched. Support ticket marked as RESOLVED.');
        setReplyTicket(null);
        setReplyMsg('');
        fetchData();
      } catch (nestedErr) {
        triggerNotify('Failed to post reply.', false);
      }
    }
  };

  const exportCSV = (type: 'users' | 'transactions') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'users') {
      csvContent += "ID,Name,Email,Account Number,Balance,Role,Status,Joined\n";
      users.forEach(u => {
        csvContent += `"${u._id}","${u.name}","${u.email}","${u.accountNumber}",${u.balance},"${u.role}","${u.status}","${u.createdAt}"\n`;
      });
    } else {
      csvContent += "Transaction ID,User Email,Type,Amount,Recipient,Date,Status\n";
      transactions.forEach(t => {
        csvContent += `"${t.transactionId}","${t.userEmail}","${t.type}",${t.amount},"${t.recipient}","${t.date}","${t.status}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `askaribank_${type}_audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Calculation Utilities ──────────────────────────────────────────────────

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0),
    totalTransactions: transactions.length,
    revenue: transactions.filter(t => t.recipient?.includes('Fee') || t.targetType === 'fees').reduce((acc, t) => acc + t.amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 gap-4">
        <Activity className="animate-spin text-5xl" />
        <span className="font-mono tracking-widest text-xs uppercase text-slate-400 animate-pulse">
          Accessing AskariBank Secure Admin Core Nodes...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-['Inter'] relative">
      
      {/* ── FORCED DEFAULT PASSWORD RESET MODAL ── */}
      {currentUser?.isFirstLogin && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[999] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/20 rounded-[40px] p-10 shadow-2xl relative">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <Lock className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mb-2">First Time Admin Login</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Platform security protocol requires you to update the default credential <code className="bg-slate-800 text-red-400 px-2 py-0.5 rounded text-[10px] font-mono">Admin123!</code> immediately to activate the command features.
            </p>

            {passStrengthError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {passStrengthError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose High-Entropy Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-red-500 focus:bg-slate-900 rounded-2xl p-4 font-bold outline-none text-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/10 uppercase tracking-widest text-xs transition-all active:scale-95"
              >
                Establish Compliance & Activate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-80 bg-slate-900/60 border-r border-slate-800/80 p-8 flex flex-col justify-between hidden lg:flex">
        <div className="space-y-12">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center p-2">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <path d="M50 5 L 10 50 L 50 95" fill="#06B6D4" />
                <path d="M50 5 L 90 50 L 50 95" fill="#3B82F6" />
              </svg>
            </div>
            <div>
              <span className="text-white font-black tracking-tight text-xl block">AskariBank</span>
              <span className="text-cyan-400 font-mono tracking-widest text-[9px] uppercase">Command Center</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {[
              { id: 'analytics', label: 'Analytics & Health', icon: <Activity size={18} /> },
              { id: 'users', label: 'User Directory', icon: <Users size={18} /> },
              { id: 'transactions', label: 'Global Ledger', icon: <TrendingUp size={18} /> },
              { id: 'loans', label: 'Loan Processing', icon: <Percent size={18} /> },
              { id: 'fees', label: 'Fee Partners', icon: <BookOpen size={18} /> },
              { id: 'zakat', label: 'Zakat Pools', icon: <Heart size={18} /> },
              { id: 'gold', label: 'Gold Backing', icon: <Coins size={18} /> },
              { id: 'security', label: 'Security & Support', icon: <ShieldAlert size={18} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Admin Section */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
              A
            </div>
            <div>
              <div className="text-sm font-black text-white">{currentUser?.name || 'System Admin'}</div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Level 1 Administrator</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl border border-red-500/20 text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        
        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-3xl mb-8 flex items-center gap-3 text-xs font-bold animate-bounce">
            <Check size={18} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-3xl mb-8 flex items-center gap-3 text-xs font-bold">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* Header Ticker */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Platform Command Center
            </h1>
            <p className="text-slate-400 text-xs mt-1">Platform operations, system compliance audits, and asset backing metrics.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchData}
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-cyan-400 text-slate-400 transition-all flex items-center justify-center"
              title="Refresh Core Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}

        {/* TAB 1: ANALYTICS & MONITORING */}
        {activeTab === 'analytics' && (
          <div className="space-y-10">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Users className="text-cyan-400" />} label="Registered Profiles" value={stats.totalUsers} />
              <StatCard icon={<DollarSign className="text-emerald-400" />} label="Global Deposits" value={`Rs. ${stats.totalBalance.toLocaleString()}`} />
              <StatCard icon={<Activity className="text-blue-400" />} label="Transactions Run" value={stats.totalTransactions} />
              <StatCard icon={<Percent className="text-purple-400" />} label="Card / Fee Revenues" value={`Rs. ${stats.revenue.toLocaleString()}`} />
            </div>

            {/* Visual SVGs Transaction Chart */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Operational Load</h3>
                  <p className="text-slate-500 text-xs">Real-time ledger events handled.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-3 py-1 rounded-full">
                  <TrendingUp size={14} /> LIVE TELEMETRY
                </div>
              </div>

              {/* Custom SVG Line Graph */}
              <div className="w-full h-64 bg-slate-950/40 rounded-2xl relative flex items-center justify-center border border-slate-900">
                <svg viewBox="0 0 500 200" className="w-full h-full p-4">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="5,5" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="5,5" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="5,5" />
                  {/* Visual Gradient Area */}
                  <path d="M 0 170 Q 100 80, 200 120 T 400 60 L 500 100 L 500 200 L 0 200 Z" fill="url(#chartGrad)" />
                  {/* Line */}
                  <path d="M 0 170 Q 100 80, 200 120 T 400 60 L 500 100" fill="none" stroke="#06B6D4" strokeWidth="3" />
                  {/* Dot Markers */}
                  <circle cx="200" cy="120" r="5" fill="#3B82F6" stroke="#020617" strokeWidth="2" />
                  <circle cx="400" cy="60" r="5" fill="#06B6D4" stroke="#020617" strokeWidth="2" />
                  <circle cx="500" cy="100" r="5" fill="#06B6D4" stroke="#020617" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Health Ticker Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* System Resource Indicators */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <HardDrive size={16} className="text-cyan-400" /> Administrative Node Metrics
                </h3>
                <div className="space-y-4">
                  <ResourceBar label="API Response Time" value="12ms" pct={15} color="bg-cyan-500" />
                  <ResourceBar label="Active Database Storage" value="1.2 MB / 500 MB limit" pct={2} color="bg-emerald-500" />
                  <ResourceBar label="System Engine Uptime" value="99.98% / 100%" pct={99.98} color="bg-blue-500" />
                  <ResourceBar label="Memory Stack Alloc" value="34.2% load" pct={34.2} color="bg-purple-500" />
                </div>
              </div>

              {/* Data Export Console */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Download size={16} className="text-purple-400" /> Export System Audits
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instantly package and generate local system tables in standard GFM RFC 4180 CSV specifications for compliance review.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => exportCSV('users')}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-bold text-xs transition-all active:scale-95 border border-slate-700"
                  >
                    <Users size={14} className="text-cyan-400" /> Export Profiles CSV
                  </button>
                  <button
                    onClick={() => exportCSV('transactions')}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-bold text-xs transition-all active:scale-95 border border-slate-700"
                  >
                    <TrendingUp size={14} className="text-purple-400" /> Export Ledger CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER PROFILE MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="text-cyan-400" /> User Administration Registry
                </h3>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-4 rounded-2xl text-xs transition-all active:scale-95"
                >
                  <Plus size={16} /> Link New Account
                </button>
              </div>

              {/* Filters Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search name, email, account..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none transition-all"
                  />
                </div>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-4 text-xs font-bold text-slate-400 outline-none transition-all"
                >
                  <option value="all">Display All Account States</option>
                  <option value="active">Active Only</option>
                  <option value="frozen">Frozen Only</option>
                </select>
              </div>

              {/* Users Directory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      <th className="pb-4">Holder</th>
                      <th className="pb-4">Account Number</th>
                      <th className="pb-4">Balance</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Compliance Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-bold text-xs">
                    {users
                      .filter(u => {
                        const matchQ = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                       u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                       u.accountNumber?.includes(userSearch);
                        const matchS = userStatusFilter === 'all' || u.status === userStatusFilter;
                        return matchQ && matchS;
                      })
                      .map(u => (
                        <tr key={u._id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black">
                                {u.name?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-black">{u.name}</div>
                                <div className="text-[10px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-mono text-slate-400">{u.accountNumber}</td>
                          <td className="py-4 text-emerald-400">Rs. {Number(u.balance || 0).toLocaleString()}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase font-black ${
                              u.status === 'blocked'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : u.status === 'temp_blocked'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {u.status === 'blocked' ? 'Blocked (Perm)' : u.status === 'temp_blocked' ? 'Blocked (Temp)' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {u.role !== 'admin' && (
                              <>
                                {(u.status === 'blocked' || u.status === 'temp_blocked') ? (
                                  <button
                                    onClick={() => handleUnblockUser(u._id || u.id)}
                                    className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-2 rounded-xl text-[10px] transition-all border border-emerald-500/10"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setShowBlockModal(u)}
                                    className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-3 py-2 rounded-xl text-[10px] transition-all border border-red-500/10"
                                  >
                                    Block
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenCardsManagement(u)}
                                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl text-[10px] transition-all border border-blue-500/20"
                                >
                                  Cards
                                </button>
                                <button
                                  onClick={() => setAdjustingUser(u)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-[10px] transition-all border border-slate-700"
                                >
                                  Adjust
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id || u.id)}
                                  className="bg-red-600/10 hover:bg-red-600/20 text-red-500 p-2 rounded-xl border border-red-600/20 transition-all inline-flex items-center"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE USER MODAL */}
            {showCreateUser && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setShowCreateUser(false)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-6 text-white">Issue New Customer Account</h3>
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Full Name</label>
                        <input
                          type="text" required placeholder="Sami Ullah"
                          value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Email Address</label>
                        <input
                          type="email" required placeholder="sami@askaribank.com"
                          value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Phone Contact</label>
                        <input
                          type="text" placeholder="+92 300 1234567"
                          value={newUserForm.phone} onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Security Passphrase</label>
                        <input
                          type="password" required placeholder="••••••••"
                          value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Opening Balance (PKR)</label>
                        <input
                          type="number" required placeholder="50000"
                          value={newUserForm.balance} onChange={(e) => setNewUserForm({ ...newUserForm, balance: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Access Authorization Level</label>
                        <select
                          value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none text-slate-400"
                        >
                          <option value="user">Standard User</option>
                          <option value="admin">System Administrator</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/10"
                    >
                      Verify and Activate Ledger Record
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ADJUST BALANCE MODAL */}
            {adjustingUser && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setAdjustingUser(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-1 text-white">Adjust Balance</h3>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-6 font-mono font-bold">Target Account: {adjustingUser.accountNumber}</p>
                  <form onSubmit={handleAdjustBalance} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Adjustment Value (PKR)</label>
                      <input
                        type="number" required placeholder="Use -amount to subtract"
                        value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Official Audit Reason</label>
                      <input
                        type="text" required placeholder="e.g. Compensation, Fee reversal"
                        value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/10"
                    >
                      Execute Double-Entry Adjustment
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* BLOCK USER MODAL */}
            {showBlockModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setShowBlockModal(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-1 text-white">Block Account</h3>
                  <p className="text-[10px] text-red-400 uppercase tracking-widest mb-6 font-mono font-bold">Target Account: {showBlockModal.name} ({showBlockModal.accountNumber})</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Block Policy</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setBlockType('temporary')}
                          className={`py-3.5 rounded-xl text-xs font-black transition-all border ${blockType === 'temporary' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}
                        >
                          Temporary
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlockType('permanent')}
                          className={`py-3.5 rounded-xl text-xs font-black transition-all border ${blockType === 'permanent' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}
                        >
                          Permanent
                        </button>
                      </div>
                    </div>

                    {blockType === 'temporary' && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest block">Block Duration</label>
                        <select
                          value={blockDuration}
                          onChange={(e) => setBlockDuration(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-xs font-bold outline-none text-slate-300"
                        >
                          <option value={300000}>5 Minutes (Testing)</option>
                          <option value={3600000}>1 Hour</option>
                          <option value={86400000}>24 Hours</option>
                          <option value={604800000}>7 Days</option>
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => handleBlockUser(showBlockModal._id || showBlockModal.id, blockType, blockType === 'temporary' ? blockDuration : undefined)}
                      className={`w-full font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                        blockType === 'permanent'
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/10'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                      }`}
                    >
                      {blockType === 'permanent' ? 'Authorize Permanent Ban' : 'Authorize Temporary Suspension'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE USER CARDS MODAL */}
            {managingCardsUser && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setManagingCardsUser(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-1 text-white">Cards Administration</h3>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-6 font-mono font-bold">User: {managingCardsUser.name}</p>
                  
                  {loadingCards ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Querying central vault...</span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
                      {userCards.length === 0 ? (
                        <p className="text-center text-slate-500 py-10 text-xs font-bold uppercase tracking-widest">No cards issued to this account.</p>
                      ) : (
                        userCards.map((card) => {
                          const isBlocked = card.status === 'blocked' || card.status === 'permanently_blocked';
                          const isFrozen = card.status === 'frozen';
                          return (
                            <div key={card._id || card.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white uppercase tracking-tight">{card.cardType || 'VISA GOLD'}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    isBlocked
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : isFrozen
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {card.status || 'Active'}
                                  </span>
                                </div>
                                <p className="text-xs font-mono text-slate-400 tracking-wider">
                                  •••• •••• •••• {card.cardNumber ? card.cardNumber.slice(-4) : '0000'}
                                </p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Exp: {card.expiry || '12/28'} | CVV: {card.cvv || '***'}</p>
                              </div>
                              <div className="w-full sm:w-auto">
                                {isBlocked ? (
                                  <span className="text-red-500 text-[10px] font-black uppercase tracking-widest block text-right">Blocked permanently</span>
                                ) : (
                                  <button
                                    onClick={() => handleBlockCard(card._id || card.id)}
                                    className="w-full sm:w-auto bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                  >
                                    Block Card
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: GLOBAL TRANSACTION LEDGER & AUDIT */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" /> Platform Transaction Ledger
                </h3>
                <p className="text-slate-500 text-xs mt-1">Universal transaction history with state-reversal features.</p>
              </div>
            </div>

            {/* Filter Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search sender, recipient, txn ID..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none transition-all"
                />
              </div>
              <select
                value={txnTypeFilter}
                onChange={(e) => setTxnTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-4 text-xs font-bold text-slate-400 outline-none transition-all"
              >
                <option value="all">Display All Actions Types</option>
                <option value="send">Transfer Outflow</option>
                <option value="receive">Transfer Inflow</option>
                <option value="purchase">Card / Fee Purchases</option>
              </select>
            </div>

            {/* Transaction Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="pb-4">Transaction ID</th>
                    <th className="pb-4">Initiator Profile</th>
                    <th className="pb-4">Action Type</th>
                    <th className="pb-4">Destination Merchant</th>
                    <th className="pb-4">Value</th>
                    <th className="pb-4">Execution Date</th>
                    <th className="pb-4">Audit State</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-bold text-xs">
                  {transactions
                    .filter(t => {
                      const matchQ = t.transactionId?.toLowerCase().includes(txnSearch.toLowerCase()) ||
                                     t.userEmail?.toLowerCase().includes(txnSearch.toLowerCase()) ||
                                     t.recipient?.toLowerCase().includes(txnSearch.toLowerCase());
                      const matchT = txnTypeFilter === 'all' || t.type === txnTypeFilter;
                      return matchQ && matchT;
                    })
                    .map(t => (
                      <tr key={t._id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 font-mono text-cyan-400 tracking-tight">{t.transactionId}</td>
                        <td className="py-4">
                          <div>
                            <div className="text-white font-black">{t.userName}</div>
                            <div className="text-[10px] text-slate-500">{t.userEmail}</div>
                          </div>
                        </td>
                        <td className="py-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'receive' ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-300 bg-slate-800'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">{t.recipient || 'Digital Vault Transfer'}</td>
                        <td className="py-4 text-white">Rs. {Number(t.amount || 0).toLocaleString()}</td>
                        <td className="py-4 text-slate-400 font-mono text-[10px]">{new Date(t.date).toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'reversed' ? 'text-red-400 bg-red-400/5 border border-red-500/10' : 'text-emerald-400 bg-emerald-400/5 border border-emerald-500/10'}`}>
                            {t.status || 'completed'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {t.status !== 'reversed' && (
                            <button
                              onClick={() => handleReverseTxn(t.transactionId || t._id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-xl text-[10px] transition-all border border-red-500/20"
                            >
                              Reverse Outlay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LOAN UNDERWRITING & PROCESSING */}
        {activeTab === 'loans' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Interest Rates Configurator */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Sliders size={16} className="text-cyan-400" /> Institutional Interest Rate Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-6 rounded-2xl space-y-4 border border-slate-900">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Car Loan Premium APR</span>
                    <span className="text-cyan-400 font-mono">{interestRates.carLoan}%</span>
                  </div>
                  <input
                    type="range" min="5" max="20" step="0.1"
                    value={interestRates.carLoan}
                    onChange={(e) => setInterestRates({ ...interestRates, carLoan: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
                  />
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl space-y-4 border border-slate-900">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Personal Emergency Loan APR</span>
                    <span className="text-purple-400 font-mono">{interestRates.personalLoan}%</span>
                  </div>
                  <input
                    type="range" min="8" max="25" step="0.1"
                    value={interestRates.personalLoan}
                    onChange={(e) => setInterestRates({ ...interestRates, personalLoan: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
                  />
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl space-y-4 border border-slate-900">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Corporate Commercial APR</span>
                    <span className="text-emerald-400 font-mono">{interestRates.businessLoan}%</span>
                  </div>
                  <input
                    type="range" min="7" max="18" step="0.1"
                    value={interestRates.businessLoan}
                    onChange={(e) => setInterestRates({ ...interestRates, businessLoan: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
                  />
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6">Underwriting Applications Review</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      <th className="pb-4">Applicant</th>
                      <th className="pb-4">Loan Type</th>
                      <th className="pb-4">Financing Amount</th>
                      <th className="pb-4">Tenure</th>
                      <th className="pb-4">Monthly Declarations</th>
                      <th className="pb-4">Application Date</th>
                      <th className="pb-4">Evaluation State</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-bold text-xs">
                    {loans.map(l => (
                      <tr key={l._id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-4">
                          <div>
                            <div className="text-white font-black">{l.userName}</div>
                            <div className="text-[10px] text-slate-500">{l.userEmail}</div>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-cyan-400">{l.loanType}</td>
                        <td className="py-4 text-white">Rs. {l.amount?.toLocaleString()}</td>
                        <td className="py-4 text-slate-400">{l.tenureMonths} Months</td>
                        <td className="py-4 text-emerald-400">Rs. {l.incomeMonthly?.toLocaleString()} /mo</td>
                        <td className="py-4 text-slate-400 font-mono text-[10px]">{new Date(l.dateApplied).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l.status === 'approved' ? 'text-emerald-400 bg-emerald-400/5 border border-emerald-500/10' :
                            l.status === 'rejected' ? 'text-red-400 bg-red-400/5 border border-red-500/10' : 'text-yellow-400 bg-yellow-400/5 border border-yellow-500/10'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {l.status === 'pending' && (
                            <button
                              onClick={() => setReviewLoan(l)}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-xl text-[10px] transition-all"
                            >
                              Evaluate Underwriting
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EVALUATE UNDERWRITING MODAL */}
            {reviewLoan && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setReviewLoan(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-1 text-white">Review Loan Underwriting</h3>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-6 font-mono font-bold">Applicant ID: {reviewLoan.userName}</p>
                  
                  <div className="bg-slate-950 p-5 rounded-2xl space-y-4 mb-6 border border-slate-900 text-xs font-bold">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Monthly Revenue Inflow:</span>
                      <span className="text-emerald-400">Rs. {reviewLoan.incomeMonthly?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Requested Principal:</span>
                      <span className="text-white">Rs. {reviewLoan.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Financing Tenure:</span>
                      <span className="text-slate-300">{reviewLoan.tenureMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Reason/Remarks:</span>
                      <p className="text-slate-500 font-medium italic text-[11px] leading-relaxed">"{reviewLoan.remarks}"</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Administrative Evaluation Verdict</label>
                      <input
                        type="text" required placeholder="Add feedback e.g. Credit score validated, approved."
                        value={loanFeedback} onChange={(e) => setLoanFeedback(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleProcessLoan(reviewLoan._id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        Approve Financing
                      </button>
                      <button
                        onClick={() => handleProcessLoan(reviewLoan._id, 'rejected')}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: INSTITUTIONAL FEE PORTAL MANAGEMENT */}
        {activeTab === 'fees' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-cyan-400" /> Partnered Educational Institutions
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Platform payment clearance settlement desk.</p>
                </div>
                <button
                  onClick={() => setShowAddInst(true)}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-4 rounded-2xl text-xs transition-all active:scale-95"
                >
                  <Plus size={16} /> Link New Partner
                </button>
              </div>

              {/* Institutions Listing */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      <th className="pb-4">Partner Name</th>
                      <th className="pb-4">Merchant Code</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Total Collections</th>
                      <th className="pb-4">Settled Funds</th>
                      <th className="pb-4">Pending Settlement</th>
                      <th className="pb-4 text-right">Settlement Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-bold text-xs">
                    {institutions.map(i => (
                      <tr key={i._id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                              {i.name?.charAt(0)}
                            </div>
                            <span className="text-white font-black">{i.name}</span>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-cyan-400">{i.merchantCode}</td>
                        <td className="py-4 text-slate-400">{i.category}</td>
                        <td className="py-4 text-white">Rs. {i.totalCollected?.toLocaleString()}</td>
                        <td className="py-4 text-emerald-400">Rs. {i.settledAmount?.toLocaleString()}</td>
                        <td className="py-4 text-yellow-400">Rs. {i.pendingSettlement?.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          {i.pendingSettlement > 0 && (
                            <button
                              onClick={() => {
                                i.settledAmount += i.pendingSettlement;
                                i.pendingSettlement = 0;
                                setInstitutions([...institutions]);
                                triggerNotify(`Settled collections for ${i.name}. Funds dispatched to partner bank account.`);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-[10px] border border-slate-700 transition-all"
                            >
                              Settle collections
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD INSTITUTION MODAL */}
            {showAddInst && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setShowAddInst(false)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-6 text-white">Establish Institutional Merchant Partner</h3>
                  <form onSubmit={handleAddInstitution} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Partner Institution Title</label>
                      <input
                        type="text" required placeholder="e.g.FAST NUCES, FAST Lahore"
                        value={newInstForm.name} onChange={(e) => setNewInstForm({ ...newInstForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Unique Billing Merchant Code</label>
                      <input
                        type="text" required placeholder="e.g. MERCH-FAST-88"
                        value={newInstForm.merchantCode} onChange={(e) => setNewInstForm({ ...newInstForm, merchantCode: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Billing Category</label>
                      <select
                        value={newInstForm.category} onChange={(e) => setNewInstForm({ ...newInstForm, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs font-bold outline-none text-slate-400"
                      >
                        <option value="Education">Education & Universities</option>
                        <option value="BISE Board">BISE Matric/FSc Boards</option>
                        <option value="Testing Agency">NTS/ETC Testing Agencies</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/10"
                    >
                      Authorize Partner Merchant
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ZAKAT & CHARITY FUND DISTRIBUTION */}
        {activeTab === 'zakat' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Live Monitor cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl -mr-8 -mt-8" />
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Total Zakat Contributions</h4>
                <div className="text-3xl font-black text-white">Rs. {zakatMetrics.totalZakatCollected?.toLocaleString()}</div>
                <p className="text-[10px] text-slate-500 mt-2">Deducted and contributed by users.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl -mr-8 -mt-8" />
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Total Funds Disbursed</h4>
                <div className="text-3xl font-black text-purple-400">Rs. {zakatMetrics.totalDisbursed?.toLocaleString()}</div>
                <p className="text-[10px] text-slate-500 mt-2">Allocated to welfare organizations.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8" />
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Active Net reserves pool</h4>
                <div className="text-3xl font-black text-emerald-400">Rs. {zakatMetrics.remainingBalance?.toLocaleString()}</div>
                <p className="text-[10px] text-slate-500 mt-2">Available for immediate welfare dispersal.</p>
              </div>
            </div>

            {/* Fund Disbursal Console */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Disbursement Form */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl h-fit">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Heart size={16} className="text-red-400" /> Disburse Charity Funds
                </h3>
                <form onSubmit={handleDisburseZakat} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Welfare Organization</label>
                    <select
                      value={disburseZakatForm.org} onChange={(e) => setDisburseZakatForm({ ...disburseZakatForm, org: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs font-bold outline-none text-slate-300"
                    >
                      <option value="Saylani Welfare Trust">Saylani Welfare Trust</option>
                      <option value="Edhi Foundation">Edhi Foundation</option>
                      <option value="Shaukat Khanum Cancer Hospital">Shaukat Khanum Cancer Hospital</option>
                      <option value="Indus Hospital Network">Indus Hospital Network</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Disbursal Amount (PKR)</label>
                    <input
                      type="number" required placeholder="e.g. 100000"
                      value={disburseZakatForm.amount} onChange={(e) => setDisburseZakatForm({ ...disburseZakatForm, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Internal Audit Remarks</label>
                    <input
                      type="text" required placeholder="Disbursal for medical/ration sponsorship"
                      value={disburseZakatForm.remarks} onChange={(e) => setDisburseZakatForm({ ...disburseZakatForm, remarks: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs font-bold outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/10"
                  >
                    Execute Disbursal Outflow
                  </button>
                </form>
              </div>

              {/* History and contributions */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Activity size={16} className="text-cyan-400" /> Welfare Ledger logs
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {zakatMetrics.disbursements?.map((d: any) => (
                    <div key={d._id} className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex justify-between items-center text-xs font-bold">
                      <div className="space-y-1">
                        <div className="text-white">{d.organization}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{d.timestamp ? new Date(d.timestamp).toLocaleString() : 'N/A'}</div>
                        <p className="text-[10px] text-slate-400 font-medium">{d.details}</p>
                      </div>
                      <div className="text-red-400">- Rs. {d.amount?.toLocaleString()}</div>
                    </div>
                  ))}
                  {zakatMetrics.disbursements?.length === 0 && (
                    <div className="text-center py-8 text-slate-500 italic">No welfare disbursals logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DIGITAL GOLD BACKING & VAULT LOGISTICS */}
        {activeTab === 'gold' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Reserves ratios visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Backing Gauge Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Physical Gold Backing Reserve Ratio</h4>
                  <div className="text-5xl font-black text-cyan-400">100%</div>
                  <div className="text-[10px] text-emerald-400 font-bold bg-emerald-400/5 border border-emerald-500/10 px-2 py-0.5 rounded-full w-fit mt-1">
                    FULLY COLLATERALIZED
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-4">
                    Physical gold bullions are securely audited inside the AskariBank Vault Logistics Depot matching 1:1 user holdings of <span className="text-white font-bold">{goldVault.totalAllocatedGrams?.toFixed(2)} grams</span> of digital asset.
                  </p>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 mt-6">
                  <div className="bg-cyan-500 h-full rounded-full w-full shadow-lg shadow-cyan-500/20" />
                </div>
              </div>

              {/* Price Spreads Sliders */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-between lg:col-span-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Coins size={16} className="text-amber-500" /> live digital gold pricing manager (PKR/gram)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400">Gold Buy Price</span>
                        <span className="text-cyan-400 font-mono">Rs. {goldBuyPrice?.toLocaleString()}</span>
                      </div>
                      <input
                        type="range" min="10000" max="18000" step="10"
                        value={goldBuyPrice}
                        onChange={(e) => setGoldBuyPrice(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
                      />
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400">Gold Sell Price</span>
                        <span className="text-purple-400 font-mono">Rs. {goldSellPrice?.toLocaleString()}</span>
                      </div>
                      <input
                        type="range" min="10000" max="18000" step="10"
                        value={goldSellPrice}
                        onChange={(e) => setGoldSellPrice(Number(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateGoldSpreads}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/10 mt-6"
                >
                  Adjust Spreads & Broadcast Live Pricing
                </button>
              </div>

            </div>

            {/* Logistics Vault Audit Logs */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <HardDrive size={16} className="text-cyan-400" /> Physical Audit Logs
              </h3>
              <div className="space-y-4">
                {goldVault.vaultAuditLogs?.map((log: any) => (
                  <div key={log._id} className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex justify-between items-center text-xs font-bold">
                    <div className="space-y-1">
                      <div className="text-white">{log.details}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                    <span className="text-cyan-400 font-mono bg-cyan-400/5 px-3 py-1 rounded-lg border border-cyan-500/10">LOGISTICS_VERIFIED</span>
                  </div>
                ))}
                {goldVault.vaultAuditLogs?.length === 0 && (
                  <div className="text-center py-8 text-slate-500 italic">No gold physical logistics logs recorded yet. Adjust spreads above to generate logs.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SECURITY, SUPPORT & COMPLIANCE */}
        {activeTab === 'security' && (
          <div className="space-y-10 animate-fadeIn">
            
            {/* Support Tickets Console */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <MessageSquare size={16} className="text-cyan-400" /> customer support tickets desk
              </h3>
              
              <div className="space-y-4">
                {tickets.map(t => (
                  <div key={t._id} className="bg-slate-950 p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs font-bold">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-black text-sm">{t.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${t.status === 'resolved' ? 'text-emerald-400 bg-emerald-400/5' : 'text-yellow-400 bg-yellow-400/5'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">"{t.message}"</p>
                      <div className="text-[10px] text-slate-500">
                        From: <span className="text-slate-300">{t.userName}</span> ({t.userEmail}) | {new Date(t.createdAt).toLocaleString()}
                      </div>
                      {t.replies?.map((r: any, idx: number) => (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-2 font-medium">
                          <span className="text-cyan-400 font-bold block mb-1">Reply by {r.sender}:</span>
                          "{r.message}"
                        </div>
                      ))}
                    </div>

                    {t.status === 'pending' && (
                      <button
                        onClick={() => setReplyTicket(t)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-xl text-xs tracking-wider transition-all self-end md:self-center"
                      >
                        Dispatch Response
                      </button>
                    )}
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="text-center py-8 text-slate-500 italic">No customer tickets in query queue.</div>
                )}
              </div>
            </div>

            {/* Support Ticket Reply Modal */}
            {replyTicket && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative">
                  <button onClick={() => setReplyTicket(null)} className="absolute right-8 top-8 text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black mb-1 text-white">Post Ticket Response</h3>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-6 font-mono font-bold">Subject: {replyTicket.subject}</p>
                  
                  <form onSubmit={handleReplyTicket} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Compose message</label>
                      <textarea
                        required rows={4} placeholder="Type your response to the user here..."
                        value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs font-bold outline-none text-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/10"
                    >
                      Dispatch response & Resolve ticket
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Real-time System Security Logs */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <ShieldAlert size={16} className="text-red-500" /> compliance audit logs
              </h3>
              
              <div className="space-y-4">
                {securityLogs.map(log => (
                  <div key={log._id} className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex justify-between items-center text-xs font-bold">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                          log.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                          log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.severity || 'low'}
                        </span>
                        <span className="text-white font-black">{log.eventType}</span>
                      </div>
                      <p className="text-slate-400 font-medium">{log.details}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Target Account: {log.email} | Node Origin IP: {log.ipAddress || '127.0.0.1'}
                      </div>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: any; label: string; value: any }) => (
  <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-[32px] hover:border-slate-700 transition-all group flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-950 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

const ResourceBar = ({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-300 font-mono">{value}</span>
    </div>
    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-900">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

export default AdminDashboard;
