import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FDRRecord, Institution } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { BankVerifyModal } from '../components/BankVerifyModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import {
  Search,
  Filter,
  Download,
  Eye,
  Building,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegistryPage: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [selectedInst, setSelectedInst] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [activeBankVerifyFDR, setActiveBankVerifyFDR] = useState<FDRRecord | null>(null);
  const [activeDocViewerFDR, setActiveDocViewerFDR] = useState<FDRRecord | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fdrData, instData] = await Promise.all([
        api.getFDRs({
          q: searchQuery,
          status: selectedStatus,
          bank: selectedBank,
          institutionId: selectedInst,
          sortBy,
          sortOrder
        }),
        api.getInstitutions()
      ]);
      setFdrs(fdrData);
      setInstitutions(instData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedBank, selectedInst, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const banks = Array.from(new Set(fdrs.map(f => f.bankName))).filter(Boolean);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">National FDR Central Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and audit all educational institution security deposit records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export-csv?type=all"
            download
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </a>
          <Link
            to="/upload"
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload FDR
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by FDR number, institution name, bank name, or receipt ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="FLAGGED_FOR_REVIEW">Flagged for Review</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="MATURED">Matured / Expired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="ALL">All Scheduled Banks</option>
              {banks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Institution Filter */}
          <div>
            <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Institution</label>
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="ALL">All Institutions</option>
              {institutions.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Sort Ordering</label>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so as any);
              }}
              className="w-full p-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="createdAt_desc">Latest Submission</option>
              <option value="createdAt_asc">Oldest Submission</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="maturity_asc">Maturity Date: Upcoming First</option>
              <option value="maturity_desc">Maturity Date: Furthest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{fdrs.length}</strong> security deposit records</span>
          <button onClick={fetchData} className="flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
            <span>Retrieving FDR records...</span>
          </div>
        ) : fdrs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No Fixed Deposit records matching active search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Record ID / FDR No</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Bank & Branch</th>
                  <th className="py-3 px-4">Principal Amount</th>
                  <th className="py-3 px-4">Maturity Date</th>
                  <th className="py-3 px-4">Account (Masked)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fdrs.map((fdr) => (
                  <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{fdr.fdrNumber}</span>
                      <span className="text-[10px] font-mono text-slate-400">{fdr.id}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <span className="font-semibold text-slate-900 block truncate" title={fdr.institutionName}>
                        {fdr.institutionName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Code: {fdr.institutionCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{fdr.bankName}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">{fdr.bankBranch}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{fdr.principalAmount.toLocaleString('en-IN')}
                      <span className="text-[10px] font-normal text-slate-400 block">@ {fdr.interestRate}% p.a.</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{fdr.maturityDate}</span>
                      <span className="text-[10px] text-slate-400 block">Issued: {fdr.issueDate}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {fdr.accountNumberMasked}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={fdr.status} size="sm" />
                        {fdr.flags && fdr.flags.length > 0 && (
                          <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {fdr.flags.length} flag(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/fdr/${fdr.id}`}
                          title="View Full Details"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setActiveDocViewerFDR(fdr)}
                          title="Inspect Document & Checksum"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-teal-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveBankVerifyFDR(fdr)}
                          title="Core Banking Verification"
                          className="p-1.5 rounded hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeBankVerifyFDR && (
        <BankVerifyModal
          fdr={activeBankVerifyFDR}
          isOpen={true}
          onClose={() => setActiveBankVerifyFDR(null)}
          onVerified={() => {
            fetchData();
          }}
        />
      )}

      {activeDocViewerFDR && (
        <DocumentViewerModal
          fdr={activeDocViewerFDR}
          isOpen={true}
          onClose={() => setActiveDocViewerFDR(null)}
        />
      )}
    </div>
  );
};

