import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FDRRecord, BankVerificationAttempt, ReviewCase } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { BankVerifyModal } from '../components/BankVerifyModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import {
  FileText,
  Building,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Download,
  Hash,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertOctagon,
  Eye
} from 'lucide-react';

export const FDRDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, canVerify } = useAuth();

  const [fdr, setFdr] = useState<(FDRRecord & { bankAttempts: BankVerificationAttempt[]; reviewCase?: ReviewCase }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Status Action Modal State
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CORRECTION' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecord = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getFDR(id);
      setFdr(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  if (loading || !fdr) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading FDR Record {id}...</span>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!actionType) return;
    setActionLoading(true);

    let targetStatus = 'VERIFIED';
    if (actionType === 'REJECT') targetStatus = 'REJECTED';
    if (actionType === 'REQUEST_CORRECTION') targetStatus = 'NEEDS_CORRECTION';

    try {
      await api.updateFDRStatus(fdr.id, {
        status: targetStatus,
        reason: actionReason,
        actorName: user.name,
        actorRole: user.role
      });
      setActionType(null);
      setActionReason('');
      fetchRecord();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{fdr.fdrNumber}</h1>
              <StatusBadge status={fdr.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Record ID: <span className="font-mono">{fdr.id}</span> • Registered on {new Date(fdr.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDocModal(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Inspect Certificate
          </button>

          <button
            onClick={() => setShowBankModal(true)}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify with Bank CBS
          </button>

          {canVerify && fdr.status !== 'VERIFIED' && (
            <button
              onClick={() => setActionType('APPROVE')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Deposit
            </button>
          )}

          {canVerify && fdr.status !== 'REJECTED' && (
            <button
              onClick={() => setActionType('REQUEST_CORRECTION')}
              className="px-3 py-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Request Correction
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy Alert Banner (If flagged) */}
      {fdr.flags && fdr.flags.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs space-y-2 text-rose-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Flagged for Review: {fdr.flags.length} Potential Discrepancy Item(s)</span>
            </div>
            {fdr.reviewCase && (
              <Link
                to={`/fraud-review?caseId=${fdr.reviewCase.id}`}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm"
              >
                Open Review Case {fdr.reviewCase.id} <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="space-y-1.5 pl-7">
            {fdr.flags.map(f => (
              <div key={f.id} className="text-xs">
                <strong>{f.title}:</strong> <span className="text-rose-700">{f.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Details + Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Deposit Core Financials */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Fixed Deposit Core Financial Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Principal Sum</span>
                <span className="text-base font-extrabold text-teal-800">
                  ₹{fdr.principalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Interest Rate</span>
                <span className="text-sm font-bold text-slate-800">{fdr.interestRate}% p.a.</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issuing Scheduled Bank</span>
                <span className="text-sm font-semibold text-slate-800">{fdr.bankName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bank Branch</span>
                <span className="text-slate-800 font-medium">{fdr.bankBranch || 'Main Branch'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deposit Account (Masked)</span>
                <span className="font-mono text-slate-800 font-medium">{fdr.accountNumberMasked}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Receipt Reference</span>
                <span className="font-mono text-slate-800">{fdr.receiptReference}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date of Issuance</span>
                <span className="text-slate-800 font-medium">{fdr.issueDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Maturity Date</span>
                <span className="text-slate-800 font-bold">{fdr.maturityDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deposit Holder Title</span>
                <span className="text-slate-800 font-medium truncate block">{fdr.depositHolder}</span>
              </div>
            </div>
          </div>

          {/* Card: Institution Entity Profile */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Lodging Educational Institution</span>
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                AICTE: {fdr.institutionCode}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Institution Name</span>
                <span className="font-semibold text-slate-900 text-sm">{fdr.institutionName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Uploaded By</span>
                <span className="text-slate-800 font-medium">{fdr.uploadedBy} ({fdr.uploadedByRole})</span>
              </div>
            </div>
          </div>

          {/* Card: Core Banking Verification Attempt Log */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Core Banking System Verification History</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                {fdr.bankAttempts?.length || 0} Attempt(s) Logged
              </span>
            </div>

            {(!fdr.bankAttempts || fdr.bankAttempts.length === 0) ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No bank verification attempts logged yet. Click "Verify with Bank CBS" above to initiate.
              </div>
            ) : (
              <div className="space-y-3">
                {fdr.bankAttempts.map(att => (
                  <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {att.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        {att.status} ({att.responseCode})
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(att.attemptedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{att.responseMessage}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Attempt ID: {att.id} • Officer: {att.attemptedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Document & Cryptographic Integrity Card */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Document Authenticity & Hash
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attached File</span>
                <span className="font-medium text-slate-800 break-all">{fdr.documentFileName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">SHA-256 Checksum</span>
                <div className="font-mono text-[10px] bg-slate-100 p-2 rounded text-slate-700 break-all select-all border border-slate-200">
                  {fdr.documentHash}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">OCR Optical Engine</span>
                <span className="text-slate-800">{fdr.ocrData?.engine || 'Standard OCR Parser'}</span>
                {fdr.ocrData && (
                  <div className="mt-1 flex items-center gap-1.5 text-teal-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Extraction Confidence: {fdr.ocrData.overallConfidence}%
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  to={`/ocr-review?fdrId=${fdr.id}`}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Field-by-Field OCR Inspection
                </Link>
              </div>
            </div>
          </div>

          {/* Audit Verification Stamp */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>AICTE Lien Endorsement</span>
            </div>
            <p className="text-[11px] text-slate-600">
              In accordance with AICTE Approval Process Handbook (APH), this security deposit is under irrevocable lien to AICTE and cannot be encashed without prior Council sanction.
            </p>
          </div>
        </div>
      </div>

      {/* Action Dialog (Approve / Reject / Correction) */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm">
              {actionType === 'APPROVE' && 'Confirm FDR Approval'}
              {actionType === 'REJECT' && 'Confirm FDR Rejection'}
              {actionType === 'REQUEST_CORRECTION' && 'Request Institutional Correction'}
            </h3>

            <p className="text-xs text-slate-600">
              {actionType === 'APPROVE' && 'Approve this deposit certificate as authentic, active, and compliant.'}
              {actionType === 'REJECT' && 'Reject this deposit record. Provide formal justification for the official record.'}
              {actionType === 'REQUEST_CORRECTION' && 'Specify what correction or replacement scan the educational institution must provide.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Reviewer Notes / Justification:
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter justification for the audit trail..."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors ${actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : actionType === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {actionLoading ? 'Updating...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showBankModal && (
        <BankVerifyModal
          fdr={fdr}
          isOpen={true}
          onClose={() => setShowBankModal(false)}
          onVerified={() => {
            fetchRecord();
          }}
        />
      )}

      {showDocModal && (
        <DocumentViewerModal
          fdr={fdr}
          isOpen={true}
          onClose={() => setShowDocModal(false)}
        />
      )}
    </div>
  );
};

