import React, { useState } from 'react';
import { FDRRecord, BankVerificationAttempt } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building, ShieldCheck, AlertTriangle, Clock, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface BankVerifyModalProps {
  fdr: FDRRecord;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (updatedFdr: FDRRecord, attempt: BankVerificationAttempt) => void;
}

export const BankVerifyModal: React.FC<BankVerifyModalProps> = ({ fdr, isOpen, onClose, onVerified }) => {
  const { user } = useAuth();
  const [simulationMode, setSimulationMode] = useState<string>('AUTO_SUCCESS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ attempt: BankVerificationAttempt; fdr: FDRRecord } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunVerification = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate real-world roundtrip latency
      await new Promise(r => setTimeout(r, 600));
      const res = await api.verifyBank(fdr.id, {
        simulationMode,
        requestedBy: user.name
      });
      setResult(res);
      onVerified(res.fdr, res.attempt);
    } catch (err: any) {
      setError(err.message || 'Bank gateway request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-semibold text-sm">Core Banking System (CBS) Verification</h3>
              <p className="text-[11px] text-slate-300">Target Bank: {fdr.bankName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulated Integration:</strong> This environment connects to a simulated Core Banking API adapter for hackathon evaluation.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Target Metadata Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">FDR Receipt No:</span>
              <span className="font-mono font-medium text-slate-800">{fdr.fdrNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Principal Deposit:</span>
              <span className="font-bold text-slate-900">₹{fdr.principalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Account Reference:</span>
              <span className="font-mono text-slate-700">{fdr.accountNumberMasked}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Beneficiary:</span>
              <span className="text-slate-800 truncate block">{fdr.institutionName}</span>
            </div>
          </div>

          {/* Simulation Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Simulation Response Mode:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`p-2.5 border rounded-lg cursor-pointer flex flex-col gap-1 transition-all ${simulationMode === 'AUTO_SUCCESS' ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <input
                    type="radio"
                    name="mode"
                    value="AUTO_SUCCESS"
                    checked={simulationMode === 'AUTO_SUCCESS'}
                    onChange={() => setSimulationMode('AUTO_SUCCESS')}
                  />
                  <span>Simulate Success (200)</span>
                </div>
                <span className="text-[10px] text-slate-500 ml-5">Active deposit confirmed with AICTE lien</span>
              </label>

              <label className={`p-2.5 border rounded-lg cursor-pointer flex flex-col gap-1 transition-all ${simulationMode === 'SIMULATE_MISMATCH' ? 'border-rose-600 bg-rose-50/50 text-rose-900 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <input
                    type="radio"
                    name="mode"
                    value="SIMULATE_MISMATCH"
                    checked={simulationMode === 'SIMULATE_MISMATCH'}
                    onChange={() => setSimulationMode('SIMULATE_MISMATCH')}
                  />
                  <span>Simulate Mismatch (409)</span>
                </div>
                <span className="text-[10px] text-slate-500 ml-5">Report amount disparity or holder mismatch</span>
              </label>

              <label className={`p-2.5 border rounded-lg cursor-pointer flex flex-col gap-1 transition-all ${simulationMode === 'SIMULATE_TIMEOUT' ? 'border-amber-600 bg-amber-50/50 text-amber-900 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <input
                    type="radio"
                    name="mode"
                    value="SIMULATE_TIMEOUT"
                    checked={simulationMode === 'SIMULATE_TIMEOUT'}
                    onChange={() => setSimulationMode('SIMULATE_TIMEOUT')}
                  />
                  <span>Simulate Timeout (504)</span>
                </div>
                <span className="text-[10px] text-slate-500 ml-5">Gateway response delay beyond SLA</span>
              </label>

              <label className={`p-2.5 border rounded-lg cursor-pointer flex flex-col gap-1 transition-all ${simulationMode === 'SIMULATE_UNAVAILABLE' ? 'border-slate-600 bg-slate-100 text-slate-900 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <input
                    type="radio"
                    name="mode"
                    value="SIMULATE_UNAVAILABLE"
                    checked={simulationMode === 'SIMULATE_UNAVAILABLE'}
                    onChange={() => setSimulationMode('SIMULATE_UNAVAILABLE')}
                  />
                  <span>Bank Offline (503)</span>
                </div>
                <span className="text-[10px] text-slate-500 ml-5">Upstream CBS under maintenance</span>
              </label>
            </div>
          </div>

          {/* Results Output */}
          {result && (
            <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${result.attempt.status === 'SUCCESS' ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' : result.attempt.status === 'MISMATCH' ? 'bg-rose-50/70 border-rose-300 text-rose-900' : 'bg-amber-50/70 border-amber-300 text-amber-900'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {result.attempt.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  Status: {result.attempt.status} ({result.attempt.responseCode})
                </span>
                <span className="text-[10px] text-slate-500">{new Date(result.attempt.attemptedAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs">{result.attempt.responseMessage}</p>

              {result.attempt.matchedFields.length > 0 && (
                <div className="text-[11px]">
                  <span className="font-semibold block">Confirmed Attributes:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {result.attempt.matchedFields.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.attempt.mismatchedFields.length > 0 && (
                <div className="text-[11px] text-rose-800">
                  <span className="font-semibold block">Identified Disparities:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.attempt.mismatchedFields.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleRunVerification}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {loading ? 'Querying Bank CBS...' : 'Execute CBS Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

