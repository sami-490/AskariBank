import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Settings as SettingsIcon,
  ShieldCheck,
  Fingerprint,
  Moon,
  Sun,
  Monitor,
  Camera,
  Mail,
  Phone,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Zap,
} from 'lucide-react';
import axios from 'axios';

const SubTabButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex md:flex-col items-center gap-4 md:gap-2 p-4 md:p-6 rounded-2xl md:rounded-[32px] transition-all duration-300 ${
      active
        ? 'bg-blue-50 text-[#0F172A] shadow-sm md:scale-[1.02]'
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
    }`}
  >
    <Icon size={24} className={active ? 'text-blue-600' : ''} />
    <span className="text-[10px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

const ToggleRow = ({ label, subtext, icon: Icon, active, onToggle, color }: any) => (
  <div 
    onClick={onToggle}
    className="flex items-center justify-between py-6 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-4 -mx-4 rounded-3xl transition-all"
  >
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} shadow-inner transition-transform group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-[#0F172A] dark:text-white text-lg">{label}</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{subtext}</p>
      </div>
    </div>
    <div
      className="w-14 h-8 rounded-full transition-all relative flex items-center px-1"
      style={{
        backgroundColor: active ? '#0F172A' : '#F1F5F9',
      }}
    >
      <motion.div
        animate={{ x: active ? 24 : 0 }}
        className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
      />
    </div>
  </div>
);

const InputField = ({ label, value, onChange, icon: Icon, type = "text", placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F172A] transition-colors" size={20} />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-16' : 'px-8'} py-5 rounded-[24px] border-2 border-slate-50 bg-slate-50/50 text-[#0F172A] font-bold outline-none focus:border-[#0F172A] focus:bg-white transition-all`}
      />
    </div>
  </div>
);

interface SettingsPageProps {
  user: any;
  refreshUser: () => void;
}

const SettingsPage = ({ user, refreshUser }: SettingsPageProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(user.settings?.appearance?.theme || 'system');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const [currency, setCurrency] = useState('Pakistani Rupee (PKR)');
  
  const [profileData, setProfileData] = useState({
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || '+92 300 1234567',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (user.settings?.theme) {
      setTheme(user.settings.theme);
    }
  }, [user.settings?.theme]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/profile', {
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.phone,
        avatar: avatarPreview
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      refreshUser();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (field: string, value: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/settings', { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshUser();
    } catch (err) {
      console.error('Failed to update setting');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-white dark:bg-[#0F172A] p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                  {avatarPreview || user.avatar ? (
                    <img src={avatarPreview || user.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <span className="text-4xl font-black text-[#0F172A] dark:text-white">{user.name?.[0]}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="flex-1 text-center md:text-left relative z-10">
                <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight mb-2">{user.name}</h2>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 md:mb-6">User Account • Premium Member</p>
                <button 
                  onClick={handleAvatarClick}
                  className="px-8 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800 space-y-8 md:space-y-10">
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-white">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="First Name" value={profileData.firstName} onChange={(v: string) => setProfileData({ ...profileData, firstName: v })} placeholder="Enter first name" />
                <InputField label="Last Name" value={profileData.lastName} onChange={(v: string) => setProfileData({ ...profileData, lastName: v })} placeholder="Enter last name" />
                <InputField label="Email Address" value={profileData.email} onChange={(v: string) => setProfileData({ ...profileData, email: v })} icon={Mail} />
                <InputField label="Phone Number" value={profileData.phone} onChange={(v: string) => setProfileData({ ...profileData, phone: v })} icon={Phone} />
              </div>
              <div className="flex justify-end items-center gap-6 pt-6">
                <button className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-sm hover:text-[#0F172A] dark:hover:text-white transition-colors">Cancel</button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="px-12 py-5 bg-[#0F172A] dark:bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-50 flex items-center gap-3"
                >
                  {loading ? 'Saving...' : success ? <><CheckCircle2 size={20} /> Saved</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0F172A] p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800">
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white mb-10">Password & Authentication</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] dark:text-white text-lg">Change Password</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">It's a good idea to use a strong password</p>
                  </div>
                </div>
                <button onClick={() => setIsPasswordModalOpen(true)} className="px-8 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-sm text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-tighter">Update</button>
              </div>
              <ToggleRow
                label="Biometric Login"
                subtext="Use fingerprint or Face ID to login"
                icon={Fingerprint}
                active={!!user.settings?.biometric_login}
                onToggle={() => handleToggleSetting('biometric_login', !user.settings?.biometric_login)}
                color="bg-blue-50 dark:bg-blue-500/10 text-blue-500"
              />
              <ToggleRow
                label="Two-Factor Authentication"
                subtext="Add an extra layer of security"
                icon={ShieldCheck}
                active={!!user.settings?.two_factor_auth}
                onToggle={() => handleToggleSetting('two_factor_auth', !user.settings?.two_factor_auth)}
                color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
              />
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0F172A] p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800">
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white mb-10">Notification Preferences</h3>
            <div className="space-y-2">
              <ToggleRow label="Email Notifications" subtext="Receive daily summary via email" icon={Mail} active={!!user.settings?.email_notifications} onToggle={() => handleToggleSetting('email_notifications', !user.settings?.email_notifications)} color="bg-blue-50 dark:bg-blue-500/10 text-blue-500" />
              <ToggleRow label="Push Notifications" subtext="Get instant alerts on your device" icon={Bell} active={!!user.settings?.push_notifications} onToggle={() => handleToggleSetting('push_notifications', !user.settings?.push_notifications)} color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" />
              <ToggleRow
                label="Transactions Alerts"
                subtext="Notify me for every transaction"
                icon={CreditCard}
                active={!!user.settings?.transaction_alerts}
                onToggle={() =>
                  handleToggleSetting('transaction_alerts', !user.settings?.transaction_alerts)
                }
                color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
              />
              <ToggleRow
                label="Promotions"
                subtext="Receive offers and updates"
                icon={Zap}
                active={!!user.settings?.promotions}
                onToggle={() => handleToggleSetting('promotions', !user.settings?.promotions)}
                color="bg-amber-50 dark:bg-amber-500/10 text-amber-500"
              />
            </div>
          </motion.div>
        );
      case 'preferences':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="bg-white dark:bg-[#0F172A] p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800 space-y-10 md:space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-[#0F172A] dark:text-white">App Preferences</h3>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                        Appearance
                      </p>
                      <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-[32px]">
                        {[
                          { id: 'light', icon: Sun, label: 'Light' },
                          { id: 'dark', icon: Moon, label: 'Dark' },
                          { id: 'system', icon: Monitor, label: 'System' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                              handleToggleSetting('theme', t.id);
                            }}
                            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-[24px] transition-all ${
                              theme === t.id
                                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xl shadow-slate-200 dark:shadow-none'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                          >
                            <t.icon size={20} />
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              {t.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                          Language & Region
                        </label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-8 py-5 rounded-[24px] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[#0F172A] dark:text-white font-bold outline-none focus:border-[#0F172A] dark:focus:border-blue-500 appearance-none transition-all"
                        >
                          <option>English (US)</option>
                          <option>Urdu (Pakistan)</option>
                          <option>Arabic</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                          Default Currency
                        </label>
                        <select 
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-8 py-5 rounded-[24px] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[#0F172A] dark:text-white font-bold outline-none focus:border-[#0F172A] dark:focus:border-blue-500 appearance-none transition-all"
                        >
                          <option>Pakistani Rupee (PKR)</option>
                          <option>US Dollar (USD)</option>
                          <option>Euro (EUR)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-[#0F172A] dark:text-white">Privacy & Data</h3>
                    <div className="space-y-2">
                      <ToggleRow
                        label="Analytics Sharing"
                        subtext="Help us improve by sharing reports"
                        icon={Zap}
                        active={!!user.settings?.analytics_sharing}
                        onToggle={() =>
                          handleToggleSetting('analytics_sharing', !user.settings?.analytics_sharing)
                        }
                        color="bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                      />
                      <ToggleRow
                        label="Personalized Offers"
                        subtext="Receive tailored financial products"
                        icon={ShieldCheck}
                        active={!!user.settings?.personalized_offers}
                        onToggle={() =>
                          handleToggleSetting(
                            'personalized_offers',
                            !user.settings?.personalized_offers,
                          )
                        }
                        color="bg-purple-50 dark:bg-purple-500/10 text-purple-500"
                      />
                    </div>

                    <div className="pt-10 border-t border-slate-50 dark:border-slate-800">
                      <button className="w-full flex items-center justify-center gap-3 p-6 rounded-[32px] border-2 border-rose-100 dark:border-rose-500/20 text-rose-500 font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                        <AlertTriangle size={20} /> Delete Account
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] px-4 py-8 md:p-10 space-y-8 md:space-y-10 transition-colors duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tighter">Settings</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-base md:text-lg opacity-80">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar (Responsive) */}
        <div className="lg:w-72 bg-white dark:bg-[#0F172A] p-2 md:p-4 rounded-[28px] md:rounded-[40px] shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800 flex flex-row lg:flex-col gap-1 md:gap-4 overflow-x-auto no-scrollbar self-start">
          <SubTabButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SubTabButton icon={ShieldCheck} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
          <SubTabButton icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <SubTabButton icon={SettingsIcon} label="Preferences" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
        </div>

        {/* Content Area */}
        <div className="flex-1">{renderContent()}</div>
      </div>

      {/* Password Update Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPasswordModalOpen(false)} className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xl z-[100]" />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md bg-white rounded-[60px] p-12 shadow-2xl relative">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-[#0F172A]">Update Password</h2>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-300 hover:text-[#0F172A] transition-all"><X size={28} /></button>
                </div>
                <div className="space-y-8">
                  <InputField label="Current Password" type="password" placeholder="••••••••" />
                  <InputField label="New Password" type="password" placeholder="••••••••" />
                  <InputField label="Confirm New Password" type="password" placeholder="••••••••" />
                  <button 
                    className="w-full py-8 rounded-[32px] bg-black text-white font-black text-xl uppercase tracking-widest hover:bg-slate-900 shadow-2xl transition-all mt-4"
                    onClick={() => {
                      setSuccess(true);
                      setTimeout(() => {
                        setSuccess(false);
                        setIsPasswordModalOpen(false);
                      }, 1500);
                    }}
                  >
                    Secure Password
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
