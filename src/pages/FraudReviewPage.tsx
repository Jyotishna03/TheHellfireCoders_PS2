import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReviewCase, FDRRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { SeverityBadge } from '../components/StatusBadge';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import {
  AlertOctagon,
  ShieldAlert,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  UserCheck,
  Send,
  Eye,
  Info,
  Clock,
  RefreshCw,
  FolderLock
} from 'lucide-react';

export const FraudReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCaseId = searchParams.get('caseId');
  const { user, canReviewFraud } = useAuth();

  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(urlCaseId || '');
  const [loading, setLoading] = useState(true);
  const [activeCaseDetails, setActiveCaseDetails] = useState<any>(null);

  // Note form
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<string>('RESOLVE_APPROVE');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Document preview
  const [viewDocFDR, setViewDocFDR] = useState<FDRRecord | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await api.getReviewCases();
      setCases(data);
      if (!selectedCaseId && data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchActiveCase = async (id: string) => {
    if (!id) return;
    try {
      const data = await api.getReviewCase(id);
      setActiveCaseDetails(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedCaseId) {
      fetchActiveCase(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCaseId) return;
    setAddingNote(true);

    try {
      await api.addReviewNote(selectedCaseId, {
        author: user.name,
        role: user.role,
        text: newNoteText.trim()
      });
      setNewNoteText('');
      fetchActiveCase(selectedCaseId);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingNote(false);
    }
  };

  const handleExecuteDecision = async () => {
    if (!selectedCaseId || !decisionReason.trim()) return;
    setDecisionLoading(true);

    try {
      await api.decideReviewCase(selectedCaseId, {
        action: decisionAction,
        reason: decisionReason,
        decidedBy: `${user.name} (${user.role})`
      });
      setDecisionModalOpen(false);
      setDecisionReason('');
      fetchActiveCase(selectedCaseId);
      fetchCases();
    } catch (e) {
      console.error(e);
    } finally {
      setDecisionLoading(false);
    }
  };

  const c = activeCaseDetails;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Fraud-Safety Principle Banner */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Dedicated Discrepancy & Fraud Review Workspace</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Case-managed investigations with cryptographic evidence comparisons and non-accusatory adjudication.
            </p>
          </div>

          <button
            onClick={fetchCases}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Cases
          </button>
        </div>

        {/* Mandatory Fraud Safety Principle Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-950 block">AICTE Fraud-Safety Standard Operating Procedure:</strong>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              A metadata disparity, OCR read error, CBS gateway timeout, or duplicate candidate is <strong>NOT proof of fraud</strong>. Standard statutory terminology must strictly be <em>"Potential Discrepancy"</em>, <em>"Unable to Verify"</em>, or <em>"Requires Administrative Clarification"</em>. Never accuse an institution or individual without documented multi-officer review and formal bank certification.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Cases List on Left, Active Case Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Index List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">Open Discrepancy Cases ({cases.length})</span>
            <span className="text-[10px] text-slate-400 font-mono">Index</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active discrepancy cases.</div>
            ) : (
              cases.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1.5 ${item.id === selectedCaseId ? 'bg-teal-50/80 border-l-4 border-teal-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{item.id}</span>
                    <SeverityBadge severity={item.severity} />
                  </div>

                  <p className="font-semibold text-slate-800 line-clamp-1">{item.institutionName}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">FDR: {item.fdrNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${item.status.startsWith('RESOLVED') ? 'bg-emerald-100 text-emerald-800' : item.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Columns: Selected Case Detail & Investigation Bench */}
        <div className="lg:col-span-2 space-y-6">
          {c ? (
            <div className="space-y-6">
              {/* Case Header Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-mono">{c.id}</span>
                      <SeverityBadge severity={c.severity} />
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold font-mono">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Detected on {new Date(c.detectedAt).toLocaleString()} • Trigger Rule: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700">{c.ruleTriggered}</code>
                    </p>
                  </div>

                  {canReviewFraud && !c.decision && (
                    <button
                      onClick={() => setDecisionModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Record Decision / Adjudicate
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Educational Entity:</span>
                    <span className="font-semibold text-slate-800">{c.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target FDR Number:</span>
                    <Link to={`/fdr/${c.fdrId}`} className="font-mono text-teal-700 hover:underline font-bold">
                      {c.fdrNumber} ↗
                    </Link>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Desk:</span>
                    <span className="text-slate-700 font-medium">{c.assignedTo || 'AICTE Review Queue'}</span>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence Comparison Grid */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Field-Level Forensic Evidence Comparison</h3>
                  {c.fdr && (
                    <button
                      onClick={() => setViewDocFDR(c.fdr)}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Open Uploaded Document
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Field Param</th>
                        <th className="py-2 px-3">Entered / Submitted Value</th>
                        <th className="py-2 px-3">Comparison / Extracted Source</th>
                        <th className="py-2 px-3">Investigator Forensic Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {c.supportingEvidence?.map((ev: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{ev.field}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{ev.enteredValue}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-700 font-medium">{ev.comparisonValue}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">{ev.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Final Decision Stamp (if adjudicated) */}
              {c.decision && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs space-y-2 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Formal Case Resolution: {c.decision.action}
                    </span>
                    <span className="text-[10px] text-emerald-700">{new Date(c.decision.decidedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-emerald-900">
                    <strong>Adjudication Reason:</strong> {c.decision.reason}
                  </p>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    Adjudicated by: {c.decision.decidedBy}
                  </div>
                </div>
              )}

              {/* Reviewer Investigation Notes Thread */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Reviewer Notes & Action Trail
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {(!c.notes || c.notes.length === 0) ? (
                    <div className="text-slate-400 text-xs text-center py-4">No notes recorded yet.</div>
                  ) : (
                    c.notes.map((n: any) => (
                      <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{n.author} ({n.role})</span>
                          <span className="text-slate-400 text-[10px]">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add an investigation note, bank callback confirmation, or query..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNoteText.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Add Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              Select a discrepancy case from the index to inspect evidence.
            </div>
          )}
        </div>
      </div>

      {/* Decision Recording Modal */}
      {decisionModalOpen && c && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm">Record Case Adjudication: {c.id}</h3>
            <p className="text-xs text-slate-500">
              Select the final administrative action to resolve this discrepancy case.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Adjudication Decision:</label>
              <select
                value={decisionAction}
                onChange={(e) => setDecisionAction(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="RESOLVE_APPROVE">Resolve as Valid (Satisfactorily Explained & Approved)</option>
                <option value="REQUEST_INFO">Request Institutional Clarification / Correction</option>
                <option value="ESCALATE">Escalate to AICTE Vigilance Cell</option>
                <option value="RESOLVE_REJECT">Reject Deposit & Issue Cause Notice</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 block">
                Official Decision Justification <span className="text-red-500">*</span>:
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="State the formal reasoning, reference to trust deeds, or bank communications..."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDecisionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDecision}
                disabled={decisionLoading || !decisionReason.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
              >
                {decisionLoading ? 'Submitting...' : 'Record Final Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {viewDocFDR && (
        <DocumentViewerModal
          fdr={viewDocFDR}
          isOpen={true}
          onClose={() => setViewDocFDR(null)}
        />
      )}
    </div>
  );
};

