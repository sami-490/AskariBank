import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SendMoneyPage from './components/SendMoneyPage';
import ReceiveMoneyPage from './components/ReceiveMoneyPage';
import MobileRechargePage from './components/MobileRechargePage';
import BillPaymentsPage from './components/BillPaymentsPage';
import TopUpPage from './components/TopUpPage';
import TransactionsPage from './components/TransactionsPage';
import WalletPage from './components/WalletPage';
import CardsPage from './components/CardsPage';
import SettingsPage from './components/SettingsPage';
import TicketsPage from './components/TicketsPage';
import InvestPage from './components/InvestPage';
import ZakatPage from './components/ZakatPage';
import AdminDashboard from './components/AdminDashboard';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login';
import Signup from './components/Signup';
import CarLoanPage from './components/CarLoanPage';
import LoansHubPage from './components/LoansHubPage';
import PayFeesPage from './components/PayFeesPage';
import { Menu } from 'lucide-react';
import axios from 'axios';

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const WARNING_BEFORE = 30 * 1000; // Show warning 30 seconds before logout

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoutWarning, setLogoutWarning] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(30);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  // Auto-logout due to inactivity
  const performAutoLogout = useCallback(() => {
    setLogoutWarning(false);
    setLogoutCountdown(30);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (!localStorage.getItem('token')) return; // Only track when logged in

    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setLogoutWarning(false);
    setLogoutCountdown(30);

    // Set warning timer (fires 30s before logout)
    warningTimerRef.current = setTimeout(() => {
      setLogoutWarning(true);
      setLogoutCountdown(30);
      countdownIntervalRef.current = setInterval(() => {
        setLogoutCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    // Set actual logout timer
    inactivityTimerRef.current = setTimeout(() => {
      performAutoLogout();
    }, INACTIVITY_TIMEOUT);
  }, [performAutoLogout]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach(event =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden — record time
        hiddenAtRef.current = Date.now();
      } else {
        // Tab became visible again — check how long it was hidden
        if (hiddenAtRef.current) {
          const hiddenDuration = Date.now() - hiddenAtRef.current;
          hiddenAtRef.current = null;
          if (hiddenDuration >= INACTIVITY_TIMEOUT) {
            performAutoLogout();
            return;
          }
        }
        resetInactivityTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the timer
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, resetInactivityTimer, performAutoLogout]);

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const theme = user?.settings?.theme || 'system';

    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [user?.settings?.theme]);

  useEffect(() => {
    const path = window.location.pathname.split('/')[1];
    if (path && ['dashboard', 'transactions', 'wallet', 'cards', 'settings', 'tickets', 'zakat', 'invest', 'car-loan', 'loans-hub', 'pay-fees'].includes(path)) {
      setActiveTab(path);
    }
  }, [window.location.pathname]);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setLogoutWarning(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse text-[#0A3D73] dark:text-blue-500 font-bold">
          Initializing AskariBank Secure Session...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-[#0F172A] dark:text-slate-100 transition-colors duration-500">
      <Routes>
        {/* Public Routes */}
        {!user ? (
          <>
            <Route
              path="/login"
              element={
                <Login
                  onSignupClick={() => navigate('/signup')}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />
            <Route path="/signup" element={<Signup onLoginClick={() => navigate('/login')} />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Admin Routes */}
            {user.role === 'admin' && (
              <>
                <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} user={user} />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            )}

            {/* User App Layout */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col lg:flex-row min-h-screen">
                  {/* Mobile Header */}
                  <header className="lg:hidden h-16 bg-red-600 dark:bg-red-700 flex items-center justify-between px-6 sticky top-0 z-[40] shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <path d="M50 5 L 10 50 L 50 95" fill="#DC2626" />
                          <path d="M50 5 L 90 50 L 50 95" fill="#F87171" />
                        </svg>
                      </div>
                      <span className="text-white font-black tracking-tight">AskariBank</span>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                    >
                      <Menu size={24} />
                    </button>
                  </header>

                  <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={handleLogout}
                    user={user}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                  />
                  <main className="flex-1 lg:ml-72">
                    <Routes>
                      <Route
                        path="dashboard"
                        element={<Dashboard user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="send"
                        element={<SendMoneyPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route path="receive" element={<ReceiveMoneyPage user={user} />} />
                      <Route
                        path="recharge"
                        element={<MobileRechargePage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="bills"
                        element={<BillPaymentsPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="topup"
                        element={<TopUpPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route path="transactions" element={<TransactionsPage user={user} />} />
                      <Route
                        path="wallet"
                        element={<WalletPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="cards"
                        element={<CardsPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="settings"
                        element={<SettingsPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="tickets"
                        element={<TicketsPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="zakat"
                        element={<ZakatPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="invest"
                        element={<InvestPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="car-loan"
                        element={<CarLoanPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="loans-hub"
                        element={<LoansHubPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route
                        path="pay-fees"
                        element={<PayFeesPage user={user} refreshUser={refreshUser} />}
                      />
                      <Route path="/" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </>
        )}
      </Routes>

      {/* Auto-Logout Warning Toast */}
      {logoutWarning && user && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-bounce">
          <div className="bg-red-600 dark:bg-red-700 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-red-500/40 flex items-center gap-5 border border-red-400/30 backdrop-blur-xl max-w-lg">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-black text-sm tracking-tight">Session Expiring</p>
              <p className="text-xs text-red-100 mt-0.5">
                Auto-logout in <span className="font-black text-white text-base">{logoutCountdown}s</span> due to inactivity
              </p>
            </div>
            <button
              onClick={() => resetInactivityTimer()}
              className="bg-white text-red-600 font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-red-50 active:scale-95 transition-all shrink-0 shadow-lg"
            >
              Stay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
