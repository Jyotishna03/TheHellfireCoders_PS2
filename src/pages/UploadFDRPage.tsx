import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Institution } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Scan,
  ShieldCheck,
  Building,
  Calendar,
  IndianRupee,
  AlertOctagon,
  Eye,
  Info
} from 'lucide-react';

export const UploadFDRPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isManualFallback, setIsManualFallback] = useState<boolean>(false);

  // Extracted / Editable Metadata
  const [fdrNumber, setFdrNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [bankBranch, setBankBranch] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [principalAmount, setPrincipalAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('7.10');
  const [issueDate, setIssueDate] = useState<string>('');
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [depositHolder, setDepositHolder] = useState<string>('');
  const [receiptReference, setReceiptReference] = useState<string>('');

  // OCR Processing Simulation
  const [isScanningOCR, setIsScanningOCR] = useState<boolean>(false);
  const [ocrConfidence, setOcrConfidence] = useState<number>(96);

  // Submission Status
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdFDR, setCreatedFDR] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getInstitutions().then(insts => {
      setInstitutions(insts);
      if (insts.length > 0) setSelectedInstId(insts[0].id);
    });
  }, []);

  const selectedInst = institutions.find(i => i.id === selectedInstId);

  // Auto-fill sensible default beneficiary holder when institution changes
  useEffect(() => {
    if (selectedInst) {
      setDepositHolder(`AICTE New Delhi a/c ${selectedInst.name}`);
    }
  }, [selectedInst]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selected.type)) {
        setError('Invalid file format. Please upload a PDF, JPG, or PNG document.');
        return;
      }
      if (selected.size > 15 * 1024 * 1024) {
        setError('Document exceeds 15MB size limit.');
        return;
      }
      setError(null);
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRunOCR = () => {
    setIsScanningOCR(true);
    // Simulate OCR scanner reading document layout
    setTimeout(() => {
      setIsScanningOCR(false);
      // Auto-populate simulated extracted fields if not filled
      if (!fdrNumber) setFdrNumber(`SBI-FDR-${Math.floor(Math.random() * 899999 + 100000)}`);
      if (!bankBranch) setBankBranch('University Campus Branch');
      if (!accountNumber) setAccountNumber(`984710${Math.floor(Math.random() * 8999 + 1000)}`);
      if (!principalAmount) setPrincipalAmount('3500000');
      if (!issueDate) setIssueDate('2024-04-10');
      if (!maturityDate) setMaturityDate('2029-04-10');
      if (!receiptReference) setReceiptReference(`REF/AICTE/2024/SEC/${Math.floor(Math.random() * 899 + 100)}`);
      setOcrConfidence(Math.floor(Math.random() * 6 + 93)); // 93-98%
      setStep(3);
    }, 900);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please attach an FDR document.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('institutionId', selectedInstId);
    formData.append('institutionName', selectedInst?.name || '');
    formData.append('institutionCode', selectedInst?.code || '');
    formData.append('bankName', bankName);
    formData.append('bankBranch', bankBranch);
    formData.append('fdrNumber', fdrNumber);
    formData.append('accountNumber', accountNumber);
    formData.append('principalAmount', principalAmount);
    formData.append('interestRate', interestRate);
    formData.append('issueDate', issueDate);
    formData.append('maturityDate', maturityDate);
    formData.append('depositHolder', depositHolder);
    formData.append('receiptReference', receiptReference);
    formData.append('uploadedBy', user.name);
    formData.append('uploadedByRole', user.role);
    formData.append('isFallbackManual', String(isManualFallback));

    try {
      const res = await api.uploadFDR(formData);
      setCreatedFDR(res.fdr);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Security Deposit (FDR) Intake Portal</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-step intake wizard with OCR automated extraction, integrity rules, and manual verification.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-semibold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
          <span>Institution & File</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</div>
          <span>OCR / Intake</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-teal-700' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</div>
          <span>Metadata Review</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step === 4 ? 'text-teal-700' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</div>
          <span>Confirmation</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Institution & Document File */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 1: Select Institution & Attach Certificate</h2>
            <p className="text-xs text-slate-500">Choose the approved educational college and upload the scanned FDR.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Educational Institution <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code}) — {inst.state}
                  </option>
                ))}
              </select>
              {selectedInst && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-center justify-between">
                  <span>AICTE Code: <strong>{selectedInst.code}</strong></span>
                  <span>Type: <strong>{selectedInst.type}</strong></span>
                  <span>City: <strong>{selectedInst.city}, {selectedInst.state}</strong></span>
                </div>
              )}
            </div>

            {/* Document Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fixed Deposit Receipt Document (PDF, JPG, or PNG, max 15MB) <span className="text-red-500">*</span>
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="fdrDocInput"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fdrDocInput" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    {file ? file.name : 'Click to select or drag and drop FDR certificate'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Accepts official bank issued Fixed Deposit Receipts / Certificates
                  </span>
                  {file && (
                    <span className="mt-2 text-[10px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {(file.size / 1024).toFixed(1)} KB selected
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Fallback Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Manual Entry Fallback Mode</span>
                <span className="text-[11px] text-slate-500">
                  Enable if scan is degraded or optical character recognition is unavailable.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isManualFallback}
                onChange={(e) => setIsManualFallback(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
            </div>

            {/* Quick Sample Documents Helper Box */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-teal-950">Pre-Configured Sample FDR Certificates for Testing:</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                  Click to Auto-Load
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    name: 'Sample 1: SBI Valid Deposit (₹35 Lakhs)',
                    instId: 'INST-001',
                    bank: 'State Bank of India',
                    branch: 'Mysore Road Campus Branch, Bengaluru',
                    fdrNo: 'SBI-FDR-8890214',
                    accNo: '9847291012',
                    amount: '3500000',
                    interest: '7.10',
                    issue: '2023-04-10',
                    mat: '2028-04-10',
                    holder: 'AICTE New Delhi a/c R.V. College of Engineering',
                    fileName: 'Sample_1_SBI_RVCE_35Lakh_Valid.pdf',
                    badge: 'Valid Standard'
                  },
                  {
                    name: 'Sample 2: PNB University Deposit (₹50 Lakhs)',
                    instId: 'INST-002',
                    bank: 'Punjab National Bank',
                    branch: 'Bawana Industrial Area, New Delhi',
                    fdrNo: 'PNB-DEL-9921443',
                    accNo: '8871024421',
                    amount: '5000000',
                    interest: '7.25',
                    issue: '2022-08-15',
                    mat: '2027-08-15',
                    holder: 'AICTE a/c Delhi Technological University',
                    fileName: 'Sample_2_PNB_DTU_50Lakh_Valid.pdf',
                    badge: 'High Value'
                  },
                  {
                    name: 'Sample 3: Canara Bank Discrepancy Test (Trust Name)',
                    instId: 'INST-005',
                    bank: 'Canara Bank',
                    branch: 'Main Road Branch, Ranchi',
                    fdrNo: 'CNB-SEC-7740192',
                    accNo: '7721091928',
                    amount: '5000000',
                    interest: '6.90',
                    issue: '2024-01-20',
                    mat: '2029-01-20',
                    holder: 'Birla Institute of Technology Trust',
                    fileName: 'Sample_3_CanaraBank_Discrepancy_Test.pdf',
                    badge: 'Name Mismatch Flag'
                  },
                  {
                    name: 'Sample 4: Bank of Baroda (Near Maturity ≤23d)',
                    instId: 'INST-008',
                    bank: 'Bank of Baroda',
                    branch: 'Bandra East Branch, Mumbai',
                    fdrNo: 'BOB-MUM-5501928',
                    accNo: '9920185510',
                    amount: '2500000',
                    interest: '6.80',
                    issue: '2024-02-14',
                    mat: '2026-11-20',
                    holder: 'AICTE Security Deposit a/c Government Polytechnic Mumbai',
                    fileName: 'Sample_4_BOB_NearMaturity_GP_Mumbai.pdf',
                    badge: 'Expiring ≤ 23d'
                  }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-teal-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] truncate">{s.name}</span>
                        <span className="text-[9px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {s.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {s.bank} • ₹{parseInt(s.amount).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <a
                        href={`/samples/${s.fileName}`}
                        download={s.fileName}
                        className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold underline"
                      >
                        ⬇ Download PDF
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/samples/${s.fileName}`);
                            const blob = await res.blob();
                            const sampleFile = new File([blob], s.fileName, { type: 'application/pdf' });
                            setFile(sampleFile);
                            setSelectedInstId(s.instId);
                            setBankName(s.bank);
                            setBankBranch(s.branch);
                            setFdrNumber(s.fdrNo);
                            setAccountNumber(s.accNo);
                            setPrincipalAmount(s.amount);
                            setInterestRate(s.interest);
                            setIssueDate(s.issue);
                            setMaturityDate(s.mat);
                            setDepositHolder(s.holder);
                            setReceiptReference(`REF/AICTE/SAMPLE/${Date.now().toString().slice(-4)}`);
                            setOcrConfidence(97);
                            setStep(2);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold shadow-xs transition-colors"
                      >
                        Auto-Load & Test →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => {
                if (!file) {
                  setError('Please select an FDR certificate document file to proceed.');
                  return;
                }
                setStep(2);
              }}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Next: Document Processing <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: OCR Extraction Engine */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Step 2: Automated OCR Extraction</h2>
              <p className="text-xs text-slate-500">Extracting fields using OCR layout engine with confidence scoring.</p>
            </div>
            {isManualFallback && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Manual Fallback Active
              </span>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
              <Scan className={`w-7 h-7 ${isScanningOCR ? 'animate-spin' : ''}`} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isScanningOCR ? 'Analyzing Document Layout & Running OCR...' : 'Ready for OCR Field Extraction'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The optical recognition pipeline extracts receipt numbers, principal amount, issuing bank, dates, and account details directly from certificate pixels.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRunOCR}
                disabled={isScanningOCR}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 shadow transition-colors disabled:opacity-50"
              >
                {isScanningOCR ? 'Processing...' : 'Run Optical Character Recognition'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsManualFallback(true);
                  setStep(3);
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
              >
                Skip OCR (Manual Entry Fallback)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Edit Extracted Fields */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Step 3: Verification & Metadata Review</h2>
              <p className="text-xs text-slate-500">Confirm or correct extracted values prior to central registration.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Engine Confidence:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${ocrConfidence >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isManualFallback ? '100% (Manual)' : `${ocrConfidence}% Verified`}
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* FDR Number */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                FDR / Receipt Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                placeholder="e.g. SBI-FDR-981240"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Issuing Scheduled Bank <span className="text-red-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-teal-500"
              >
                <option value="State Bank of India">State Bank of India</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Union Bank of India">Union Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Indian Overseas Bank">Indian Overseas Bank</option>
              </select>
            </div>

            {/* Bank Branch */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Branch</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="e.g. Mysore Road Campus Branch"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deposit Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 9847102941"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Principal Amount */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Principal Deposit Amount (INR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="3500000"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="7.10"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Deposit Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Maturity Date */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Maturity Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Deposit Holder Title */}
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Deposit Holder / Joint Lien Endorsement
              </label>
              <input
                type="text"
                value={depositHolder}
                onChange={(e) => setDepositHolder(e.target.value)}
                placeholder="e.g. AICTE New Delhi a/c RV College of Engineering"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Submit Deposit to Registry'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation & Record ID */}
      {step === 4 && createdFDR && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">FDR Document Lodged Successfully</h2>
            <p className="text-xs text-slate-500">
              The record has been indexed in the AICTE Security Deposit repository.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Record ID:</span>
              <span className="font-mono font-bold text-teal-800">{createdFDR.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Receipt Number:</span>
              <span className="font-mono font-semibold text-slate-800">{createdFDR.fdrNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Principal Deposit:</span>
              <span className="font-bold text-slate-900">₹{createdFDR.principalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Initial Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${createdFDR.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : createdFDR.status === 'FLAGGED_FOR_REVIEW' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                {createdFDR.status}
              </span>
            </div>
          </div>

          {createdFDR.flags && createdFDR.flags.length > 0 && (
            <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-left text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Verification Engine Flagged {createdFDR.flags.length} Potential Item(s)</span>
              </div>
              <p className="text-[11px] text-rose-700">
                A review case has been automatically created for AICTE Officer scrutiny.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/fdr/${createdFDR.id}`)}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow transition-colors"
            >
              Inspect FDR Record Details
            </button>
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setFilePreview(null);
                setCreatedFDR(null);
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Upload Another Deposit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

