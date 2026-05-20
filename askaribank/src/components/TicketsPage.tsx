import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Film,
  Bus,
  Plane,
  Ticket,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import axios from 'axios';

// --- MOCK DATA ---

const MOVIES = [
  { id: 'm1', title: 'Interstellar - IMAX Re-Release', genre: 'Sci-Fi / Adventure', location: 'Universal Cineplex, Lahore', date: 'Oct 15, 2026 • 08:30 PM', price: 1500, image: 'https://loremflickr.com/800/400/space,galaxy?lock=1' },
  { id: 'm2', title: 'The Matrix Resurrections', genre: 'Action / Sci-Fi', location: 'Nueplex Cinemas, Lahore', date: 'Oct 16, 2026 • 09:00 PM', price: 1200, image: 'https://loremflickr.com/800/400/cyberpunk,neon?lock=2' },
  { id: 'm3', title: 'Dune: Part Three', genre: 'Sci-Fi / Drama', location: 'Centaurus Cineplex, Lahore', date: 'Oct 17, 2026 • 07:15 PM', price: 2000, image: 'https://loremflickr.com/800/400/desert,dunes?lock=3' },
  { id: 'm4', title: 'Oppenheimer 70mm', genre: 'Biography / History', location: 'Atrium Mall, Lahore', date: 'Oct 18, 2026 • 05:00 PM', price: 1800, image: 'https://loremflickr.com/800/400/explosion,history?lock=4' },
  { id: 'm5', title: 'Spider-Man: Beyond', genre: 'Animation / Action', location: 'Emporium Mall, Lahore', date: 'Oct 19, 2026 • 04:30 PM', price: 1000, image: 'https://loremflickr.com/800/400/superhero,city?lock=5' },
  { id: 'm6', title: 'Inception - Director\'s Cut', genre: 'Sci-Fi / Thriller', location: 'Arena, Lahore', date: 'Oct 20, 2026 • 10:00 PM', price: 1500, image: 'https://loremflickr.com/800/400/dream,cityscape?lock=6' },
  { id: 'm7', title: 'The Batman - Part II', genre: 'Action / Crime', location: 'Packages Mall, Lahore', date: 'Oct 21, 2026 • 08:45 PM', price: 1600, image: 'https://loremflickr.com/800/400/batman,dark?lock=7' },
  { id: 'm8', title: 'Avatar 3', genre: 'Adventure / Fantasy', location: 'Ocean Mall, Lahore', date: 'Oct 22, 2026 • 06:30 PM', price: 2500, image: 'https://loremflickr.com/800/400/alien,jungle?lock=8' },
  { id: 'm9', title: 'Joker: Folie à Deux', genre: 'Drama / Thriller', location: 'Giga Mall, Lahore', date: 'Oct 23, 2026 • 09:15 PM', price: 1400, image: 'https://loremflickr.com/800/400/joker,clown?lock=9' },
  { id: 'm10', title: 'Gladiator II', genre: 'Action / Drama', location: 'Dolmen Mall, Lahore', date: 'Oct 24, 2026 • 07:00 PM', price: 1700, image: 'https://loremflickr.com/800/400/gladiator,colosseum?lock=10' },
];

const BUSES = [
  { id: 'b1', title: 'Lahore to Islamabad', operator: 'Faisal Movers', date: 'Daily • Every 30 mins', duration: '4h 30m', price: 2500, image: 'https://loremflickr.com/800/400/bus,highway?lock=1' },
  { id: 'b2', title: 'Karachi to Hyderabad', operator: 'Daewoo Express', date: 'Daily • Hourly', duration: '2h 15m', price: 1200, image: 'https://loremflickr.com/800/400/coach,road?lock=2' },
  { id: 'b3', title: 'Islamabad to Peshawar', operator: 'Skyways', date: 'Daily • Every 45 mins', duration: '2h 45m', price: 1500, image: 'https://loremflickr.com/800/400/bus,mountains?lock=3' },
  { id: 'b4', title: 'Lahore to Multan', operator: 'Faisal Movers', date: 'Daily • Every 1 hour', duration: '4h 00m', price: 2200, image: 'https://loremflickr.com/800/400/bus,sunset?lock=4' },
  { id: 'b5', title: 'Karachi to Lahore', operator: 'Daewoo Express', date: 'Daily • 10:00 PM', duration: '18h 30m', price: 6500, image: 'https://loremflickr.com/800/400/bus,night?lock=5' },
  { id: 'b6', title: 'Rawalpindi to Murree', operator: 'Niazi Express', date: 'Daily • Every 2 hours', duration: '1h 30m', price: 800, image: 'https://loremflickr.com/800/400/bus,snow?lock=6' },
  { id: 'b7', title: 'Multan to Bahawalpur', operator: 'Faisal Movers', date: 'Daily • Every 30 mins', duration: '1h 45m', price: 1000, image: 'https://loremflickr.com/800/400/bus,travel?lock=7' },
  { id: 'b8', title: 'Lahore to Faisalabad', operator: 'Daewoo Express', date: 'Daily • Every 45 mins', duration: '2h 00m', price: 1300, image: 'https://loremflickr.com/800/400/bus,motorway?lock=8' },
  { id: 'b9', title: 'Islamabad to Swat', operator: 'Swat Coach', date: 'Daily • 08:00 AM', duration: '5h 30m', price: 3000, image: 'https://loremflickr.com/800/400/bus,valley?lock=9' },
  { id: 'b10', title: 'Karachi to Quetta', operator: 'Sada Bahar', date: 'Daily • 06:00 PM', duration: '12h 00m', price: 4500, image: 'https://loremflickr.com/800/400/bus,desert?lock=10' },
];

const FLIGHTS = [
  { id: 'f1', title: 'Karachi to Dubai', airline: 'Emirates', date: 'Nov 01, 2026 • 10:30 AM', duration: '2h 15m', ecoPrice: 45000, bizPrice: 125000, image: 'https://loremflickr.com/800/400/dubai,city?lock=1' },
  { id: 'f2', title: 'Lahore to London', airline: 'British Airways', date: 'Nov 02, 2026 • 02:00 PM', duration: '9h 45m', ecoPrice: 180000, bizPrice: 450000, image: 'https://loremflickr.com/800/400/london,city?lock=2' },
  { id: 'f3', title: 'Islamabad to Istanbul', airline: 'Turkish Airlines', date: 'Nov 03, 2026 • 06:15 AM', duration: '6h 20m', ecoPrice: 95000, bizPrice: 280000, image: 'https://loremflickr.com/800/400/istanbul,city?lock=3' },
  { id: 'f4', title: 'Karachi to New York', airline: 'Qatar Airways', date: 'Nov 04, 2026 • 11:45 PM', duration: '18h 30m', ecoPrice: 320000, bizPrice: 950000, image: 'https://loremflickr.com/800/400/newyork,city?lock=4' },
  { id: 'f5', title: 'Lahore to Toronto', airline: 'Etihad Airways', date: 'Nov 05, 2026 • 03:30 AM', duration: '19h 15m', ecoPrice: 350000, bizPrice: 980000, image: 'https://loremflickr.com/800/400/toronto,city?lock=5' },
  { id: 'f6', title: 'Islamabad to Jeddah', airline: 'Saudi Airlines', date: 'Nov 06, 2026 • 09:00 PM', duration: '5h 10m', ecoPrice: 85000, bizPrice: 220000, image: 'https://loremflickr.com/800/400/jeddah,city?lock=6' },
  { id: 'f7', title: 'Karachi to Islamabad', airline: 'PIA', date: 'Nov 07, 2026 • 08:00 AM', duration: '2h 00m', ecoPrice: 25000, bizPrice: 65000, image: 'https://loremflickr.com/800/400/islamabad,city?lock=7' },
  { id: 'f8', title: 'Lahore to Karachi', airline: 'AirSial', date: 'Nov 08, 2026 • 05:00 PM', duration: '1h 45m', ecoPrice: 22000, bizPrice: 55000, image: 'https://loremflickr.com/800/400/karachi,city?lock=8' },
  { id: 'f9', title: 'Islamabad to Doha', airline: 'Qatar Airways', date: 'Nov 09, 2026 • 10:15 AM', duration: '3h 30m', ecoPrice: 75000, bizPrice: 190000, image: 'https://loremflickr.com/800/400/doha,city?lock=9' },
  { id: 'f10', title: 'Karachi to Colombo', airline: 'SriLankan Airlines', date: 'Nov 10, 2026 • 11:30 PM', duration: '3h 45m', ecoPrice: 65000, bizPrice: 160000, image: 'https://loremflickr.com/800/400/colombo,city?lock=10' },
  { id: 'f11', title: 'Lahore to Bangkok', airline: 'Thai Airways', date: 'Nov 11, 2026 • 01:20 AM', duration: '5h 50m', ecoPrice: 110000, bizPrice: 275000, image: 'https://loremflickr.com/800/400/bangkok,city?lock=11' },
  { id: 'f12', title: 'Islamabad to Beijing', airline: 'Air China', date: 'Nov 12, 2026 • 08:45 PM', duration: '6h 15m', ecoPrice: 130000, bizPrice: 320000, image: 'https://loremflickr.com/800/400/beijing,city?lock=12' },
  { id: 'f13', title: 'Karachi to Sydney', airline: 'Emirates', date: 'Nov 13, 2026 • 06:00 AM', duration: '16h 40m', ecoPrice: 280000, bizPrice: 850000, image: 'https://loremflickr.com/800/400/sydney,city?lock=13' },
  { id: 'f14', title: 'Lahore to Paris', airline: 'Gulf Air', date: 'Nov 14, 2026 • 02:30 AM', duration: '11h 20m', ecoPrice: 165000, bizPrice: 420000, image: 'https://loremflickr.com/800/400/paris,city?lock=14' },
  { id: 'f15', title: 'Islamabad to Skardu', airline: 'PIA', date: 'Nov 15, 2026 • 10:00 AM', duration: '1h 00m', ecoPrice: 18000, bizPrice: 35000, image: 'https://loremflickr.com/800/400/skardu,mountains?lock=15' },
];

const EVENTS = [
  { id: 'e1', title: 'Global AI Innovation Summit 2026', type: 'Tech Conference', location: 'Expo Center, Lahore', date: 'Nov 02, 2026 • 09:00 AM', price: 3000, image: 'https://loremflickr.com/800/400/technology,conference?lock=1' },
  { id: 'e2', title: 'Soulify Musical Night', type: 'Concert', location: 'Arts Council, Lahore', date: 'Dec 12, 2026 • 07:00 PM', price: 2500, image: 'https://loremflickr.com/800/400/concert,music?lock=2' },
  { id: 'e3', title: 'FinTech Leaders Forum', type: 'Business', location: 'Marriott, Lahore', date: 'Nov 15, 2026 • 10:00 AM', price: 5000, image: 'https://loremflickr.com/800/400/business,meeting?lock=3' },
  { id: 'e4', title: 'Lahore Food Festival', type: 'Food & Culture', location: 'Gaddafi Stadium, Lahore', date: 'Nov 20, 2026 • 04:00 PM', price: 1000, image: 'https://loremflickr.com/800/400/food,festival?lock=4' },
  { id: 'e5', title: 'Pak vs Eng - T20 Final', type: 'Sports', location: 'National Stadium, Lahore', date: 'Dec 05, 2026 • 08:00 PM', price: 4500, image: 'https://loremflickr.com/800/400/cricket,stadium?lock=5' },
  { id: 'e6', title: 'StartUp Pitch Fest', type: 'Tech & Startup', location: 'NIC, Lahore', date: 'Nov 28, 2026 • 11:00 AM', price: 1500, image: 'https://loremflickr.com/800/400/startup,pitch?lock=6' },
  { id: 'e7', title: 'Atif Aslam Live', type: 'Concert', location: 'DHA Sports Club, Lahore', date: 'Dec 25, 2026 • 08:30 PM', price: 6000, image: 'https://loremflickr.com/800/400/singer,stage?lock=7' },
  { id: 'e8', title: 'Auto Show 2026', type: 'Exhibition', location: 'Expo Center, Lahore', date: 'Jan 10, 2027 • 10:00 AM', price: 800, image: 'https://loremflickr.com/800/400/sports,car?lock=8' },
  { id: 'e9', title: 'Literary Festival', type: 'Arts & Culture', location: 'Alhamra, Lahore', date: 'Feb 15, 2027 • 09:00 AM', price: 500, image: 'https://loremflickr.com/800/400/books,library?lock=9' },
  { id: 'e10', title: 'Cyber Security Summit', type: 'Tech Conference', location: 'Serena Hotel, Lahore', date: 'Mar 05, 2027 • 08:30 AM', price: 4000, image: 'https://loremflickr.com/800/400/hacker,cyber?lock=10' },
];

const CATEGORIES = [
  { id: 'movies', label: 'Movies', icon: Film, count: MOVIES.length, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'bus', label: 'Bus', icon: Bus, count: BUSES.length, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'flights', label: 'Flights', icon: Plane, count: FLIGHTS.length, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'events', label: 'Events', icon: Ticket, count: EVENTS.length, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const TicketsPage = ({ user, refreshUser }: { user: any; refreshUser: () => void }) => {
  const [activeCategory, setActiveCategory] = useState('movies');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Booking state
  const [ticketCount, setTicketCount] = useState(1);
  const [flightClass, setFlightClass] = useState<'eco' | 'biz'>('eco');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentData = useMemo(() => {
    let data: any[] = [];
    if (activeCategory === 'movies') data = MOVIES;
    if (activeCategory === 'bus') data = BUSES;
    if (activeCategory === 'flights') data = FLIGHTS;
    if (activeCategory === 'events') data = EVENTS;

    if (searchTerm) {
      data = data.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  }, [activeCategory, searchTerm]);

  const handleBookClick = (item: any) => {
    setSelectedItem(item);
    setTicketCount(1);
    setFlightClass('eco');
    setIsModalOpen(true);
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    if (activeCategory === 'flights') {
      return (flightClass === 'eco' ? selectedItem.ecoPrice : selectedItem.bizPrice) * ticketCount;
    }
    return selectedItem.price * ticketCount;
  };

  const handlePurchase = async () => {
    const total = calculateTotal();
    if (user.balance < total) {
      alert('Insufficient balance to purchase tickets.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        recipientAccount: 'TICKET-PROVIDER',
        recipientName: `${activeCategory.toUpperCase()} - ${selectedItem.title} (x${ticketCount})`,
        amount: total,
        type: 'purchase',
        targetType: activeCategory
      };

      await axios.post('http://localhost:5000/api/user/transfer', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await refreshUser();
      setIsModalOpen(false);
      setSuccessMessage('Ticket Purchased Successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to purchase ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 space-y-8 md:space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight">Tickets & Events</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Book movies, travel, and events instantly</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 md:h-6" />
        <input
          type="text"
          placeholder="Search for movies, events, or destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-white rounded-[24px] md:rounded-[28px] border-2 border-slate-100 shadow-sm focus:ring-4 focus:ring-slate-50 focus:border-[#0F172A] transition-all text-[#0F172A] font-bold text-base md:text-lg outline-none"
        />
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-[#0F172A]">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-4 md:p-8 rounded-[24px] md:rounded-[32px] border-2 transition-all ${
                activeCategory === cat.id
                  ? 'border-[#0F172A] shadow-xl scale-[1.02]'
                  : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-3 md:mb-4 shadow-inner`}>
                <cat.icon size={24} className="md:w-8 md:h-8" />
              </div>
              <span className="font-black text-base md:text-lg text-[#0F172A]">{cat.label}</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400">{cat.count} available</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-[#0F172A] capitalize">Available {activeCategory}</h3>
          <button className="text-blue-600 font-bold hover:underline text-sm">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {currentData.length > 0 ? currentData.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
            >
              <div className="h-48 md:h-56 relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-slate-100" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://picsum.photos/seed/${item.id}/800/400`;
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-[#0F172A] shadow-lg">
                  Rs {activeCategory === 'flights' ? item.ecoPrice.toLocaleString() : item.price.toLocaleString()}
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <Calendar size={14} />
                  <span>{item.date}</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-[#0F172A] mb-2 leading-tight">{item.title}</h4>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs md:text-sm mb-6 flex-1">
                  <MapPin size={16} className="shrink-0" />
                  <span className="truncate">{item.location || item.operator || item.airline}</span>
                </div>
                
                <button 
                  onClick={() => handleBookClick(item)}
                  className="w-full py-3 md:py-4 bg-[#0F172A] text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-[40px]">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-2xl font-black text-slate-400">No matching items found</h3>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xl z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-2xl bg-white rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
              >
                {/* Modal Image */}
                <div className="w-full md:w-2/5 h-48 md:h-auto relative">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.title} 
                    className="w-full h-full object-cover bg-slate-100" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://picsum.photos/seed/${selectedItem.id}/800/400`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <span className="text-white font-black text-xl">{activeCategory.toUpperCase()}</span>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-10 flex-1 space-y-6 md:space-y-8 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] leading-tight mb-2">{selectedItem.title}</h2>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs md:text-sm">
                        <MapPin size={16} />
                        <span>{selectedItem.location || selectedItem.operator || selectedItem.airline}</span>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:text-[#0F172A] hover:bg-slate-200 transition-all shrink-0">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Flights Specific Options */}
                    {activeCategory === 'flights' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cabin Class</label>
                        <div className="flex gap-4 p-2 bg-slate-50 rounded-[24px]">
                          <button
                            onClick={() => setFlightClass('eco')}
                            className={`flex-1 py-4 flex flex-col items-center gap-1 rounded-2xl transition-all ${
                              flightClass === 'eco' ? 'bg-white shadow-md text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <span className="font-black">Economy</span>
                            <span className="text-xs font-bold">Rs {selectedItem.ecoPrice.toLocaleString()}</span>
                          </button>
                          <button
                            onClick={() => setFlightClass('biz')}
                            className={`flex-1 py-4 flex flex-col items-center gap-1 rounded-2xl transition-all ${
                              flightClass === 'biz' ? 'bg-white shadow-md text-[#0F172A]' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2"><Briefcase size={14} /><span className="font-black">Business</span></div>
                            <span className="text-xs font-bold">Rs {selectedItem.bizPrice.toLocaleString()}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px]">
                      <span className="font-black text-[#0F172A]">Number of Tickets</span>
                      <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <button 
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          className="w-8 h-8 flex items-center justify-center text-2xl font-medium text-slate-400 hover:text-[#0F172A]"
                        >
                          -
                        </button>
                        <span className="font-black text-xl w-4 text-center">{ticketCount}</span>
                        <button 
                          onClick={() => setTicketCount(ticketCount + 1)}
                          className="w-8 h-8 flex items-center justify-center text-2xl font-medium text-slate-400 hover:text-[#0F172A]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Action */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-0 mt-auto">
                    <div className="w-full sm:w-auto">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Amount</span>
                      <span className="text-3xl md:text-4xl font-black text-blue-600">Rs {calculateTotal().toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={handlePurchase}
                      disabled={loading}
                      className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-[#0F172A] text-white rounded-[20px] md:rounded-[24px] font-black text-sm md:text-base uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {successMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <div className="fixed inset-0 z-[111] flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm pointer-events-auto border border-slate-100 text-center"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#0F172A]">Success!</h3>
                  <p className="text-xs font-bold text-slate-500">{successMessage}</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketsPage;
