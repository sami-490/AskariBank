import {
  LayoutDashboard,
  Receipt,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, onLogout, user, isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt size={20} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'cards', label: 'Cards', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (user.role?.toLowerCase() === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: <ShieldCheck size={20} /> });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`w-72 h-screen bg-red-600 dark:bg-red-700 border-r border-red-500/20 flex flex-col p-8 fixed left-0 top-0 transition-all duration-500 shadow-2xl z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 5 L 10 50 L 50 95" fill="#DC2626" />
                <path d="M50 5 L 90 50 L 50 95" fill="#F87171" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              AskariBank<span className="text-red-200">.</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-4 px-2 opacity-60">
            Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'admin') {
                  navigate('/admin');
                } else {
                  setActiveTab(item.id);
                  navigate(`/${item.id}`);
                }
                onClose(); // Close sidebar on mobile after clicking
              }}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-white text-red-600 shadow-xl shadow-red-900/20 scale-105'
                  : 'text-red-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-white/10 rounded-2xl flex items-center gap-3 border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-black">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user.name}</p>
              <p className="text-[10px] text-red-100 font-black uppercase tracking-widest truncate opacity-60">
                {user.role || 'Member'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-100 font-black transition-all hover:text-white hover:bg-white/10"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
