import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FDRRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { BankVerifyModal } from '../components/BankVerifyModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import {
  CheckSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileEdit,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
  RefreshCw,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerificationQueuePage: React.FC = () => {
  const { user, canVerify } = useAuth();
  const [queue, setQueue] = useState<FDRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeBankVerifyFDR, setActiveBankVerifyFDR] = useState<FDRRecord | null>(null);
  const [activeDocViewerFDR, setActiveDocViewerFDR] = useState<FDRRecord | null>(null);

  // Action dialog
  const [actionRecord, setActionRecord] = useState<FDRRecord | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CORRECTION' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const records = await api.getFDRs({ status: 'PENDING_VERIFICATION' });
      setQueue(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleActionSubmit = async () => {
    if (!actionRecord || !actionType) return;
    setActionLoading(true);

    let targetStatus = 'VERIFIED';
    if (actionType === 'REJECT') targetStatus = 'REJECTED';
    if (actionType === 'REQUEST_CORRECTION') targetStatus = 'NEEDS_CORRECTION';

    try {
      await api.updateFDRStatus(actionRecord.id, {
        status: targetStatus,
        reason: actionReason,
        actorName: user.name,
        actorRole: user.role
      });
      setActionRecord(null);
      setActionType(null);
      setActionReason('');
      fetchQueue();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPendingValue = queue.reduce((sum, f) => sum + f.principalAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AICTE Officer Verification Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active lodgements awaiting scheduled commercial bank confirmation and officer sanction.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deposits Pending</span>
            <div className="text-xl font-extrabold text-slate-900">{queue.length} Records</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Pending Value</span>
            <div className="text-xl font-extrabold text-teal-800">
              ₹{(totalPendingValue / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Review Mode</span>
            <div className="text-xs font-bold text-slate-800">Core Banking Real-Time SLA</div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Deposits Requiring Administrative Review</span>
          <span className="text-slate-400 font-normal">Sorted by oldest lodgement date</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
            <span>Loading verification queue items...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Verification Queue Cleared!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted FDRs have been verified or escalated to discrepancy investigation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map(fdr => (
              <div key={fdr.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">{fdr.fdrNumber}</span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {fdr.id}
                    </span>
                    <StatusBadge status={fdr.status} size="sm" />
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-800">{fdr.institutionName}</span>
                    <span>Bank: <strong>{fdr.bankName}</strong> ({fdr.bankBranch})</span>
                    <span>Amount: <strong className="text-teal-800 font-bold">₹{fdr.principalAmount.toLocaleString('en-IN')}</strong></span>
                    <span>Matures: <strong>{fdr.maturityDate}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Uploaded by {fdr.uploadedBy} on {new Date(fdr.createdAt).toLocaleDateString()}</span>
                    <span>Account: {fdr.accountNumberMasked}</span>
                  </div>
                </div>

                {/* Inline Action Triggers */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveDocViewerFDR(fdr)}
                    title="Inspect Attached Certificate"
                    className="p-2 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    Scan
                  </button>

                  <button
                    onClick={() => setActiveBankVerifyFDR(fdr)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify with Bank
                  </button>

                  {canVerify && (
                    <>
                      <button
                        onClick={() => {
                          setActionRecord(fdr);
                          setActionType('APPROVE');
                        }}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors"
                        title="Approve directly"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setActionRecord(fdr);
                          setActionType('REQUEST_CORRECTION');
                        }}
                        className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 transition-colors"
                        title="Request Correction"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <Link
                    to={`/fdr/${fdr.id}`}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-white text-slate-600 transition-colors"
                    title="Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {actionRecord && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              {actionType === 'APPROVE' && `Confirm Approval: ${actionRecord.fdrNumber}`}
              {actionType === 'REQUEST_CORRECTION' && `Request Correction: ${actionRecord.fdrNumber}`}
            </h3>

            <p className="text-xs text-slate-600">
              {actionType === 'APPROVE' && 'Sanction and mark this fixed deposit receipt as officially verified.'}
              {actionType === 'REQUEST_CORRECTION' && 'Notify the college administrator to furnish an amended scan or clarification.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Notes / Instructions:
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
                onClick={() => {
                  setActionRecord(null);
                  setActionType(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors ${actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {actionLoading ? 'Updating...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeBankVerifyFDR && (
        <BankVerifyModal
          fdr={activeBankVerifyFDR}
          isOpen={true}
          onClose={() => setActiveBankVerifyFDR(null)}
          onVerified={() => {
            fetchQueue();
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

