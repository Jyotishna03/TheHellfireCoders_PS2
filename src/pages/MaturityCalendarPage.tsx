import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FDRRecord } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  RefreshCw,
  Building,
  FileText,
  Mail,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MaturityCalendarPage: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWindow, setFilterWindow] = useState<'ALL' | '7D' | '15D' | '30D' | 'OVERDUE'>('ALL');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [noticeSentId, setNoticeSentId] = useState<string | null>(null);

  const { runMaturityScan } = useNotifications();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getFDRs({ sortBy: 'maturity', sortOrder: 'asc' });
      setFdrs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.triggerMaturityScan();
      setScanResult(res.message);
      await fetchRecords();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleSendNotice = (fdrId: string) => {
    setNoticeSentId(fdrId);
    setTimeout(() => setNoticeSentId(null), 3000);
  };

  const today = new Date();

  // Helper to categorize remaining days
  const getRemainingDays = (maturityDateStr: string) => {
    const matDate = new Date(maturityDateStr);
    return Math.ceil((matDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const categorizedFDRs = fdrs.map(f => {
    const days = getRemainingDays(f.maturityDate);
    let category = 'FUTURE';
    if (days < 0) category = 'OVERDUE';
    else if (days <= 7) category = '7D';
    else if (days <= 15) category = '15D';
    else if (days <= 30) category = '30D';
    return { ...f, remainingDays: days, category };
  });

  const filtered = categorizedFDRs.filter(f => {
    if (filterWindow === 'ALL') return true;
    return f.category === filterWindow;
  });

  const overdueCount = categorizedFDRs.filter(f => f.category === 'OVERDUE').length;
  const critical7dCount = categorizedFDRs.filter(f => f.category === '7D').length;
  const urgent15dCount = categorizedFDRs.filter(f => f.category === '15D').length;
  const warning30dCount = categorizedFDRs.filter(f => f.category === '30D').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            <span>Maturity Timeline & Renewal Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated monitoring of 30-day, 15-day, 7-day maturity windows, renewals, and overdue guarantees.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Running Scanner...' : 'Execute Maturity Scanner'}
        </button>
      </div>

      {scanResult && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanResult}</span>
        </div>
      )}

      {/* Metric Filter Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterWindow('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${filterWindow === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">All Lodged</span>
          <div className="text-lg font-extrabold mt-1">{fdrs.length} Records</div>
        </button>

        <button
          onClick={() => setFilterWindow('7D')}
          className={`p-3 rounded-xl border text-left transition-all ${filterWindow === '7D' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Critical (≤ 7 Days)</span>
          <div className="text-lg font-extrabold text-red-600 mt-1" style={{ color: filterWindow === '7D' ? 'white' : undefined }}>
            {critical7dCount} Deposits
          </div>
        </button>

        <button
          onClick={() => setFilterWindow('15D')}
          className={`p-3 rounded-xl border text-left transition-all ${filterWindow === '15D' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Urgent (≤ 15 Days)</span>
          <div className="text-lg font-extrabold text-amber-600 mt-1" style={{ color: filterWindow === '15D' ? 'white' : undefined }}>
            {urgent15dCount} Deposits
          </div>
        </button>

        <button
          onClick={() => setFilterWindow('30D')}
          className={`p-3 rounded-xl border text-left transition-all ${filterWindow === '30D' ? 'bg-cyan-700 text-white border-cyan-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Notice (≤ 30 Days)</span>
          <div className="text-lg font-extrabold text-cyan-700 mt-1" style={{ color: filterWindow === '30D' ? 'white' : undefined }}>
            {warning30dCount} Deposits
          </div>
        </button>

        <button
          onClick={() => setFilterWindow('OVERDUE')}
          className={`p-3 rounded-xl border text-left transition-all ${filterWindow === 'OVERDUE' ? 'bg-purple-700 text-white border-purple-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Past Due / Matured</span>
          <div className="text-lg font-extrabold text-purple-700 mt-1" style={{ color: filterWindow === 'OVERDUE' ? 'white' : undefined }}>
            {overdueCount} Deposits
          </div>
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Deposit Maturity Schedule ({filtered.length})</span>
          <span className="text-[10px] text-slate-400">Current Reference Date: {today.toISOString().split('T')[0]}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading maturity schedule...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No deposits matching active maturity filter window.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(fdr => {
              const isOverdue = fdr.remainingDays < 0;
              return (
                <div key={fdr.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 ${isOverdue ? 'bg-purple-100 text-purple-800 border border-purple-300' : fdr.remainingDays <= 7 ? 'bg-red-100 text-red-800 border border-red-300' : fdr.remainingDays <= 15 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-teal-50 text-teal-800 border border-teal-200'}`}>
                      <span className="text-[10px] uppercase font-semibold leading-tight">
                        {isOverdue ? 'PAST' : 'DAYS'}
                      </span>
                      <span className="text-sm font-extrabold leading-tight">
                        {isOverdue ? Math.abs(fdr.remainingDays) : fdr.remainingDays}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{fdr.fdrNumber}</span>
                        <StatusBadge status={fdr.status} size="sm" />
                      </div>

                      <div className="text-xs font-semibold text-slate-800">{fdr.institutionName}</div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Bank: <strong>{fdr.bankName}</strong></span>
                        <span>Sum: <strong className="text-teal-800">₹{fdr.principalAmount.toLocaleString('en-IN')}</strong></span>
                        <span>Maturity: <strong className="text-slate-900">{fdr.maturityDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSendNotice(fdr.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      {noticeSentId === fdr.id ? 'Notice Dispatched ✓' : 'Send Renewal Notice'}
                    </button>

                    <Link
                      to={`/fdr/${fdr.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

