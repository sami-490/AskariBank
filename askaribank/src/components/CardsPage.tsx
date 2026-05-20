import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Snowflake,
  Radio,
  Lock,
  Eye,
  EyeOff,
  X,
  CreditCard,
  CheckCircle2,
  Globe,
  Wifi,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api/user';
const AUTH_API = 'http://localhost:5000/api/auth';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

const CARD_VARIETIES = [
  {
    name: 'Platinum Elite',
    sub: 'Obsidian Finish',
    type: 'VISA GOLD',
    price: 5000,
    bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    accent: '#fff',
  },
  {
    name: 'Digital Creator',
    sub: 'Virtual Card',
    type: 'MASTERCARD',
    price: 2500,
    bg: 'bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400',
    accent: '#fff',
  },
  {
    name: 'Secure Saver',
    sub: 'Physical Card',
    type: 'VISA',
    price: 3500,
    bg: 'bg-gradient-to-br from-slate-500 via-slate-400 to-slate-600',
    accent: '#fff',
  },
  {
    name: 'Eco-Friendly',
    sub: 'Themed WR Card',
    type: 'MASTERCARD',
    price: 1500,
    bg: 'bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-600',
    accent: '#fff',
  },
];

const CARD_COLORS: Record<string, string> = {
  dark: 'bg-gradient-to-br from-[#1E293B] to-[#0F172A]',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
  slate: 'bg-gradient-to-br from-slate-500 to-slate-700',
  green: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
};

interface Card {
  _id: string;
  cardType: string;
  cardVariety?: string;
  cardNumber: string;
  expiry: string;
  status: 'active' | 'frozen' | 'blocked';
  contactless: boolean;
  international: boolean;
  onlinePayments: boolean;
  color?: string;
}

const BankCard = ({
  card,
  holder,
  isVisible,
  onToggleDetails,
  index,
}: {
  card: Card;
  holder: string;
  isVisible: boolean;
  onToggleDetails: () => void;
  index: number;
}) => {
  const isFrozen = card.status === 'frozen';
  const isBlocked = card.status === 'blocked';
  const colorClass = CARD_COLORS[card.color || (index === 0 ? 'dark' : 'blue')];
  const num = card.cardNumber || '0000 0000 0000 0000';

  return (
    <motion.div
      whileHover={{ y: isBlocked ? 0 : -6 }}
      className={`relative w-full rounded-[28px] text-white shadow-2xl overflow-hidden ${colorClass} transition-all duration-500`}
      style={{ aspectRatio: '1.58/1' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative z-10 h-full p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
              Primary Card
            </p>
            <h3 className="text-lg font-black tracking-tight text-white uppercase">
              {card.cardType || 'VISA GOLD'}
            </h3>
          </div>
          <div className="flex gap-2">
            {!isBlocked && (
              <button
                onClick={onToggleDetails}
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all cursor-pointer z-30"
              >
                {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            )}
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Wifi size={15} className="text-white/80" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="w-10 h-7 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 rounded-md shadow-inner" />
          <p className="text-base font-black tracking-[0.12em] font-mono text-black drop-shadow-md">
            {isVisible && !isBlocked ? num : `**** **** **** ${num.slice(-4)}`}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
              Card Holder
            </p>
            <p className="text-sm font-black uppercase truncate max-w-[120px]">{holder}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
              Expires
            </p>
            <p className="text-sm font-black">{card.expiry || '12/28'}</p>
          </div>
        </div>
      </div>
      {isFrozen && !isBlocked && (
        <div className="absolute inset-0 bg-[#ffffff]/80 backdrop-blur-md z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 text-white bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
              <Snowflake size={22} />
            </div>
            <span className="text-xs font-black text-black uppercase tracking-[0.3em]">Frozen</span>
          </div>
        </div>
      )}
      {isBlocked && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md z-20 flex items-center justify-center border border-red-500/30">
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <div className="w-12 h-12 text-red-200 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
              <Lock size={22} />
            </div>
            <span className="text-xs font-black text-red-100 uppercase tracking-[0.3em]">Permanently Blocked</span>
            <span className="text-[9px] font-bold text-red-300/80 uppercase tracking-wider">Contact support for details</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const Toggle = ({
  active,
  onToggle,
  activeColor,
  disabled = false,
}: {
  active: boolean;
  onToggle: () => void;
  activeColor: string;
  disabled?: boolean;
}) => (
  <button
    onClick={disabled ? undefined : onToggle}
    disabled={disabled}
    className={`w-12 h-7 rounded-full relative flex items-center px-1 transition-all duration-300 ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-50' : active ? activeColor : 'bg-slate-200'}`}
  >
    <motion.div
      animate={{ x: active ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`w-5 h-5 rounded-full shadow-md ${disabled ? 'bg-slate-300' : 'bg-white'}`}
    />
  </button>
);

interface SecurityRowProps {
  icon: React.ElementType;
  label: string;
  sub: string;
  active: boolean;
  onToggle: () => void;
  iconBg: string;
  activeColor: string;
  disabled?: boolean;
}

const SecurityRow = ({
  icon: Icon,
  label,
  sub,
  active,
  onToggle,
  iconBg,
  activeColor,
  disabled = false,
}: SecurityRowProps) => (
  <div className={`flex items-center justify-between p-5 bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-base font-black text-[#0F172A]">{label}</h4>
        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </div>
    <Toggle active={disabled ? false : active} onToggle={onToggle} activeColor={activeColor} disabled={disabled} />
  </div>
);

const CardsPage = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState(0);
  const [selectedVariety, setSelectedVariety] = useState(CARD_VARIETIES[0]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data } = await axios.get(`${AUTH_API}/me`, { headers: authHeader() });
      setCards(data.data?.cards || []);
    } catch {
      /* silent */
    }
  };

  const handleToggleField = async (cardId: string, field?: string) => {
    const targetCard = cards.find((c) => c._id === cardId);
    if (targetCard?.status === 'blocked') {
      alert('This card is permanently blocked by administration and cannot be modified.');
      return;
    }
    try {
      await axios.put(`${API}/cards/${cardId}`, field ? { field } : {}, { headers: authHeader() });
      await fetchCards();
      refreshUser();
    } catch {
      alert('Failed to update card');
    }
  };

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    setPurchaseError('');
    try {
      await axios.post(
        `${API}/cards/purchase`,
        { variety: selectedVariety.name, cardType: selectedVariety.type },
        { headers: authHeader() },
      );
      setPurchaseSuccess(true);
      await fetchCards();
      refreshUser();
      setTimeout(() => {
        setPurchaseSuccess(false);
        setPurchaseStep(0);
      }, 2500);
    } catch (err: any) {
      setPurchaseError(err?.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleUpdatePin = () => {
    setPinError('');
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    if (newPin.length < 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    setPinLoading(true);
    setTimeout(() => {
      setPinLoading(false);
      setPinSuccess(true);
      setTimeout(() => {
        setPinSuccess(false);
        setIsPinModalOpen(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }, 2000);
    }, 1000);
  };

  const primaryCard = cards[0];

  return (
    <div className="min-h-screen bg-white px-4 py-8 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">Manage Cards</h1>
              <p className="text-xs text-slate-400">Your digital and physical assets</p>
            </div>
          </div>
          <button
            onClick={() => setPurchaseStep(1)}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> New Card
          </button>
        </div>

        {/* Active Cards */}
        <section className="bg-slate-50 rounded-[24px] md:rounded-[32px] p-5 md:p-6 border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest">
              Active Cards
            </h2>
            <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
              Currently Active ({cards.length})
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <BankCard
                key={card._id}
                card={card}
                holder={user?.name || 'Card Holder'}
                isVisible={showDetails}
                onToggleDetails={() => setShowDetails((v) => !v)}
                index={i}
              />
            ))}
            {cards.length === 0 && (
              <p className="text-slate-300 text-sm col-span-2">No cards yet. Purchase one below.</p>
            )}
          </div>
        </section>

        {/* Card Varieties */}
        <section className="bg-white/5 rounded-[24px] md:rounded-[32px] p-5 md:p-6 border border-white/5">
          <h2 className="text-[10px] md:text-[11px] font-black text-white/50 uppercase tracking-[0.25em] mb-5">
            Card Varieties
          </h2>
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2 scroll-smooth"
            >
              {CARD_VARIETIES.map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setSelectedVariety(v);
                    setPurchaseStep(1);
                  }}
                  className={`flex-shrink-0 w-52 rounded-[20px] overflow-hidden transition-all hover:scale-105 border-2 ${selectedVariety.name === v.name ? 'border-blue-400' : 'border-transparent'}`}
                >
                  <div className={`${v.bg} w-full relative`} style={{ aspectRatio: '1.58/1' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative z-10 h-full p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">
                            Primary Card
                          </p>
                          <p className="text-[11px] font-black text-white uppercase tracking-tight leading-none mt-0.5">
                            {v.type}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center border border-white/10">
                            <Eye size={9} className="text-white/70" />
                          </div>
                          <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center border border-white/10">
                            <Wifi size={9} className="text-white/70" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-6 h-4 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 rounded-[3px] shadow-inner" />
                        <p className="text-[8px] font-black tracking-[0.12em] font-mono text-white">
                          •••• •••• •••• 0000
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[6px] font-black text-white/30 uppercase tracking-widest">
                            Card Holder
                          </p>
                          <p className="text-[8px] font-black text-white uppercase">YOUR NAME</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[6px] font-black text-white/30 uppercase tracking-widest">
                            Expires
                          </p>
                          <p className="text-[8px] font-black text-white">12/30</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0D1526] p-3">
                    <p className="text-[11px] font-black text-white uppercase">{v.name}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">{v.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Flow */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => setPurchaseStep(purchaseStep > 0 ? 0 : 1)}
              className="bg-white text-[#060B18] px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} /> Purchase a New Card
            </button>

            {purchaseStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-wrap gap-3 items-center"
              >
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">
                    A
                  </span>
                  <select
                    value={selectedVariety.name}
                    onChange={(e) =>
                      setSelectedVariety(
                        CARD_VARIETIES.find((v) => v.name === e.target.value) || CARD_VARIETIES[0],
                      )
                    }
                    className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                  >
                    {CARD_VARIETIES.map((v) => (
                      <option key={v.name} value={v.name} className="bg-[#0D1526]">
                        {v.name} — PKR {v.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {purchaseStep >= 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3 border border-white/10"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">
                      B
                    </span>
                    <div>
                      <p className="text-white text-xs font-black">Funding: Main Checking</p>
                      <p className="text-white/50 text-[10px]">
                        Balance: PKR {(user?.balance || 0).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                )}

                {purchaseSuccess ? (
                  <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 rounded-2xl px-4 py-3 border border-emerald-500/20">
                    <CheckCircle2 size={16} />{' '}
                    <span className="text-xs font-black">Card Added!</span>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/20 text-white text-[10px] font-black flex items-center justify-center">
                      C
                    </span>
                    {purchaseLoading ? 'Processing...' : 'Complete Payment & Confirm'}
                  </button>
                )}
              </motion.div>
            )}
          </div>
          {purchaseError && (
            <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs font-bold">
              <AlertCircle size={14} /> {purchaseError}
            </div>
          )}
        </section>

        {/* Card Security + Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-4">
            <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em]">
              Card Security
            </h2>
            <SecurityRow
              icon={Snowflake}
              label="Freeze Card"
              sub={primaryCard?.status === 'blocked' ? "Blocked by admin" : "Lock card instantly"}
              active={primaryCard?.status === 'frozen'}
              iconBg={
                primaryCard?.status === 'blocked'
                  ? 'bg-red-50 text-red-500/60'
                  : primaryCard?.status === 'frozen'
                  ? 'bg-blue-100 text-blue-500'
                  : 'bg-slate-100 text-slate-400'
              }
              activeColor="bg-blue-500"
              disabled={primaryCard?.status === 'blocked'}
              onToggle={() => primaryCard && handleToggleField(primaryCard._id)}
            />
            <SecurityRow
              icon={Radio}
              label="Contactless"
              sub={primaryCard?.status === 'blocked' ? "Blocked by admin" : "Tap to pay enabled"}
              active={primaryCard?.contactless ?? true}
              iconBg={
                primaryCard?.status === 'blocked'
                  ? 'bg-red-50 text-red-500/60'
                  : (primaryCard?.contactless ?? true)
                  ? 'bg-emerald-100 text-emerald-500'
                  : 'bg-slate-100 text-slate-400'
              }
              activeColor="bg-emerald-500"
              disabled={primaryCard?.status === 'blocked'}
              onToggle={() => primaryCard && handleToggleField(primaryCard._id, 'contactless')}
            />
            <SecurityRow
              icon={Globe}
              label="International"
              sub={primaryCard?.status === 'blocked' ? "Blocked by admin" : "Global transactions"}
              active={primaryCard?.international ?? true}
              iconBg={
                primaryCard?.status === 'blocked'
                  ? 'bg-red-50 text-red-500/60'
                  : (primaryCard?.international ?? true)
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-slate-100 text-slate-400'
              }
              activeColor="bg-purple-600"
              disabled={primaryCard?.status === 'blocked'}
              onToggle={() => primaryCard && handleToggleField(primaryCard._id, 'international')}
            />
            <SecurityRow
              icon={CreditCard}
              label="Online Payments"
              sub={primaryCard?.status === 'blocked' ? "Blocked by admin" : "E-commerce enabled"}
              active={primaryCard?.onlinePayments ?? true}
              iconBg={
                primaryCard?.status === 'blocked'
                  ? 'bg-red-50 text-red-500/60'
                  : (primaryCard?.onlinePayments ?? true)
                  ? 'bg-orange-100 text-orange-500'
                  : 'bg-slate-100 text-slate-400'
              }
              activeColor="bg-orange-500"
              disabled={primaryCard?.status === 'blocked'}
              onToggle={() => primaryCard && handleToggleField(primaryCard._id, 'onlinePayments')}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em]">
              Settings
            </h2>
            <button
              onClick={() => {
                if (primaryCard?.status === 'blocked') {
                  alert('This card is permanently blocked by administration.');
                  return;
                }
                setIsPinModalOpen(true);
              }}
              disabled={primaryCard?.status === 'blocked'}
              className={`w-full flex items-center justify-between p-5 bg-white rounded-[24px] transition-all group ${primaryCard?.status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${primaryCard?.status === 'blocked' ? 'bg-red-50 text-red-500/60' : 'bg-slate-100 text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white'}`}>
                  <Lock size={20} />
                </div>
                <span className="text-base font-black text-[#0F172A]">
                  {primaryCard?.status === 'blocked' ? 'Security PIN (Blocked)' : 'Change Security PIN'}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                if (primaryCard?.status === 'blocked') {
                  alert('This card is permanently blocked by administration.');
                  return;
                }
                setShowDetails((v) => !v);
              }}
              disabled={primaryCard?.status === 'blocked'}
              className={`w-full flex items-center justify-between p-5 bg-white rounded-[24px] transition-all group ${primaryCard?.status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${primaryCard?.status === 'blocked' ? 'bg-red-50 text-red-500/60' : 'bg-slate-100 text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white'}`}>
                  {showDetails && primaryCard?.status !== 'blocked' ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
                <span className="text-base font-black text-[#0F172A]">
                  {primaryCard?.status === 'blocked' ? 'Card Details (Blocked)' : showDetails ? 'Hide Card Details' : 'Show Card Details'}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                if (primaryCard?.status === 'blocked') {
                  alert('This card is permanently blocked by administration.');
                  return;
                }
                setPurchaseStep(1);
              }}
              disabled={primaryCard?.status === 'blocked'}
              className={`w-full flex items-center justify-between p-5 bg-white rounded-[24px] transition-all group ${primaryCard?.status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${primaryCard?.status === 'blocked' ? 'bg-red-50 text-red-500/60' : 'bg-rose-50 text-rose-500'}`}>
                  <ShoppingCart size={20} />
                </div>
                <span className="text-base font-black text-[#0F172A]">Request Physical Card</span>
              </div>
            </button>
          </section>
        </div>
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPinModalOpen(false);
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
                setPinError('');
              }}
              className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xl z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
              >
                {pinSuccess ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0F172A]">PIN Updated!</h2>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-black text-[#0F172A]">Change PIN</h2>
                      <button
                        onClick={() => {
                          setIsPinModalOpen(false);
                          setCurrentPin('');
                          setNewPin('');
                          setConfirmPin('');
                          setPinError('');
                        }}
                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {[
                      { label: 'Current PIN', val: currentPin, set: setCurrentPin },
                      { label: 'New PIN', val: newPin, set: setNewPin },
                      { label: 'Confirm PIN', val: confirmPin, set: setConfirmPin },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {label}
                        </p>
                        <input
                          type="password"
                          maxLength={4}
                          value={val}
                          onChange={(e) => {
                            set(e.target.value.replace(/\D/g, ''));
                            setPinError('');
                          }}
                          className="w-full text-center py-4 bg-slate-50 rounded-2xl text-lg font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#0F172A]/20 text-[#0F172A]"
                          placeholder="••••"
                        />
                      </div>
                    ))}
                    {pinError && (
                      <p className="text-rose-500 text-sm font-bold text-center">{pinError}</p>
                    )}
                    <button
                      onClick={handleUpdatePin}
                      disabled={pinLoading}
                      className="w-full py-5 rounded-[24px] bg-black text-white font-black text-lg uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50"
                    >
                      {pinLoading ? 'Saving...' : 'Save New PIN'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardsPage;
