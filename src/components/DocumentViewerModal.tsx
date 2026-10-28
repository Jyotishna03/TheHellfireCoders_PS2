import React, { useState } from 'react';
import { FDRRecord } from '../types';
import { FileText, Copy, Check, Download, X, Hash, Shield } from 'lucide-react';

interface DocumentViewerModalProps {
  fdr: FDRRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ fdr, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(fdr.documentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = fdr.documentMimeType.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-semibold text-sm">Security Deposit Document Inspector</h3>
              <p className="text-[11px] text-slate-300">{fdr.documentFileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Cryptographic Integrity Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">SHA-256 Checksum:</span>
            <span className="font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-800 break-all select-all">
              {fdr.documentHash}
            </span>
          </div>
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 font-medium bg-teal-50 px-2 py-1 rounded border border-teal-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Hash'}
          </button>
        </div>

        {/* Document Preview Canvas */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex-1 flex flex-col items-center justify-center min-h-[350px]">
          {isImage ? (
            <div className="max-w-md w-full bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
              <img
                src={fdr.documentFilePath}
                alt="FDR Certificate"
                className="max-h-[350px] mx-auto object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-xs text-slate-500 mt-2">Scanned Certificate Image Preview</div>
            </div>
          ) : (
            <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md border border-slate-300 space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{fdr.bankName.toUpperCase()}</h4>
                  <p className="text-xs text-slate-600">{fdr.bankBranch}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Security Deposit Receipt</span>
                  <div className="font-mono font-bold text-sm text-teal-800">{fdr.fdrNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Beneficiary:</span>
                  <span className="font-semibold text-slate-900">{fdr.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deposit Holder:</span>
                  <span className="text-slate-800">{fdr.depositHolder}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Principal Sum:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{fdr.principalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Number:</span>
                  <span className="font-mono text-slate-800">{fdr.accountNumberMasked}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issue Date:</span>
                  <span className="text-slate-700">{fdr.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Maturity Date:</span>
                  <span className="text-slate-700 font-semibold">{fdr.maturityDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AICTE Lien Marked in Terms of Council Approval Regulations</span>
                </div>
                <span className="font-mono text-[10px]">Auth Seal: SBI-CBS-AUTH</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            MIME: {fdr.documentMimeType} • Size: {(fdr.documentSizeBytes / 1024).toFixed(1)} KB
          </span>
          <div className="flex items-center gap-2">
            <a
              href={fdr.documentFilePath}
              download={fdr.documentFileName}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Document
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

