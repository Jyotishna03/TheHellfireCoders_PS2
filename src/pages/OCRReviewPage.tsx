import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { FDRRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Eye,
  FileText,
  AlertOctagon,
  Percent,
  Check
} from 'lucide-react';

export const OCRReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlFdrId = searchParams.get('fdrId');
  const { user } = useAuth();

  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [selectedFdrId, setSelectedFdrId] = useState<string>(urlFdrId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    institutionName: '',
    fdrNumber: '',
    bankName: '',
    bankBranch: '',
    principalAmount: 0,
    interestRate: 0,
    issueDate: '',
    maturityDate: '',
    depositHolder: ''
  });

  useEffect(() => {
    api.getFDRs().then(records => {
      setFdrs(records);
      if (!selectedFdrId && records.length > 0) {
        setSelectedFdrId(records[0].id);
      }
      setLoading(false);
    });
  }, []);

  const currentFDR = fdrs.find(f => f.id === selectedFdrId);

  useEffect(() => {
    if (currentFDR) {
      setFormData({
        institutionName: currentFDR.institutionName || '',
        fdrNumber: currentFDR.fdrNumber || '',
        bankName: currentFDR.bankName || '',
        bankBranch: currentFDR.bankBranch || '',
        principalAmount: currentFDR.principalAmount || 0,
        interestRate: currentFDR.interestRate || 7.0,
        issueDate: currentFDR.issueDate || '',
        maturityDate: currentFDR.maturityDate || '',
        depositHolder: currentFDR.depositHolder || ''
      });
      setSaveSuccess(false);
    }
  }, [selectedFdrId, currentFDR]);

  const handleSaveCorrections = async () => {
    if (!currentFDR) return;
    setSaving(true);
    try {
      await api.updateFDR(currentFDR.id, {
        ...formData,
        updatedBy: user.id,
        updatedByName: user.name,
        updatedByRole: user.role
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Refresh list
      const refreshed = await api.getFDRs();
      setFdrs(refreshed);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading OCR extraction repository...</div>;
  }

  const ocr = currentFDR?.ocrData;

  const renderConfidence = (conf?: number) => {
    const val = conf || 95;
    if (val >= 90) {
      return (
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {val}% Confident
        </span>
      );
    }
    if (val >= 75) {
      return (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {val}% Review Advised
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
        {val}% Low Scan Clarity
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">OCR Extraction Review & Quality Bench</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit field-level computer vision extractions, verify optical confidence metrics, and make authorized corrections.
          </p>
        </div>

        {/* Record Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active Deposit:</label>
          <select
            value={selectedFdrId}
            onChange={(e) => setSelectedFdrId(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal-500 font-mono"
          >
            {fdrs.map(f => (
              <option key={f.id} value={f.id}>
                {f.fdrNumber} ({f.institutionName.substring(0, 25)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentFDR && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Field-by-Field Side-by-Side Review */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Extracted Optical Fields vs Stored Metadata</h3>
                <p className="text-xs text-slate-500">Edit fields directly to override OCR misreads with verified values</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Overall Scan Quality:</span>
                {renderConfidence(ocr?.overallConfidence)}
              </div>
            </div>

            {/* Fields comparison table */}
            <div className="space-y-4 text-xs">
              {/* Institution Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Institution Name</span>
                  <div className="mt-1">{renderConfidence(ocr?.institutionName?.confidence)}</div>
                </div>
                <div className="text-slate-500 font-mono text-[11px] truncate">
                  Raw: {ocr?.institutionName?.value || currentFDR.institutionName}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* FDR Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">FDR Receipt Number</span>
                  <div className="mt-1">{renderConfidence(ocr?.fdrNumber?.confidence)}</div>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Raw: {ocr?.fdrNumber?.value || currentFDR.fdrNumber}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.fdrNumber}
                    onChange={(e) => setFormData({ ...formData, fdrNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Scheduled Bank Name</span>
                  <div className="mt-1">{renderConfidence(ocr?.bankName?.confidence)}</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Raw: {ocr?.bankName?.value || currentFDR.bankName}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Principal Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Principal Sum (INR)</span>
                  <div className="mt-1">{renderConfidence(ocr?.principalAmount?.confidence)}</div>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Raw: ₹{ocr?.principalAmount?.value || currentFDR.principalAmount}
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-bold text-teal-800"
                  />
                </div>
              </div>

              {/* Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Issue Date</span>
                  <div className="mt-1">{renderConfidence(ocr?.issueDate?.confidence)}</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Raw: {ocr?.issueDate?.value || currentFDR.issueDate}
                </div>
                <div>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Maturity Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Maturity Date</span>
                  <div className="mt-1">{renderConfidence(ocr?.maturityDate?.confidence)}</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Raw: {ocr?.maturityDate?.value || currentFDR.maturityDate}
                </div>
                <div>
                  <input
                    type="date"
                    value={formData.maturityDate}
                    onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {saveSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Corrections persisted to central database!
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCorrections}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving Changes...' : 'Save Corrected Metadata'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Engine Metadata & Audit */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Optical Pipeline Configuration
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Optical Engine:</span>
                  <span className="font-semibold text-slate-800">{ocr?.engine || 'Tesseract Optical Recognition'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mode:</span>
                  <span className="font-medium text-slate-800">
                    {ocr?.isFallbackManual ? 'Manual Entry Fallback' : 'Automated Optical Character Extraction'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scan Checksum:</span>
                  <div className="font-mono text-[10px] bg-slate-100 p-2 rounded text-slate-700 break-all select-all border border-slate-200">
                    {currentFDR.documentHash}
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practice Notice */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <FileSearch className="w-4 h-4 text-teal-600" />
                <span>Verification Guideline</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Low confidence optical readings are not proof of invalidity. Degraded scans, faint bank stamps, or unusual typeface require visual operator confirmation before deposit approval.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

