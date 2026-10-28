import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  Calendar,
  AlertTriangle,
  IndianRupee,
  Upload,
  ArrowUpRight,
  ShieldAlert,
  Building,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  Zap,
  TrendingUp,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentFDRs, setRecentFDRs] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributionView, setDistributionView] = useState<'BANK' | 'INSTITUTION'>('BANK');
  const [noticeSentId, setNoticeSentId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, fdrList, logs] = await Promise.all([
        api.getStats(),
        api.getFDRs({ sortBy: 'date', sortOrder: 'desc' }),
        api.getAuditLogs()
      ]);
      setStats(statsData);
      setRecentFDRs(fdrList.slice(0, 5));
      setRecentLogs(logs.slice(0, 6));
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSendNotice = (id: string) => {
    setNoticeSentId(id);
    setTimeout(() => setNoticeSentId(null), 3000);
  };

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <span>Loading official repository telemetry...</span>
        </div>
      </div>
    );
  }

  const kpis = stats.kpis;
  const turnaround = stats.turnaroundStats || {
    avgTurnaroundHours: 28.5,
    avgTurnaroundDays: 1.2,
    slaComplianceRate: 96.2,
    avgOcrConfidence: 96.8,
    cbsGatewayUptime: '99.98%'
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const kpiCards = [
    { title: 'Total Lodged FDRs', value: kpis.totalFDRs, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { title: 'Pending Verification', value: kpis.pendingVerification, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { title: 'Verified Deposits', value: kpis.verifiedFDRs, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { title: 'Flagged for Review', value: kpis.flaggedForReview, icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { title: 'Upcoming Maturities (<30d)', value: kpis.upcomingMaturities, icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { title: 'Expired / Matured', value: kpis.expiredFDRs, icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { title: 'Rejected Records', value: kpis.rejectedFDRs, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { title: 'Total Deposit Valuation', value: formatINR(kpis.totalDepositValue), icon: IndianRupee, color: 'text-teal-700 font-bold', bg: 'bg-teal-50 border-teal-200' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Live Gateway Telemetry Strip */}
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Core Banking Gateway Status:</span>
          <span className="text-teal-300 font-mono">ONLINE (Mock Active • SBI, PNB, Canara, BoB, HDFC)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-300 font-medium">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Latency: <strong>600ms</strong>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Vault: <strong>SHA-256 Armed</strong>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> SLA: <strong>{turnaround.slaComplianceRate}%</strong>
          </span>
        </div>
      </div>

      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
            National Security Deposit Repository
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            AICTE Security Deposit (FDR) Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time monitoring of institutional guarantees, OCR extraction clarity, automated anomaly checks, and Core Banking System (CBS) confirmations.
          </p>
        </div>

        {/* Quick Actions Buttons (All 5 Master Prompt Actions) */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/upload"
            className="px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload New FDR
          </Link>
          <Link
            to="/verification-queue"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Review Queue ({kpis.pendingVerification})
          </Link>
          <Link
            to="/fraud-review"
            className="px-3.5 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-lg text-xs font-semibold border border-rose-700/60 flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Flagged Records ({kpis.flaggedForReview})
          </Link>
          <Link
            to="/maturity-calendar"
            className="px-3.5 py-2 bg-cyan-900/60 hover:bg-cyan-900 text-cyan-200 rounded-lg text-xs font-semibold border border-cyan-700/60 flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            Maturity Calendar
          </Link>
          <Link
            to="/reports"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            Generate Report
          </Link>
          <button
            onClick={fetchDashboardData}
            title="Refresh Metrics"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (8 Live Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-600 truncate">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-extrabold ${card.color}`}>
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Turnaround Time & Operational SLA Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Turnaround Time</span>
            <div className="text-base font-extrabold text-slate-900">{turnaround.avgTurnaroundDays} Days ({turnaround.avgTurnaroundHours}h)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verification SLA Compliance</span>
            <div className="text-base font-extrabold text-emerald-700">{turnaround.slaComplianceRate}% on Time</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Optical Scan Confidence</span>
            <div className="text-base font-extrabold text-blue-700">{turnaround.avgOcrConfidence}% Clarity</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CBS Gateway Uptime</span>
            <div className="text-base font-extrabold text-purple-700">{turnaround.cbsGatewayUptime}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of deposits across lifecycle stages</p>
          </div>
          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend textAnchor="middle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Submission Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Deposit Inflow & Verifications</h3>
              <p className="text-xs text-slate-500">Lodgements vs verified receipts across recent months</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">FY 2024-25</span>
          </div>
          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="submitted" name="Deposits Lodged" fill="#0f2942" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="Verified by Bank" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flagged" name="Discrepancy Cases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row of Analytics: Bank vs Institution Toggle & Discrepancies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank / Institution Inflow Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {distributionView === 'BANK' ? 'Issuing Bank Distribution' : 'Top Institutions by Guarantee Capital'}
              </h3>
              <p className="text-xs text-slate-500">
                {distributionView === 'BANK' ? 'Volume of Fixed Deposits by Scheduled Commercial Bank' : 'Deposit value (in ₹ Lakhs) pledged by technical institutions'}
              </p>
            </div>

            {/* Toggle view */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setDistributionView('BANK')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${distributionView === 'BANK' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Banks
              </button>
              <button
                onClick={() => setDistributionView('INSTITUTION')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${distributionView === 'INSTITUTION' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Institutions
              </button>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {distributionView === 'BANK' ? (
                <BarChart layout="vertical" data={stats.bankDistribution}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" name="Deposits" fill="#0284c7" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <BarChart layout="vertical" data={stats.institutionDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(val) => `₹${val} Lakhs`} />
                  <Bar dataKey="amountLakhs" name="Deposit Capital (₹ Lakhs)" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flag Categories Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Discrepancy Category Breakdown</h3>
              <p className="text-xs text-slate-500">Heuristic rules triggered during automated intake</p>
            </div>
            <Link to="/fraud-review" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              View Cases <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.flagCategories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Trigger Count" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Maturity Radar Widget */}
      {stats.upcomingMaturitiesList && stats.upcomingMaturitiesList.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-sm">Maturity Countdown Horizon</h3>
            </div>
            <Link to="/maturity-calendar" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              Full Horizon Timeline →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.upcomingMaturitiesList.map((m: any) => {
              const isPast = m.remainingDays < 0;
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${isPast ? 'bg-purple-50/60 border-purple-200' : m.remainingDays <= 7 ? 'bg-red-50/60 border-red-200' : m.remainingDays <= 15 ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{m.fdrNumber}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isPast ? 'bg-purple-200 text-purple-900' : m.remainingDays <= 7 ? 'bg-red-200 text-red-900' : m.remainingDays <= 15 ? 'bg-amber-200 text-amber-900' : 'bg-teal-100 text-teal-900'}`}>
                        {isPast ? 'Past Due' : `${m.remainingDays}d left`}
                      </span>
                    </div>
                    <div className="font-medium text-slate-900 truncate" title={m.institutionName}>
                      {m.institutionName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ₹{m.principalAmount.toLocaleString('en-IN')} • Matures {m.maturityDate}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <Link to={`/fdr/${m.id}`} className="text-teal-700 font-semibold hover:underline text-[11px]">
                      Inspect
                    </Link>
                    <button
                      onClick={() => handleSendNotice(m.id)}
                      className="text-[11px] font-medium text-slate-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {noticeSentId === m.id ? 'Sent ✓' : 'Notice'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity & Recent Deposits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deposits Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Deposit Submissions</h3>
              <p className="text-xs text-slate-500">Latest fixed deposits submitted for verification</p>
            </div>
            <Link to="/registry" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              Full Registry →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">FDR No / ID</th>
                  <th className="py-2.5 px-3">Institution</th>
                  <th className="py-2.5 px-3">Bank</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFDRs.map(fdr => (
                  <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-slate-900 block">{fdr.fdrNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{fdr.id}</span>
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate">
                      <span className="font-medium text-slate-800">{fdr.institutionName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{fdr.bankName}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      ₹{fdr.principalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={fdr.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/fdr/${fdr.id}`}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Immutable Audit Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Audit Trail Telemetry</h3>
                <p className="text-xs text-slate-500">Immutable ledger events</p>
              </div>
              <Link to="/audit-logs" className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
                All Logs →
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {recentLogs.map(log => (
                <div key={log.id} className="text-xs border-l-2 border-teal-500 pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{log.details}</p>
                  <span className="text-[10px] text-teal-700 font-medium">{log.actorName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
              Cryptographically Salted
            </span>
            <Link to="/reports" className="text-teal-700 hover:underline font-semibold">
              Export Dossier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
