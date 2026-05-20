import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Inbox, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionsPage = ({ user }: { user: any }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/user/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    if (filterType !== 'All') {
      filtered = filtered.filter((tx) => {
        if (filterType === 'Sending') return tx.type === 'send';
        if (filterType === 'Receiving')
          return tx.type === 'receive' && !tx.recipient?.toLowerCase().includes('recharge');
        if (filterType === 'TopUp') return tx.recipient?.toLowerCase().includes('recharge');
        if (filterType === 'Bills')
          return tx.recipient?.toLowerCase().includes('bill') || tx.recipient?.includes(':');
        return true;
      });
    }

    if (platformFilter !== 'All') {
      filtered = filtered.filter(
        (tx) =>
          tx.platform?.toLowerCase().includes(platformFilter.toLowerCase()) ||
          tx.targetType?.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.amount.toString().includes(searchTerm),
      );
    }

    const now = new Date();
    if (dateFilter === 'Today') {
      filtered = filtered.filter((tx) => new Date(tx.date).toDateString() === now.toDateString());
    } else if (dateFilter === 'This Month') {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      });
    }

    return filtered;
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const filtered = getFilteredTransactions();

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('AskariBank Transaction Statement', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Account Holder: ${user.name}`, 14, 32);
    doc.text(`Account Number: ${user.accountNumber}`, 14, 38);
    doc.text(`Statement Period: ${dateFilter}`, 14, 44);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 50);

    const tableData = filtered.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.recipient || 'N/A',
      tx.type.toUpperCase(),
      `Rs ${tx.amount.toLocaleString()}`,
      tx.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Description', 'Type', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`AskariBank_Statement_${new Date().getTime()}.pdf`);
  };

  const filteredTX = getFilteredTransactions();

  return (
    /* Change 1: Set full background white and removed dark mode logic */
    <div className="min-h-screen bg-white px-4 py-8 md:p-10 space-y-8 md:space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight"> Transactions</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Complete history of your financial activity</p>
        </div>
        <button
          onClick={exportPDF}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#0F172A] text-white px-8 md:px-10 py-4 md:py-5 rounded-[24px] md:rounded-[32px] font-black text-base md:text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Download size={20} className="md:w-6 md:h-6" />
          Export Statement
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 md:h-6" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white rounded-[20px] md:rounded-[28px] border border-slate-100 shadow-sm focus:ring-4 focus:ring-slate-50 transition-all text-black font-bold text-base md:text-lg outline-none"
          />
        </div>

        <div className="grid grid-cols-2 lg:flex gap-3 md:gap-4">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 md:px-8 py-4 md:py-6 bg-white rounded-[20px] md:rounded-[28px] border border-slate-100 shadow-sm font-black text-black text-sm md:text-base focus:ring-4 focus:ring-slate-50 cursor-pointer appearance-none outline-none"
          >
            <option value="All">All Platforms</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="nayapay">NayaPay</option>
            <option value="sadapay">SadaPay</option>
            <option value="upaisa">UPaisa</option>
            <option value="bank">Bank</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 md:px-8 py-4 md:py-6 bg-white rounded-[20px] md:rounded-[28px] border border-slate-100 shadow-sm font-black text-black text-sm md:text-base focus:ring-4 focus:ring-slate-50 cursor-pointer appearance-none outline-none"
          >
            <option value="All">All Types</option>
            <option value="Sending">Sending</option>
            <option value="Receiving">Receiving</option>
            <option value="TopUp">Top Up</option>
            <option value="Bills">Bills</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 md:px-8 py-4 md:py-6 bg-white rounded-[20px] md:rounded-[28px] border border-slate-100 shadow-sm font-black text-black text-sm md:text-base focus:ring-4 focus:ring-slate-50 cursor-pointer appearance-none outline-none"
          >
            <option>All Time</option>
            <option>Today</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="p-20 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-900 font-bold">Loading your history...</p>
        </div>
      ) : filteredTX.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTX.map((tx: any, idx: number) => {
            const isReceive = tx.type === 'receive';
            const isBill =
              tx.recipient?.toLowerCase().includes('bill') || tx.recipient?.includes(':');

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-md transition-all gap-4 md:gap-6"
              >
                <div className="flex items-center gap-5 md:gap-8 w-full md:w-auto">
                  <div
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-[20px] md:rounded-[28px] flex items-center justify-center shrink-0 ${
                      isReceive
                        ? 'bg-emerald-50 text-emerald-500'
                        : isBill
                          ? 'bg-orange-50 text-orange-500'
                          : 'bg-rose-50 text-rose-500'
                    }`}
                  >
                    {isReceive ? (
                      <ArrowDownLeft size={24} className="md:w-8 md:h-8" />
                    ) : isBill ? (
                      <Zap size={24} className="md:w-8 md:h-8" />
                    ) : (
                      <ArrowUpRight size={24} className="md:w-8 md:h-8" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg md:text-xl font-black text-[#0F172A] truncate">
                      {tx.recipient || 'Transfer'}
                    </h4>
                    <div className="flex items-center gap-2 md:gap-3 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                      <span>
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="truncate">{tx.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 md:gap-12">
                  <div className="text-left md:text-right">
                    <p
                      className={`text-xl md:text-2xl font-black ${
                        isReceive ? 'text-emerald-500' : 'text-[#0F172A]'
                      }`}
                    >
                      {isReceive ? '+' : '-'} Rs {tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {(tx.id || tx._id || 'REF').slice(0, 8)}
                    </p>
                  </div>
                  <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-50 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-100">
                    {tx.status || 'Success'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-32 rounded-[60px] flex flex-col items-center justify-center text-center space-y-8 border border-dashed border-slate-200"
        >
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <Inbox size={64} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-[#0F172A]">No records found</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">
              We couldn't find any transactions matching your current filters.
            </p>
          </div>
          <button
            onClick={() => {
              setFilterType('All');
              setDateFilter('All Time');
              setSearchTerm('');
            }}
            className="text-slate-900 font-black hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionsPage;
