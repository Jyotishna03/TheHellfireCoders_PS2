import React from 'react';
import {
  HelpCircle,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  AlertOctagon,
  Clock,
  ArrowRight,
  Download,
  Terminal,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpPage: React.FC = () => {
  const steps = [
    {
      title: 'Step 1: Role-Based Intake as College Admin',
      actor: 'College Administrator (Dr. Sneha Kulkarni)',
      desc: 'Switch role to College Admin in top header. Navigate to "Upload New FDR". Select R.V. College of Engineering, attach a scanned certificate, run the optical layout OCR engine, and observe automated validation of positive sums, dates, and SHA-256 duplicate checking.',
      targetUrl: '/upload',
      targetLabel: 'Try Upload Flow'
    },
    {
      title: 'Step 2: AICTE Officer Queue & Bank CBS Check',
      actor: 'AICTE Approval Officer (Rajiv Kumar)',
      desc: 'Switch role to AICTE Officer. Open "Verification Queue" to see pending security deposits. Click "Verify with Bank" to execute a simulated Core Banking API call against State Bank of India. Choose Success (200) to mark as verified, or Mismatch (409) to observe discrepancy handling.',
      targetUrl: '/verification-queue',
      targetLabel: 'Open Verification Queue'
    },
    {
      title: 'Step 3: Dedicated Fraud & Discrepancy Investigation',
      actor: 'AICTE Officer or Auditor',
      desc: 'Open "Fraud & Discrepancies" workspace. Inspect CASE-2026-003 where an identical PDF file hash was detected on a dual lodgement attempt. Review supporting evidence, note thread, and adjudicate with formal non-accusatory language ("Potential Discrepancy").',
      targetUrl: '/fraud-review',
      targetLabel: 'Inspect Discrepancy Cases'
    },
    {
      title: 'Step 4: Maturity Horizon & Alert Deduplication',
      actor: 'AICTE Officer & College Admin',
      desc: 'Navigate to "Maturity Calendar". Notice deposits filtered into 30-day, 15-day, 7-day, and overdue buckets. Click "Execute Maturity Scanner" to run the temporal monitoring engine and generate deduplicated in-app notifications.',
      targetUrl: '/maturity-calendar',
      targetLabel: 'Open Maturity Calendar'
    },
    {
      title: 'Step 5: Statutory Reports & Immutable Audit Trail',
      actor: 'Auditor (Vinod Sharma - CAG)',
      desc: 'Switch role to Auditor. Open "Reports & Exports" to download CSV registries or print the formal AICTE Security Deposit Dossier with official seals. Open "Audit Logs" to view the tamper-evident ledger tracking every actor, timestamp, and hash.',
      targetUrl: '/reports',
      targetLabel: 'View Reports & Exports'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Hackathon Evaluation & Jury Guide</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          SmartFDR Portal User Guide & Live Demo Script
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step walkthrough script for jury demonstration, architectural overview, and statutory FAQ.
        </p>
      </div>

      {/* 5-Minute Hackathon Demonstration Script */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-teal-600" />
              <span>5-Minute End-to-End Demonstration Script for Jury</span>
            </h2>
            <p className="text-xs text-slate-500">
              Follow these sequential actions to present all core capabilities to hackathon evaluators.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            Jury Walkthrough
          </span>
        </div>

        <div className="space-y-4">
          {steps.map((st, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-xs">{st.title}</span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Role: {st.actor}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              <div className="pt-1">
                <Link
                  to={st.targetUrl}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  {st.targetLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Fraud Prevention & Safety Standard</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            AICTE guidelines mandate that automated rule anomalies and optical misreads must never prematurely accuse institutions. Every flag generates a <em>"Potential Discrepancy"</em> case requiring authorized officer investigation and bank core-banking reconciliation.
          </p>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium">
            Supported checks: Exact duplicate receipts, document hash collisions (SHA-256), date inverted anomalies, negative amounts, and name mismatches.
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Mock Bank Core Banking (CBS) Adapter</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform provides a modular simulation gateway for Scheduled Commercial Banks (SBI, PNB, Canara, BoB, HDFC) with configurable response codes (200 OK, 409 Mismatch, 504 Timeout, 503 Maintenance) and masked account payload privacy.
          </p>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium">
            Easily swappable with authorized production banking APIs (NPCI/RBI Open Banking / SFMS gateway).
          </div>
        </div>
      </div>
    </div>
  );
};

