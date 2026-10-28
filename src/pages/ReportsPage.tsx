import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FDRRecord } from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFDRs(), api.getStats()]).then(([fdrData, statsData]) => {
      setFdrs(fdrData);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exportOptions = [
    {
      title: 'Complete Central FDR Registry',
      desc: 'All security deposits lodged across all colleges with bank details and amounts.',
      type: 'all',
      filename: 'SmartFDR_All_Records.csv'
    },
    {
      title: 'Pending Officer Verification Queue',
      desc: 'Deposits currently in verification awaiting bank confirmation.',
      type: 'pending',
      filename: 'SmartFDR_Pending_Queue.csv'
    },
    {
      title: 'Approved & Verified Deposits Ledger',
      desc: 'Audited records with verified bank CBS confirmation timestamps.',
      type: 'verified',
      filename: 'SmartFDR_Verified_Ledger.csv'
    },
    {
      title: 'Flagged Discrepancy & Fraud Review Dossier',
      desc: 'Deposits with identified rule violations or optical discrepancies.',
      type: 'flagged',
      filename: 'SmartFDR_Flagged_Discrepancies.csv'
    },
    {
      title: 'Institution Directory & Compliance Summary',
      desc: 'Institution wise FDR tally, total valuation, and compliance status.',
      type: 'institutions',
      filename: 'SmartFDR_Institutions_Compliance.csv'
    },
    {
      title: 'Cryptographic Immutable Audit Trail',
      desc: 'Append-only ledger of all officer logins, approvals, uploads, and bank checks.',
      type: 'audit',
      filename: 'SmartFDR_Audit_Logs.csv'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <span>Reports & Statutory Export Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download filtered datasets in CSV format or generate formal print-ready AICTE audit sheets.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Audit Sheet
        </button>
      </div>

      {/* CSV Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((opt, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{opt.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">CSV FORMAT</span>
              <a
                href={`/api/reports/export-csv?type=${opt.type}`}
                download={opt.filename}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Formal Printable Audit Sheet Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 print:border-none print:shadow-none">
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-bold text-2xl flex items-center justify-center">
              ₹
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                All India Council for Technical Education (AICTE)
              </h2>
              <p className="text-xs text-slate-600">
                Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 • Statutory Security Deposit Dossier
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 block font-mono">FORM: AICTE-FDR-AUD-2026</span>
            <span className="text-slate-500">Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Audit Sheet Summary Cards */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Total Deposits:</span>
            <span className="font-bold text-slate-900 text-sm">{stats?.kpis?.totalFDRs || 0} Records</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Verified Total:</span>
            <span className="font-bold text-emerald-700 text-sm">{stats?.kpis?.verifiedFDRs || 0} Deposits</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Flagged for Review:</span>
            <span className="font-bold text-rose-700 text-sm">{stats?.kpis?.flaggedForReview || 0} Items</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Aggregate Value:</span>
            <span className="font-bold text-teal-800 text-sm">
              ₹{((stats?.kpis?.totalDepositValue || 0) / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>

        {/* Certified Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 border-r border-slate-200">Record ID</th>
                <th className="py-2 px-3 border-r border-slate-200">Institution & AICTE Code</th>
                <th className="py-2 px-3 border-r border-slate-200">Issuing Bank</th>
                <th className="py-2 px-3 border-r border-slate-200">FDR Receipt No</th>
                <th className="py-2 px-3 border-r border-slate-200">Principal Sum</th>
                <th className="py-2 px-3 border-r border-slate-200">Maturity Date</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fdrs.map(f => (
                <tr key={f.id} className="text-[11px]">
                  <td className="py-2 px-3 font-mono border-r border-slate-200">{f.id}</td>
                  <td className="py-2 px-3 font-medium border-r border-slate-200 max-w-[200px] truncate">
                    {f.institutionName} ({f.institutionCode})
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">{f.bankName}</td>
                  <td className="py-2 px-3 font-mono border-r border-slate-200">{f.fdrNumber}</td>
                  <td className="py-2 px-3 font-bold border-r border-slate-200">₹{f.principalAmount.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 border-r border-slate-200">{f.maturityDate}</td>
                  <td className="py-2 px-3 font-semibold">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footer */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 w-48 mb-1" />
            <span className="font-semibold text-slate-800">Finance & Accounts Verification Officer</span>
            <p className="text-[10px] text-slate-500">All India Council for Technical Education</p>
          </div>

          <div className="text-right">
            <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
            <span className="font-semibold text-slate-800">Authorized Financial Auditor</span>
            <p className="text-[10px] text-slate-500">Office of the Comptroller and Auditor General</p>
          </div>
        </div>
      </div>
    </div>
  );
};

