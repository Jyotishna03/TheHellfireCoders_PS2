// Vercel Serverless Entry Point for SmartFDR API
// This file wraps the entire Express application as a single Vercel serverless function.
// State is in-memory per cold start — seed data is always present on first request.

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// ─── Inline Seed Data ────────────────────────────────────────────────────────

const initialUsers = [
  { id: 'USR-001', name: 'Dr. T. G. Sitharam', email: 'chairman@aicte-india.org', role: 'SUPER_ADMIN', designation: 'AICTE Council Chairman & Super Administrator' },
  { id: 'USR-002', name: 'Rajiv Kumar', email: 'rajiv.kumar@aicte.gov.in', role: 'AICTE_OFFICER', designation: 'Director (Approval & Security Deposits)' },
  { id: 'USR-003', name: 'Dr. Sneha Kulkarni', email: 'principal@rvce.edu.in', role: 'COLLEGE_ADMIN', designation: 'Registrar & Authorized Finance Representative', institutionId: 'INST-001', institutionName: 'R.V. College of Engineering, Bengaluru' },
  { id: 'USR-004', name: 'Vinod Sharma', email: 'v.sharma@cag.gov.in', role: 'AUDITOR', designation: 'Principal Financial Auditor (Empanelled Reviewer)' }
];

const initialInstitutions = [
  { id: 'INST-001', code: '1-10972361', name: 'R.V. College of Engineering', type: 'Engineering College', state: 'Karnataka', city: 'Bengaluru', address: 'Mysore Road, RV Vidyanikethan Post, Bengaluru 560059', email: 'principal@rvce.edu.in', phone: '+91-80-68188100', totalDeposits: 4, totalValue: 12500000, complianceStatus: 'Compliant' },
  { id: 'INST-002', code: '1-20984511', name: 'Delhi Technological University', type: 'University', state: 'Delhi', city: 'New Delhi', address: 'Shahbad Daulatpur, Main Bawana Road, Delhi 110042', email: 'registrar@dtu.ac.in', phone: '+91-11-27871018', totalDeposits: 6, totalValue: 25000000, complianceStatus: 'Compliant' },
  { id: 'INST-003', code: '1-34891024', name: 'College of Engineering Pune (COEP)', type: 'Engineering College', state: 'Maharashtra', city: 'Pune', address: 'Wellesley Road, Shivajinagar, Pune 411005', email: 'dean@coeptech.ac.in', phone: '+91-20-25507000', totalDeposits: 5, totalValue: 18000000, complianceStatus: 'Compliant' },
  { id: 'INST-004', code: '1-45671239', name: 'PSG College of Technology', type: 'Engineering College', state: 'Tamil Nadu', city: 'Coimbatore', address: 'Avinashi Road, Peelamedu, Coimbatore 641004', email: 'principal@psgtech.ac.in', phone: '+91-422-2572177', totalDeposits: 3, totalValue: 11000000, complianceStatus: 'Compliant' },
  { id: 'INST-005', code: '1-51290384', name: 'Birla Institute of Technology, Mesra', type: 'University', state: 'Jharkhand', city: 'Ranchi', address: 'Mesra, Ranchi 835215', email: 'registrar@bitmesra.ac.in', phone: '+91-651-2275444', totalDeposits: 3, totalValue: 15000000, complianceStatus: 'Pending Review' },
  { id: 'INST-006', code: '1-69830214', name: 'Veermata Jijabai Technological Institute (VJTI)', type: 'Engineering College', state: 'Maharashtra', city: 'Mumbai', address: 'H. R. Mahajani Marg, Matunga, Mumbai 400019', email: 'director@vjti.ac.in', phone: '+91-22-24198101', totalDeposits: 2, totalValue: 8000000, complianceStatus: 'Compliant' },
  { id: 'INST-007', code: '1-74892011', name: 'BMS College of Engineering', type: 'Engineering College', state: 'Karnataka', city: 'Bengaluru', address: 'Bull Temple Road, Basavanagudi, Bengaluru 560019', email: 'principal@bmsce.ac.in', phone: '+91-80-26622130', totalDeposits: 3, totalValue: 13500000, complianceStatus: 'Compliant' },
  { id: 'INST-008', code: '1-89301244', name: 'Government Polytechnic Mumbai', type: 'Polytechnic', state: 'Maharashtra', city: 'Mumbai', address: '49, Kherwadi, Ali Yavar Jung Marg, Bandra East, Mumbai 400051', email: 'principal@gpmumbai.ac.in', phone: '+91-22-26474587', totalDeposits: 2, totalValue: 5000000, complianceStatus: 'Pending Review' },
  { id: 'INST-009', code: '1-90412855', name: 'Institute of Chemical Technology (ICT)', type: 'University', state: 'Maharashtra', city: 'Mumbai', address: 'Nathalal Parekh Marg, Matunga, Mumbai 400019', email: 'vc@ictmumbai.edu.in', phone: '+91-22-33611111', totalDeposits: 4, totalValue: 20000000, complianceStatus: 'Compliant' },
  { id: 'INST-010', code: '1-10294821', name: 'Harcourt Butler Technical University', type: 'University', state: 'Uttar Pradesh', city: 'Kanpur', address: 'Nawabganj, Kanpur 208002', email: 'registrar@hbtu.ac.in', phone: '+91-512-2534001', totalDeposits: 3, totalValue: 9500000, complianceStatus: 'Non-Compliant' }
];

// Get today's date and future dates relative to now for realistic demo data
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function yearsFromNow(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
}

function yearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().split('T')[0];
}

const initialFDRs = [
  {
    id: 'FDR-2026-0001', institutionId: 'INST-001', institutionName: 'R.V. College of Engineering', institutionCode: '1-10972361',
    bankName: 'State Bank of India', bankBranch: 'Mysore Road Campus Branch, Bengaluru', fdrNumber: 'SBI-FDR-8890214',
    accountNumberMasked: '•••• •••• 9012', principalAmount: 3500000, interestRate: 7.1,
    issueDate: yearsAgo(3), maturityDate: yearsFromNow(2),
    depositHolder: 'AICTE New Delhi a/c RV College of Engineering', receiptReference: 'REF/KA/2023/SEC/0109',
    documentFileName: 'rvce_sbi_fdr_35lakh.pdf', documentFilePath: '/uploads/sample_fdr_rvce.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 420180,
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'VERIFIED', verifiedBy: 'Rajiv Kumar (AICTE Officer)', verifiedAt: daysAgo(15),
    flags: [], ocrData: { overallConfidence: 97.2, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(16) },
    uploadedBy: 'Dr. Sneha Kulkarni', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(20) + 'T09:15:00.000Z', updatedAt: daysAgo(15) + 'T14:22:00.000Z'
  },
  {
    id: 'FDR-2026-0002', institutionId: 'INST-002', institutionName: 'Delhi Technological University', institutionCode: '1-20984511',
    bankName: 'Punjab National Bank', bankBranch: 'Connaught Place Main Branch, New Delhi', fdrNumber: 'PNB-DEL-9921443',
    accountNumberMasked: '•••• •••• 7734', principalAmount: 5000000, interestRate: 7.25,
    issueDate: yearsAgo(2), maturityDate: yearsFromNow(3),
    depositHolder: 'AICTE Security Deposit a/c Delhi Tech University', receiptReference: 'REF/DL/2024/SEC/0042',
    documentFileName: 'dtu_pnb_fdr_50lakh.pdf', documentFilePath: '/uploads/sample_fdr_dtu.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 512340,
    documentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    status: 'VERIFIED', verifiedBy: 'Rajiv Kumar (AICTE Director)', verifiedAt: daysAgo(10),
    flags: [], ocrData: { overallConfidence: 98.5, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(12) },
    uploadedBy: 'DTU Finance Office', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(14) + 'T10:30:00.000Z', updatedAt: daysAgo(10) + 'T11:05:00.000Z'
  },
  {
    id: 'FDR-2026-0003', institutionId: 'INST-005', institutionName: 'Birla Institute of Technology, Mesra', institutionCode: '1-51290384',
    bankName: 'Canara Bank', bankBranch: 'Ranchi Main Branch', fdrNumber: 'CNB-SEC-7740192',
    accountNumberMasked: '•••• •••• 3381', principalAmount: 5000000, interestRate: 7.0,
    issueDate: yearsAgo(1), maturityDate: yearsFromNow(4),
    depositHolder: 'BIT Mesra Trust a/c Security Deposit', receiptReference: 'REF/JH/2025/SEC/0071',
    documentFileName: 'bit_canara_fdr_50lakh.pdf', documentFilePath: '/uploads/sample_fdr_bit.jpg',
    documentMimeType: 'image/jpeg', documentSizeBytes: 380020,
    documentHash: 'f1e2d3c4b5a6978801234567890fedcba9876543210fedcba9876543210fedcb',
    status: 'FLAGGED_FOR_REVIEW',
    flags: [{
      id: 'FLAG-001-NAME', ruleCode: 'RULE_NAME_MISMATCH',
      title: 'Potential Institution Name Discrepancy',
      description: 'Extracted text shows "BIT Mesra Trust" while registered name is "Birla Institute of Technology, Mesra". Requires administrative clarification.',
      severity: 'MEDIUM', resolved: false
    }],
    ocrData: { overallConfidence: 89.1, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(5) },
    uploadedBy: 'BIT Registrar Office', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(6) + 'T14:00:00.000Z', updatedAt: daysAgo(5) + 'T16:30:00.000Z'
  },
  {
    id: 'FDR-2026-0004', institutionId: 'INST-008', institutionName: 'Government Polytechnic Mumbai', institutionCode: '1-89301244',
    bankName: 'Bank of Baroda', bankBranch: 'Bandra East Branch, Mumbai', fdrNumber: 'BOB-MUM-5501928',
    accountNumberMasked: '•••• •••• 6612', principalAmount: 2500000, interestRate: 6.85,
    issueDate: yearsAgo(5), maturityDate: daysFromNow(23),
    depositHolder: 'AICTE Security Deposit a/c GP Mumbai', receiptReference: 'REF/MH/2021/SEC/0019',
    documentFileName: 'gpmumbai_bob_fdr_25lakh.pdf', documentFilePath: '/uploads/sample_gp_mumbai.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 298450,
    documentHash: 'cc1122334455667788990011223344556677889900aabbccddeeff0011223344',
    status: 'VERIFIED', verifiedBy: 'Senior AICTE Officer', verifiedAt: daysAgo(90),
    flags: [], ocrData: { overallConfidence: 95.4, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(91) },
    uploadedBy: 'GP Mumbai Admin', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(95) + 'T09:00:00.000Z', updatedAt: daysAgo(90) + 'T12:15:00.000Z'
  },
  {
    id: 'FDR-2026-0005', institutionId: 'INST-010', institutionName: 'Harcourt Butler Technical University', institutionCode: '1-10294821',
    bankName: 'HDFC Bank', bankBranch: 'Nawabganj Campus, Kanpur', fdrNumber: 'HDFC-KNP-1102948',
    accountNumberMasked: '•••• •••• 9901', principalAmount: 3000000, interestRate: 7.5,
    issueDate: yearsAgo(5), maturityDate: daysFromNow(8),
    depositHolder: 'AICTE Lien a/c HBTU Kanpur', receiptReference: 'REF/UP/2021/SEC/0033',
    documentFileName: 'hbtu_hdfc_fdr_30lakh.pdf', documentFilePath: '/uploads/sample_hbtu.png',
    documentMimeType: 'image/png', documentSizeBytes: 445200,
    documentHash: '99aabbccddeeff00112233445566778899aabbccddeeff00112233445566778',
    status: 'VERIFIED', verifiedBy: 'AICTE Officer (North Zone)', verifiedAt: daysAgo(60),
    flags: [], ocrData: { overallConfidence: 96.1, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(61) },
    uploadedBy: 'HBTU Finance Cell', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(65) + 'T11:00:00.000Z', updatedAt: daysAgo(60) + 'T10:30:00.000Z'
  },
  {
    id: 'FDR-2026-0006', institutionId: 'INST-003', institutionName: 'College of Engineering Pune (COEP)', institutionCode: '1-34891024',
    bankName: 'Bank of Maharashtra', bankBranch: 'Shivajinagar Branch, Pune', fdrNumber: 'BOM-PNE-4432891',
    accountNumberMasked: '•••• •••• 5521', principalAmount: 4000000, interestRate: 6.9,
    issueDate: yearsAgo(1), maturityDate: yearsFromNow(4),
    depositHolder: 'AICTE Deposit a/c COEP Pune', receiptReference: 'REF/MH/2025/SEC/0088',
    documentFileName: 'coep_bom_fdr_40lakh.pdf', documentFilePath: '/uploads/sample_coep.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 501200,
    documentHash: 'aabbcc1122334455667788990011aabbcc1122334455667788990011aabbcc11',
    status: 'PENDING_VERIFICATION', flags: [],
    ocrData: { overallConfidence: 94.3, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(3) },
    uploadedBy: 'COEP Finance Officer', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(3) + 'T08:45:00.000Z', updatedAt: daysAgo(3) + 'T08:50:00.000Z'
  },
  {
    id: 'FDR-2026-0007', institutionId: 'INST-004', institutionName: 'PSG College of Technology', institutionCode: '1-45671239',
    bankName: 'Indian Bank', bankBranch: 'Peelamedu Branch, Coimbatore', fdrNumber: 'IB-CBE-3301992',
    accountNumberMasked: '•••• •••• 8812', principalAmount: 3500000, interestRate: 7.15,
    issueDate: yearsAgo(2), maturityDate: yearsFromNow(3),
    depositHolder: 'AICTE Security Bond a/c PSG Tech', receiptReference: 'REF/TN/2024/SEC/0055',
    documentFileName: 'psg_indianbank_fdr_35lakh.pdf', documentFilePath: '/uploads/sample_psg.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 389120,
    documentHash: 'bb2233445566778899001122bb2233445566778899001122bb2233445566778899',
    status: 'NEEDS_CORRECTION', correctionReason: 'Branch name on document does not match AICTE institution address records. Please resubmit with branch details confirmation letter.',
    flags: [], ocrData: { overallConfidence: 91.8, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(8) },
    uploadedBy: 'PSG Finance Department', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(10) + 'T14:20:00.000Z', updatedAt: daysAgo(7) + 'T16:45:00.000Z'
  },
  {
    id: 'FDR-2026-0008', institutionId: 'INST-007', institutionName: 'BMS College of Engineering', institutionCode: '1-74892011',
    bankName: 'State Bank of India', bankBranch: 'Basavanagudi Branch, Bengaluru', fdrNumber: 'SBI-BMS-6641201',
    accountNumberMasked: '•••• •••• 4490', principalAmount: 3500000, interestRate: 7.1,
    issueDate: yearsAgo(3), maturityDate: yearsFromNow(2),
    depositHolder: 'AICTE New Delhi a/c BMS College', receiptReference: 'REF/KA/2023/SEC/0119',
    documentFileName: 'bmsce_sbi_dup_candidate.pdf', documentFilePath: '/uploads/sample_bmsce.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 420180,
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'FLAGGED_FOR_REVIEW',
    flags: [{
      id: 'FLAG-002-HASH', ruleCode: 'RULE_EXACT_DOC_HASH',
      title: 'Identical Document File Detected',
      description: 'Uploaded file SHA-256 hash matches FDR-2026-0001. A duplicate document upload may have occurred.',
      severity: 'HIGH', resolved: false
    }],
    ocrData: { overallConfidence: 97.2, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(2) },
    uploadedBy: 'BMS Finance Office', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(2) + 'T13:10:00.000Z', updatedAt: daysAgo(2) + 'T13:15:00.000Z'
  },
  {
    id: 'FDR-2026-0009', institutionId: 'INST-009', institutionName: 'Institute of Chemical Technology (ICT)', institutionCode: '1-90412855',
    bankName: 'Union Bank of India', bankBranch: 'Matunga Branch, Mumbai', fdrNumber: 'UBI-MAT-2291847',
    accountNumberMasked: '•••• •••• 7723', principalAmount: 6000000, interestRate: 7.3,
    issueDate: yearsAgo(1), maturityDate: yearsFromNow(4),
    depositHolder: 'AICTE Lien Account a/c ICT Mumbai', receiptReference: 'REF/MH/2025/SEC/0103',
    documentFileName: 'ict_ubi_fdr_60lakh.pdf', documentFilePath: '/uploads/sample_ict.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 610200,
    documentHash: 'cc3344556677889900112233445566778899001122334455cc66778899001122',
    status: 'VERIFIED', verifiedBy: 'Rajiv Kumar (AICTE Officer)', verifiedAt: daysAgo(7),
    flags: [], ocrData: { overallConfidence: 98.9, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(9) },
    uploadedBy: 'ICT Mumbai Registrar', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(10) + 'T10:00:00.000Z', updatedAt: daysAgo(7) + 'T15:30:00.000Z'
  },
  {
    id: 'FDR-2026-0010', institutionId: 'INST-006', institutionName: 'Veermata Jijabai Technological Institute (VJTI)', institutionCode: '1-69830214',
    bankName: 'Central Bank of India', bankBranch: 'Matunga West Branch, Mumbai', fdrNumber: 'CBI-VJT-9988312',
    accountNumberMasked: '•••• •••• 2211', principalAmount: 4500000, interestRate: 6.95,
    issueDate: yearsAgo(2), maturityDate: daysAgo(15),
    depositHolder: 'AICTE Security Bond a/c VJTI', receiptReference: 'REF/MH/2024/SEC/0067',
    documentFileName: 'vjti_cbi_fdr_45lakh.pdf', documentFilePath: '/uploads/sample_vjti.pdf',
    documentMimeType: 'application/pdf', documentSizeBytes: 488390,
    documentHash: 'dd4455667788990011223344556677889900dd1122334455667788990011223344',
    status: 'MATURED',
    flags: [{
      id: 'FLAG-003-EXP', ruleCode: 'RULE_ALREADY_EXPIRED',
      title: 'Maturity Date In the Past',
      description: `Deposit maturity date has already passed. Renewal certificate required.`,
      severity: 'MEDIUM', resolved: false
    }],
    ocrData: { overallConfidence: 96.7, engine: 'Tesseract OCR', isFallbackManual: false, processedAt: daysAgo(60) },
    uploadedBy: 'VJTI Finance Cell', uploadedByRole: 'COLLEGE_ADMIN',
    createdAt: daysAgo(62) + 'T09:30:00.000Z', updatedAt: daysAgo(15) + 'T08:00:00.000Z'
  }
];

const initialReviewCases = [
  {
    id: 'CASE-2026-001', fdrId: 'FDR-2026-0003', fdrNumber: 'CNB-SEC-7740192',
    institutionName: 'Birla Institute of Technology, Mesra', institutionCode: '1-51290384',
    ruleTriggered: 'RULE_NAME_MISMATCH', severity: 'MEDIUM', status: 'OPEN',
    assignedTo: 'Rajiv Kumar (AICTE Review Queue)', detectedAt: daysAgo(5) + 'T16:30:00.000Z',
    supportingEvidence: [{ field: 'Institution Name', enteredValue: 'Birla Institute of Technology, Mesra', comparisonValue: 'BIT Mesra Trust', source: 'OCR Document Extraction', note: 'Header text on scanned certificate differs from institution profile.' }],
    notes: [{ id: 'NOTE-001', author: 'SmartFDR Verification Engine', role: 'SYSTEM', text: 'System detected 1 potential inconsistency: Institution name on FDR certificate reads "BIT Mesra Trust" vs registered name "Birla Institute of Technology, Mesra". Wording: Potential Discrepancy requiring authorized human review.', createdAt: daysAgo(5) + 'T16:30:00.000Z' }]
  },
  {
    id: 'CASE-2026-002', fdrId: 'FDR-2026-0008', fdrNumber: 'SBI-BMS-6641201',
    institutionName: 'BMS College of Engineering', institutionCode: '1-74892011',
    ruleTriggered: 'RULE_EXACT_DOC_HASH', severity: 'HIGH', status: 'IN_REVIEW',
    assignedTo: 'Vinod Sharma (CAG Auditor)', detectedAt: daysAgo(2) + 'T13:15:00.000Z',
    supportingEvidence: [{ field: 'SHA-256 Checksum', enteredValue: 'e3b0c44298fc1c14...', comparisonValue: 'e3b0c44298fc1c14... (FDR-2026-0001)', source: 'Cryptographic Document Store', note: 'Binary collision with previously lodged document in FDR-2026-0001.' }],
    notes: [
      { id: 'NOTE-002', author: 'SmartFDR Verification Engine', role: 'SYSTEM', text: 'System detected 1 potential inconsistency: Uploaded file binary hash is identical to FDR-2026-0001 (RVCE). This may indicate the same PDF was submitted for two different institutions.', createdAt: daysAgo(2) + 'T13:15:00.000Z' },
      { id: 'NOTE-003', author: 'Vinod Sharma', role: 'AUDITOR', text: 'Initial review indicates the document template matches but institution details differ. Contacted BMS Finance to provide the original bank-issued PDF. Awaiting response.', createdAt: daysAgo(1) + 'T10:00:00.000Z' }
    ]
  },
  {
    id: 'CASE-2026-003', fdrId: 'FDR-2026-0010', fdrNumber: 'CBI-VJT-9988312',
    institutionName: 'Veermata Jijabai Technological Institute (VJTI)', institutionCode: '1-69830214',
    ruleTriggered: 'RULE_ALREADY_EXPIRED', severity: 'MEDIUM', status: 'ESCALATED',
    assignedTo: 'Dr. T. G. Sitharam (AICTE Chairman)', detectedAt: daysAgo(15) + 'T08:00:00.000Z',
    supportingEvidence: [{ field: 'Current Status', enteredValue: `Maturity: ${daysAgo(15)}`, comparisonValue: `Current Date: ${daysAgo(0)}`, source: 'Calendar Temporal Validator', note: 'Security deposit is overdue for renewal.' }],
    notes: [
      { id: 'NOTE-004', author: 'SmartFDR Verification Engine', role: 'SYSTEM', text: 'Maturity date has passed. Renewal or claim certificate required from VJTI.', createdAt: daysAgo(15) + 'T08:00:00.000Z' },
      { id: 'NOTE-005', author: 'Rajiv Kumar', role: 'AICTE_OFFICER', text: 'VJTI administration contacted via registered email. Renewal FDR pending from Central Bank of India. Escalating to Chairman for awareness.', createdAt: daysAgo(12) + 'T09:30:00.000Z' }
    ],
    decision: { action: 'ESCALATE', reason: 'Renewal FDR not received within 7-day grace period. Escalated for institutional compliance action.', decidedBy: 'Rajiv Kumar', decidedAt: daysAgo(12) + 'T09:30:00.000Z' }
  }
];

const initialBankAttempts = [
  {
    attemptId: 'ATTEMPT-001', fdrId: 'FDR-2026-0001', bankName: 'State Bank of India', fdrNumber: 'SBI-FDR-8890214',
    provider: 'MOCK_CORE_BANKING_API', status: 'SUCCESS', responseCode: 'CBS_CONFIRMED_200',
    responseMessage: 'Deposit receipt verified successfully against State Bank of India Core Banking Records.',
    attemptedAt: daysAgo(15) + 'T13:45:00.000Z', attemptedBy: 'Rajiv Kumar (AICTE Officer)',
    matchedFields: ['FDR Receipt Number Valid', 'Principal Amount Matches Exactly', 'Account Lien Status: AICTE Marked', 'Active & In-Force Deposit'],
    mismatchedFields: [],
    maskedPayload: { receiptNumber: 'SBI-FDR-8890214', holderName: 'R.V. College of Engineering', amountCheck: '₹35,00,000', statusReported: 'ACTIVE_SECURITY_DEPOSIT' },
    simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Standard mock banking confirmation returned. This is synthetic test data for hackathon demo.'
  }
];

const today = new Date().toISOString().split('T')[0];
const initialNotifications = [
  { id: 'NOTIF-001', title: 'Critical Maturity Expiry (Under 7 Days): FDR-2026-0005', message: `Security deposit HDFC-KNP-1102948 (HBTU) will mature in 8 days (${daysFromNow(8)}). Immediate renewal required.`, type: 'MATURITY', severity: 'danger', read: false, fdrId: 'FDR-2026-0005', institutionId: 'INST-010', createdAt: today },
  { id: 'NOTIF-002', title: 'Maturity Notice (30 Days): FDR-2026-0004', message: `Security deposit BOB-MUM-5501928 (GP Mumbai) matures in 23 days (${daysFromNow(23)}).`, type: 'MATURITY', severity: 'warning', read: false, fdrId: 'FDR-2026-0004', institutionId: 'INST-008', createdAt: today },
  { id: 'NOTIF-003', title: 'Review Case Generated: Discrepancy Detected', message: 'FDR FDR-2026-0008 (BMS College) flagged for: Identical Document File Detected. Case CASE-2026-002 opened.', type: 'DISCREPANCY', severity: 'warning', read: false, fdrId: 'FDR-2026-0008', institutionId: 'INST-007', createdAt: daysAgo(2) + 'T13:15:00.000Z' },
  { id: 'NOTIF-004', title: 'FDR Status Update: VERIFIED', message: 'Deposit PNB-DEL-9921443 (DTU) status updated to VERIFIED.', type: 'VERIFICATION', severity: 'success', read: true, fdrId: 'FDR-2026-0002', institutionId: 'INST-002', createdAt: daysAgo(10) + 'T11:05:00.000Z' },
  { id: 'NOTIF-005', title: 'FDR Status Update: NEEDS_CORRECTION', message: 'Deposit IB-CBE-3301992 (PSG Tech) needs correction. Branch details confirmation letter required.', type: 'VERIFICATION', severity: 'warning', read: true, fdrId: 'FDR-2026-0007', institutionId: 'INST-004', createdAt: daysAgo(7) + 'T16:45:00.000Z' },
  { id: 'NOTIF-006', title: 'Overdue / Matured Deposit: FDR-2026-0010', message: `Security deposit CBI-VJT-9988312 (VJTI) matured on ${daysAgo(15)} and is overdue for closure or renewal.`, type: 'MATURITY', severity: 'danger', read: false, fdrId: 'FDR-2026-0010', institutionId: 'INST-006', createdAt: daysAgo(14) + 'T09:00:00.000Z' }
];

const initialAuditLogs = [
  { id: 'LOG-001', timestamp: daysAgo(20) + 'T09:15:00.000Z', actorId: 'USR-003', actorName: 'Dr. Sneha Kulkarni', actorRole: 'COLLEGE_ADMIN', action: 'FDR_UPLOAD', entityType: 'FDR', entityId: 'FDR-2026-0001', ipAddress: '10.0.1.45', details: 'Lodged new deposit SBI-FDR-8890214 for ₹35,00,000. Initial status: PENDING_VERIFICATION.' },
  { id: 'LOG-002', timestamp: daysAgo(15) + 'T13:45:00.000Z', actorId: 'USR-002', actorName: 'Rajiv Kumar', actorRole: 'AICTE_OFFICER', action: 'BANK_VERIFICATION_ATTEMPT', entityType: 'BANK_VERIFICATION', entityId: 'ATTEMPT-001', ipAddress: '10.0.2.11', details: 'Mock CBS verification against SBI returned SUCCESS (CBS_CONFIRMED_200).' },
  { id: 'LOG-003', timestamp: daysAgo(15) + 'T14:22:00.000Z', actorId: 'USR-002', actorName: 'Rajiv Kumar', actorRole: 'AICTE_OFFICER', action: 'STATUS_CHANGE_TO_VERIFIED', entityType: 'FDR', entityId: 'FDR-2026-0001', ipAddress: '10.0.2.11', details: 'Status changed from PENDING_VERIFICATION to VERIFIED. Bank CBS confirmed all fields.' },
  { id: 'LOG-004', timestamp: daysAgo(10) + 'T11:05:00.000Z', actorId: 'USR-002', actorName: 'Rajiv Kumar', actorRole: 'AICTE_OFFICER', action: 'STATUS_CHANGE_TO_VERIFIED', entityType: 'FDR', entityId: 'FDR-2026-0002', ipAddress: '10.0.2.11', details: 'DTU deposit verified after bank confirmation.' },
  { id: 'LOG-005', timestamp: daysAgo(7) + 'T16:45:00.000Z', actorId: 'USR-002', actorName: 'Rajiv Kumar', actorRole: 'AICTE_OFFICER', action: 'STATUS_CHANGE_TO_NEEDS_CORRECTION', entityType: 'FDR', entityId: 'FDR-2026-0007', ipAddress: '10.0.2.11', details: 'PSG Tech FDR requires branch details correction.' },
  { id: 'LOG-006', timestamp: daysAgo(2) + 'T13:15:00.000Z', actorId: 'SYSTEM', actorName: 'SmartFDR Engine', actorRole: 'SYSTEM', action: 'FDR_UPLOAD', entityType: 'FDR', entityId: 'FDR-2026-0008', ipAddress: '10.0.1.88', details: 'BMS FDR upload triggered RULE_EXACT_DOC_HASH flag. Review case CASE-2026-002 opened.' },
  { id: 'LOG-007', timestamp: daysAgo(1) + 'T10:00:00.000Z', actorId: 'USR-004', actorName: 'Vinod Sharma', actorRole: 'AUDITOR', action: 'REVIEW_NOTE_ADDED', entityType: 'REVIEW_CASE', entityId: 'CASE-2026-002', ipAddress: '10.0.3.22', details: 'Added investigation note to CASE-2026-002: "Initial review indicates the document template matches..."' },
  { id: 'LOG-008', timestamp: daysAgo(12) + 'T09:30:00.000Z', actorId: 'USR-002', actorName: 'Rajiv Kumar', actorRole: 'AICTE_OFFICER', action: 'CASE_DECISION_ESCALATE', entityType: 'REVIEW_CASE', entityId: 'CASE-2026-003', ipAddress: '10.0.2.11', details: 'VJTI maturity case escalated to Chairman. Renewal FDR not received in grace period.' },
  { id: 'LOG-009', timestamp: today + 'T08:00:00.000Z', actorId: 'USR-001', actorName: 'Dr. T. G. Sitharam', actorRole: 'SUPER_ADMIN', action: 'SETTINGS_UPDATE', entityType: 'SETTINGS', entityId: 'GLOBAL_SETTINGS', ipAddress: '10.0.4.01', details: 'Updated integration parameters: Mock bank mode retained as AUTO_SUCCESS for demo.' }
];

const initialSettings = {
  mockBankMode: 'AUTO_SUCCESS',
  mockBankLatencyMs: 1200,
  ocrConfidenceThreshold: 75,
  maturityWarningDays30: 30,
  maturityWarningDays15: 15,
  maturityWarningDays7: 7,
  duplicateDetectionEnabled: true,
  autoFlagOnCritical: true,
  bankApiProvider: 'MOCK_CORE_BANKING_ADAPTER',
  bankApiNotes: 'Simulated Core Banking System integration. Real bank API not configured. For hackathon evaluation only.'
};

// ─── In-Memory Store ──────────────────────────────────────────────────────────
// Global in-process state (survives warm requests, resets on cold start)
const store = {
  users: JSON.parse(JSON.stringify(initialUsers)),
  institutions: JSON.parse(JSON.stringify(initialInstitutions)),
  fdrs: JSON.parse(JSON.stringify(initialFDRs)),
  reviewCases: JSON.parse(JSON.stringify(initialReviewCases)),
  bankAttempts: JSON.parse(JSON.stringify(initialBankAttempts)),
  notifications: JSON.parse(JSON.stringify(initialNotifications)),
  auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
  settings: JSON.parse(JSON.stringify(initialSettings))
};

// ─── Verification Engine (Inline) ────────────────────────────────────────────
function computeFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function runVerificationRules(input) {
  const flags = [];
  const caseEvidence = [];

  if (!input.fdrNumber || !input.bankName || !input.principalAmount || !input.issueDate || !input.maturityDate) {
    flags.push({ id: `FLAG-${Date.now()}-REQ`, ruleCode: 'RULE_REQUIRED_FIELDS', title: 'Incomplete Submission Metadata', description: 'One or more mandatory FDR fields are missing or blank.', severity: 'HIGH', resolved: false });
    caseEvidence.push({ field: 'Mandatory Fields', enteredValue: 'Incomplete', comparisonValue: 'All required fields present', source: 'Data Schema Validation', note: 'One or more mandatory parameters could not be validated.' });
  }
  if (input.principalAmount <= 0 || isNaN(input.principalAmount)) {
    flags.push({ id: `FLAG-${Date.now()}-AMT`, ruleCode: 'RULE_INVALID_AMOUNT', title: 'Potential Amount Discrepancy', description: 'The specified security deposit amount is non-positive or invalid.', severity: 'CRITICAL', resolved: false });
    caseEvidence.push({ field: 'Principal Amount', enteredValue: `₹${input.principalAmount}`, comparisonValue: '> ₹0.00', source: 'Financial Sanity Check', note: 'Security deposit value must be a strictly positive denomination.' });
  }
  if (input.issueDate && input.maturityDate) {
    if (new Date(input.maturityDate).getTime() <= new Date(input.issueDate).getTime()) {
      flags.push({ id: `FLAG-${Date.now()}-DATE`, ruleCode: 'RULE_DATE_CHRONOLOGY', title: 'Potential Date Chronology Inconsistency', description: 'Maturity date is earlier than or equal to the deposit issue date.', severity: 'HIGH', resolved: false });
      caseEvidence.push({ field: 'Maturity vs Issue Date', enteredValue: `Issue: ${input.issueDate}, Maturity: ${input.maturityDate}`, comparisonValue: 'Maturity > Issue Date', source: 'Deposit Chronology Rule', note: 'Maturity cannot precede or equal the issuance date.' });
    }
  }
  const exactDup = input.existingRecords.find(r => r.fdrNumber.trim().toUpperCase() === input.fdrNumber.trim().toUpperCase());
  if (exactDup) {
    flags.push({ id: `FLAG-${Date.now()}-DUP`, ruleCode: 'RULE_EXACT_DUP_RECEIPT', title: 'Potential Duplicate Receipt Number', description: `Receipt number "${input.fdrNumber}" matches existing record ${exactDup.id}.`, severity: 'CRITICAL', resolved: false });
    caseEvidence.push({ field: 'FDR Receipt Number', enteredValue: input.fdrNumber, comparisonValue: `${exactDup.fdrNumber} (in ${exactDup.id})`, source: 'Central FDR Registry Index', note: `Already lodged by ${exactDup.institutionName}.` });
  }
  if (input.documentHash) {
    const hashDup = input.existingRecords.find(r => r.documentHash === input.documentHash);
    if (hashDup) {
      flags.push({ id: `FLAG-${Date.now()}-HASH`, ruleCode: 'RULE_EXACT_DOC_HASH', title: 'Identical Document File Detected', description: `Uploaded file hash matches existing record ${hashDup.id}.`, severity: 'HIGH', resolved: false });
      caseEvidence.push({ field: 'SHA-256 Checksum', enteredValue: input.documentHash.substring(0, 16) + '...', comparisonValue: hashDup.documentHash.substring(0, 16) + '...', source: 'Cryptographic Document Store', note: `Binary collision with ${hashDup.id}.` });
    }
  }
  if (!exactDup) {
    const similar = input.existingRecords.find(r => r.bankName.toLowerCase().trim() === input.bankName.toLowerCase().trim() && Math.abs(r.principalAmount - input.principalAmount) < 1 && r.maturityDate.substring(0, 7) === input.maturityDate.substring(0, 7));
    if (similar) {
      flags.push({ id: `FLAG-${Date.now()}-SIM`, ruleCode: 'RULE_SIMILAR_RECORD', title: 'Potential Duplicate Candidate (Similar Parameters)', description: `Deposit matches ${similar.id} with identical bank, amount, and maturity period.`, severity: 'MEDIUM', resolved: false });
      caseEvidence.push({ field: 'Deposit Amount & Period', enteredValue: `₹${input.principalAmount} @ ${input.bankName}`, comparisonValue: `₹${similar.principalAmount} in ${similar.id}`, source: 'Heuristic Pattern Matching', note: 'High similarity in financial attributes. Human confirmation recommended.' });
    }
  }
  if (input.maturityDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (input.maturityDate < todayStr) {
      flags.push({ id: `FLAG-${Date.now()}-EXP`, ruleCode: 'RULE_ALREADY_EXPIRED', title: 'Maturity Date In the Past', description: `Deposit maturity date (${input.maturityDate}) has already passed.`, severity: 'MEDIUM', resolved: false });
      caseEvidence.push({ field: 'Current Status', enteredValue: `Maturity: ${input.maturityDate}`, comparisonValue: `Current Date: ${todayStr}`, source: 'Calendar Temporal Validator', note: 'Security deposit is overdue for renewal.' });
    }
  }

  return { isValid: flags.filter(f => f.severity === 'CRITICAL').length === 0, flags, caseEvidence };
}

// ─── Mock Bank Verification (Inline) ─────────────────────────────────────────
function executeMockBankVerification(req, simulationMode = 'AUTO_SUCCESS') {
  const attemptId = `ATTEMPT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();
  const isForcedTimeout = simulationMode === 'SIMULATE_TIMEOUT' || req.fdrNumber.toUpperCase().endsWith('-TMO');
  const isForcedMismatch = simulationMode === 'SIMULATE_MISMATCH' || req.fdrNumber.toUpperCase().endsWith('-MIS');
  const isForcedUnavailable = simulationMode === 'SIMULATE_UNAVAILABLE' || req.fdrNumber.toUpperCase().endsWith('-ERR');

  if (isForcedTimeout) return { attemptId, fdrId: req.fdrId, bankName: req.bankName, fdrNumber: req.fdrNumber, provider: 'MOCK_CORE_BANKING_API', status: 'TIMEOUT', responseCode: 'GATEWAY_TIMEOUT_504', responseMessage: `Gateway for ${req.bankName} timed out.`, attemptedAt: now, attemptedBy: req.requestedBy, matchedFields: [], mismatchedFields: ['Gateway Response'], maskedPayload: { receiptNumber: req.fdrNumber, holderName: '••••••••••••', amountCheck: 'UNCONFIRMED', statusReported: 'CONNECTION_TIMED_OUT' }, simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Gateway timeout. Can retry safely.' };
  if (isForcedUnavailable) return { attemptId, fdrId: req.fdrId, bankName: req.bankName, fdrNumber: req.fdrNumber, provider: 'MOCK_CORE_BANKING_API', status: 'UNAVAILABLE', responseCode: 'SERVICE_UNAVAILABLE_503', responseMessage: `${req.bankName} API temporarily unavailable.`, attemptedAt: now, attemptedBy: req.requestedBy, matchedFields: [], mismatchedFields: ['Service Availability'], maskedPayload: { receiptNumber: req.fdrNumber, holderName: '••••••••••••', amountCheck: 'UNCONFIRMED', statusReported: 'BANK_SYSTEM_OFFLINE' }, simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: HTTP 503. Temporary state, not a fraud indicator.' };
  if (isForcedMismatch) return { attemptId, fdrId: req.fdrId, bankName: req.bankName, fdrNumber: req.fdrNumber, provider: 'MOCK_CORE_BANKING_API', status: 'MISMATCH', responseCode: 'CBS_RECORD_MISMATCH_409', responseMessage: `Bank CBS located record for "${req.fdrNumber}", but reported a value disparity.`, attemptedAt: now, attemptedBy: req.requestedBy, matchedFields: ['Receipt Number Exists', 'Issuing Branch'], mismatchedFields: ['Deposit Amount (CBS records ₹1,00,000 lower)', 'Deposit Holder Title'], maskedPayload: { receiptNumber: req.fdrNumber, holderName: `${req.institutionName.substring(0, 5)}... [Discrepancy]`, amountCheck: 'AMOUNT_MISMATCH', statusReported: 'RECORD_FOUND_DISCREPANT' }, simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Field mismatches found. Manual human review required; never conclude fraud prematurely.' };

  return { attemptId, fdrId: req.fdrId, bankName: req.bankName, fdrNumber: req.fdrNumber, provider: 'MOCK_CORE_BANKING_API', status: 'SUCCESS', responseCode: 'CBS_CONFIRMED_200', responseMessage: `Deposit receipt verified against ${req.bankName} Core Banking Records.`, attemptedAt: now, attemptedBy: req.requestedBy, matchedFields: ['FDR Receipt Number Valid', 'Principal Amount Matches Exactly', 'Account Lien Status: AICTE Marked', 'Active & In-Force Deposit'], mismatchedFields: [], maskedPayload: { receiptNumber: req.fdrNumber, holderName: req.institutionName, amountCheck: `₹${req.principalAmount.toLocaleString('en-IN')}`, statusReported: 'ACTIVE_SECURITY_DEPOSIT' }, simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Standard mock banking confirmation. Synthetic test data for hackathon demo.' };
}

// ─── Audit Log Helper ─────────────────────────────────────────────────────────
function addAuditLog(log) {
  const newLog = { id: `LOG-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`, timestamp: new Date().toISOString(), ...log };
  store.auditLogs.unshift(newLog);
  return newLog;
}

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

// Configure multer for in-memory storage (Vercel has no persistent disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid document format. Only PDF, JPG, and PNG are accepted.'));
  }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Sample documents metadata
app.get('/api/samples', (_req, res) => {
  res.json([
    { name: 'Sample 1: Standard Valid FDR (SBI)', fileName: 'Sample_1_SBI_RVCE_35Lakh_Valid.pdf', downloadUrl: '/samples/Sample_1_SBI_RVCE_35Lakh_Valid.pdf', bankName: 'State Bank of India', amount: 3500000, receiptNo: 'SBI-FDR-8890214', institution: 'R.V. College of Engineering, Bengaluru', type: 'Valid Deposit (Standard Approval Workflow)' },
    { name: 'Sample 2: High Value University FDR (PNB)', fileName: 'Sample_2_PNB_DTU_50Lakh_Valid.pdf', downloadUrl: '/samples/Sample_2_PNB_DTU_50Lakh_Valid.pdf', bankName: 'Punjab National Bank', amount: 5000000, receiptNo: 'PNB-DEL-9921443', institution: 'Delhi Technological University', type: 'Valid High-Value Deposit' },
    { name: 'Sample 3: Discrepancy Test (Trust Name Mismatch)', fileName: 'Sample_3_CanaraBank_Discrepancy_Test.pdf', downloadUrl: '/samples/Sample_3_CanaraBank_Discrepancy_Test.pdf', bankName: 'Canara Bank', amount: 5000000, receiptNo: 'CNB-SEC-7740192', institution: 'Birla Institute of Technology, Mesra', type: 'Discrepancy Test (Institution Name Mismatch Flag)' },
    { name: 'Sample 4: Near Maturity Deposit (Bank of Baroda)', fileName: 'Sample_4_BOB_NearMaturity_GP_Mumbai.pdf', downloadUrl: '/samples/Sample_4_BOB_NearMaturity_GP_Mumbai.pdf', bankName: 'Bank of Baroda', amount: 2500000, receiptNo: 'BOB-MUM-5501928', institution: 'Government Polytechnic Mumbai', type: 'Upcoming Maturity Alert Candidate (≤ 23 Days)' },
    { name: 'Sample 5: Critical Expiry Deposit (HDFC Bank)', fileName: 'Sample_5_HDFC_Expiring_Deposit_HBTU.pdf', downloadUrl: '/samples/Sample_5_HDFC_Expiring_Deposit_HBTU.pdf', bankName: 'HDFC Bank', amount: 3000000, receiptNo: 'HDFC-KNP-1102948', institution: 'Harcourt Butler Technical University', type: 'Critical Maturity Notice Candidate (≤ 8 Days)' }
  ]);
});

// Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'UP', version: '1.0.0', timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    integrations: {
      mockBankApi: { configured: true, mode: store.settings.mockBankMode, latencyMs: store.settings.mockBankLatencyMs, provider: 'SIMULATED_CORE_BANKING_ADAPTER', note: 'Mock testing adapter for hackathon evaluation' },
      ocrEngine: { available: true, engine: 'Tesseract OCR / Optical Parser Engine with Manual Fallback', confidenceThreshold: store.settings.ocrConfidenceThreshold },
      documentStorage: { provider: 'Vercel Serverless (In-Memory)', path: '/tmp/uploads' }
    }
  });
});

// Stats
app.get('/api/stats', (_req, res) => {
  const fdrs = store.fdrs;
  const institutions = store.institutions;
  const reviewCases = store.reviewCases;
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAhead = new Date(); thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
  const thirtyDaysStr = thirtyDaysAhead.toISOString().split('T')[0];

  const totalFDRs = fdrs.length;
  const pendingVerification = fdrs.filter(f => f.status === 'PENDING_VERIFICATION' || f.status === 'VERIFICATION_IN_PROGRESS').length;
  const verifiedFDRs = fdrs.filter(f => f.status === 'VERIFIED').length;
  const rejectedFDRs = fdrs.filter(f => f.status === 'REJECTED').length;
  const flaggedForReview = fdrs.filter(f => f.status === 'FLAGGED_FOR_REVIEW').length;
  const needsCorrection = fdrs.filter(f => f.status === 'NEEDS_CORRECTION').length;
  const upcomingMaturities = fdrs.filter(f => f.maturityDate >= today && f.maturityDate <= thirtyDaysStr).length;
  const expiredFDRs = fdrs.filter(f => f.maturityDate < today || f.status === 'EXPIRED' || f.status === 'MATURED').length;
  const totalDepositValue = fdrs.reduce((sum, f) => sum + (f.principalAmount || 0), 0);

  const statusDistribution = [
    { name: 'Verified', value: verifiedFDRs, color: '#059669' },
    { name: 'Pending', value: pendingVerification, color: '#d97706' },
    { name: 'Flagged Review', value: flaggedForReview, color: '#e11d48' },
    { name: 'Needs Correction', value: needsCorrection, color: '#ea580c' },
    { name: 'Matured / Expired', value: expiredFDRs, color: '#64748b' },
    { name: 'Rejected', value: rejectedFDRs, color: '#991b1b' }
  ];

  const bankCounts = {};
  fdrs.forEach(f => { bankCounts[f.bankName] = (bankCounts[f.bankName] || 0) + 1; });
  const bankDistribution = Object.entries(bankCounts).map(([name, count]) => ({ name, count }));

  const institutionDistribution = institutions.map(i => ({ name: i.name.length > 20 ? i.name.substring(0, 18) + '...' : i.name, fullName: i.name, amountLakhs: Math.round(i.totalValue / 100000), deposits: i.totalDeposits })).sort((a, b) => b.amountLakhs - a.amountLakhs).slice(0, 5);

  const monthlyTrends = [
    { month: 'May 2024', submitted: 8, verified: 7, flagged: 1 }, { month: 'Jun 2024', submitted: 12, verified: 10, flagged: 2 },
    { month: 'Jul 2024', submitted: 15, verified: 14, flagged: 1 }, { month: 'Aug 2024', submitted: 11, verified: 9, flagged: 2 },
    { month: 'Sep 2024', submitted: 18, verified: 15, flagged: 3 }, { month: 'Oct 2024', submitted: 14, verified: 12, flagged: 2 }
  ];
  const flagCategories = [{ category: 'Duplicate File Hash', count: 3 }, { category: 'Institution Name Mismatch', count: 2 }, { category: 'Similar Parameter Match', count: 4 }, { category: 'Low OCR Scan Confidence', count: 2 }, { category: 'Past Maturity Date', count: 3 }];

  const upcomingMaturitiesList = fdrs.filter(f => f.maturityDate).map(f => {
    const days = Math.ceil((new Date(f.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { id: f.id, fdrNumber: f.fdrNumber, institutionName: f.institutionName, bankName: f.bankName, principalAmount: f.principalAmount, maturityDate: f.maturityDate, remainingDays: days };
  }).sort((a, b) => a.remainingDays - b.remainingDays).slice(0, 4);

  res.json({
    kpis: { totalFDRs, pendingVerification, verifiedFDRs, rejectedFDRs, flaggedForReview, upcomingMaturities, expiredFDRs, totalDepositValue, totalInstitutions: institutions.length, openReviewCases: reviewCases.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW' || c.status === 'ESCALATED').length },
    statusDistribution, bankDistribution, institutionDistribution, monthlyTrends, flagCategories, upcomingMaturitiesList,
    turnaroundStats: { avgTurnaroundHours: 28.5, avgTurnaroundDays: 1.2, slaComplianceRate: 96.2, avgOcrConfidence: 96.8, cbsGatewayUptime: '99.98%' }
  });
});

// Institutions
app.get('/api/institutions', (_req, res) => res.json(store.institutions));
app.get('/api/institutions/:id', (req, res) => {
  const inst = store.institutions.find(i => i.id === req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  res.json({ ...inst, records: store.fdrs.filter(f => f.institutionId === inst.id) });
});

// FDR Registry
app.get('/api/fdr', (req, res) => {
  let list = [...store.fdrs];
  const { q, status, bank, institutionId, sortBy, sortOrder } = req.query;
  if (q) { const query = q.toLowerCase(); list = list.filter(f => f.id.toLowerCase().includes(query) || f.fdrNumber.toLowerCase().includes(query) || f.institutionName.toLowerCase().includes(query) || f.bankName.toLowerCase().includes(query)); }
  if (status && status !== 'ALL') list = list.filter(f => f.status === status);
  if (bank && bank !== 'ALL') list = list.filter(f => f.bankName === bank);
  if (institutionId && institutionId !== 'ALL') list = list.filter(f => f.institutionId === institutionId);
  if (sortBy === 'amount') list.sort((a, b) => sortOrder === 'desc' ? b.principalAmount - a.principalAmount : a.principalAmount - b.principalAmount);
  else if (sortBy === 'maturity') list.sort((a, b) => sortOrder === 'desc' ? b.maturityDate.localeCompare(a.maturityDate) : a.maturityDate.localeCompare(b.maturityDate));
  else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(list);
});

app.get('/api/fdr/:id', (req, res) => {
  const fdr = store.fdrs.find(f => f.id === req.params.id);
  if (!fdr) return res.status(404).json({ error: 'FDR record not found' });
  const bankAttempts = store.bankAttempts.filter(a => a.fdrId === fdr.id);
  const reviewCase = store.reviewCases.find(c => c.fdrId === fdr.id);
  res.json({ ...fdr, bankAttempts, reviewCase });
});

// FDR Upload
app.post('/api/fdr/upload', upload.single('document'), (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No FDR document file provided.' });

    const documentHash = computeFileHash(file.buffer);
    const { institutionId, institutionName, institutionCode, bankName, bankBranch, fdrNumber, accountNumber, principalAmount, interestRate, issueDate, maturityDate, depositHolder, receiptReference, uploadedBy, uploadedByRole, isFallbackManual } = req.body;

    const parsedAmount = parseFloat(principalAmount) || 0;
    const parsedRate = parseFloat(interestRate) || 7.0;
    const isManualFallback = isFallbackManual === 'true' || isFallbackManual === true;
    const accStr = (accountNumber || '1234567890').trim();
    const maskedAcc = accStr.length > 4 ? `•••• •••• ${accStr.slice(-4)}` : '•••• •••• 0000';
    const baseConfidence = isManualFallback ? 100 : Math.floor(Math.random() * 8 + 92);
    const ocrData = { institutionName: { value: institutionName || '', confidence: baseConfidence, flagged: false }, bankName: { value: bankName || '', confidence: baseConfidence, flagged: false }, fdrNumber: { value: fdrNumber || '', confidence: baseConfidence, flagged: false }, principalAmount: { value: String(parsedAmount), confidence: baseConfidence, flagged: false }, issueDate: { value: issueDate || '', confidence: baseConfidence - 1, flagged: false }, maturityDate: { value: maturityDate || '', confidence: baseConfidence - 1, flagged: false }, overallConfidence: baseConfidence, engine: isManualFallback ? 'Manual Entry Fallback Verification' : 'Tesseract OCR + AI Layout Extractor', isFallbackManual: isManualFallback, processedAt: new Date().toISOString() };

    const verificationResults = runVerificationRules({ institutionName: institutionName || '', institutionCode: institutionCode || '', bankName: bankName || '', bankBranch: bankBranch || '', fdrNumber: fdrNumber || '', principalAmount: parsedAmount, issueDate: issueDate || '', maturityDate: maturityDate || '', depositHolder: depositHolder || '', documentHash, ocrData, existingRecords: store.fdrs });

    const fdrId = `FDR-${new Date().getFullYear()}-${String(store.fdrs.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const initialStatus = verificationResults.flags.length > 0 ? 'FLAGGED_FOR_REVIEW' : 'PENDING_VERIFICATION';

    const newFDR = { id: fdrId, institutionId: institutionId || 'INST-001', institutionName: institutionName || 'Registered Technical Institute', institutionCode: institutionCode || '1-XXXXXX', bankName: bankName || 'State Bank of India', bankBranch: bankBranch || 'Main Branch', fdrNumber: fdrNumber || 'FDR-NEW-000', accountNumberMasked: maskedAcc, principalAmount: parsedAmount, interestRate: parsedRate, issueDate: issueDate || now.split('T')[0], maturityDate: maturityDate || now.split('T')[0], depositHolder: depositHolder || 'AICTE Joint Account', receiptReference: receiptReference || `REF/${new Date().getFullYear()}/SEC/${Math.floor(Math.random() * 9000 + 1000)}`, documentFileName: file.originalname, documentFilePath: `/uploads/${Date.now()}_${file.originalname}`, documentMimeType: file.mimetype, documentSizeBytes: file.size, documentHash, status: initialStatus, flags: verificationResults.flags, ocrData, uploadedBy: uploadedBy || 'Authorized Representative', uploadedByRole: uploadedByRole || 'COLLEGE_ADMIN', createdAt: now, updatedAt: now };

    store.fdrs.unshift(newFDR);

    if (verificationResults.flags.length > 0) {
      const caseId = `CASE-${new Date().getFullYear()}-${String(store.reviewCases.length + 1).padStart(3, '0')}`;
      const highestSeverity = verificationResults.flags.some(f => f.severity === 'CRITICAL') ? 'CRITICAL' : verificationResults.flags.some(f => f.severity === 'HIGH') ? 'HIGH' : 'MEDIUM';
      store.reviewCases.unshift({ id: caseId, fdrId: newFDR.id, fdrNumber: newFDR.fdrNumber, institutionName: newFDR.institutionName, institutionCode: newFDR.institutionCode, ruleTriggered: verificationResults.flags.map(f => f.ruleCode).join(', '), severity: highestSeverity, status: 'OPEN', assignedTo: 'AICTE Review Queue', detectedAt: now, supportingEvidence: verificationResults.caseEvidence, notes: [{ id: `NOTE-${Date.now()}`, author: 'SmartFDR Verification Engine', role: 'SYSTEM', text: `System detected ${verificationResults.flags.length} potential inconsistency item(s). Requires authorized human review.`, createdAt: now }] });
      const existsDedupe = store.notifications.some(n => n.fdrId === newFDR.id && !n.read);
      if (!existsDedupe) store.notifications.unshift({ id: `NOTIF-${Date.now()}`, title: 'Review Case Generated: Discrepancy Detected', message: `FDR ${newFDR.id} (${newFDR.institutionName}) flagged for: ${verificationResults.flags[0].title}. Case ${caseId} opened.`, type: 'DISCREPANCY', severity: highestSeverity === 'CRITICAL' ? 'danger' : 'warning', read: false, fdrId: newFDR.id, institutionId: newFDR.institutionId, createdAt: now });
    }
    addAuditLog({ actorId: uploadedBy || 'USR-003', actorName: uploadedBy || 'College Administrator', actorRole: uploadedByRole || 'COLLEGE_ADMIN', action: 'FDR_UPLOAD', entityType: 'FDR', entityId: newFDR.id, ipAddress: req.ip || '127.0.0.1', details: `Lodged new deposit ${newFDR.fdrNumber} for ₹${newFDR.principalAmount.toLocaleString('en-IN')}. Status: ${newFDR.status}.` });

    res.status(201).json({ message: 'FDR uploaded and processed successfully.', fdr: newFDR, verificationResults });
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: error.message || 'Error processing FDR document.' });
  }
});

// Update FDR
app.put('/api/fdr/:id', (req, res) => {
  const idx = store.fdrs.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'FDR record not found' });
  store.fdrs[idx] = { ...store.fdrs[idx], ...req.body, updatedAt: new Date().toISOString() };
  addAuditLog({ actorId: req.body.updatedBy || 'USR-002', actorName: req.body.updatedByName || 'AICTE Officer', actorRole: req.body.updatedByRole || 'AICTE_OFFICER', action: 'FDR_METADATA_UPDATE', entityType: 'FDR', entityId: req.params.id, ipAddress: req.ip || '127.0.0.1', details: `Updated metadata for ${req.params.id}.` });
  res.json(store.fdrs[idx]);
});

// Update FDR Status
app.post('/api/fdr/:id/status', (req, res) => {
  const idx = store.fdrs.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'FDR record not found' });
  const existing = store.fdrs[idx];
  const { status, reason, actorName, actorRole } = req.body;
  const updates = { status };
  if (status === 'VERIFIED') { updates.verifiedBy = actorName || 'AICTE Officer'; updates.verifiedAt = new Date().toISOString(); }
  else if (status === 'NEEDS_CORRECTION') updates.correctionReason = reason;
  else if (status === 'REJECTED') updates.rejectionReason = reason;
  store.fdrs[idx] = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  addAuditLog({ actorId: actorName || 'USR-002', actorName: actorName || 'AICTE Officer', actorRole: actorRole || 'AICTE_OFFICER', action: `STATUS_CHANGE_TO_${status}`, entityType: 'FDR', entityId: req.params.id, ipAddress: req.ip || '127.0.0.1', details: `Status changed from ${existing.status} to ${status}. Reason: ${reason || 'Direct officer review'}` });
  if (status === 'NEEDS_CORRECTION' || status === 'VERIFIED' || status === 'REJECTED') {
    store.notifications.unshift({ id: `NOTIF-${Date.now()}`, title: `FDR Status Update: ${status.replace('_', ' ')}`, message: `Deposit ${existing.fdrNumber} (${existing.institutionName}) status updated to ${status}.${reason ? ' Note: ' + reason : ''}`, type: 'VERIFICATION', severity: status === 'VERIFIED' ? 'success' : status === 'NEEDS_CORRECTION' ? 'warning' : 'danger', read: false, fdrId: existing.id, institutionId: existing.institutionId, createdAt: new Date().toISOString() });
  }
  res.json(store.fdrs[idx]);
});

// Bank Verification
app.post('/api/fdr/:id/verify-bank', (req, res) => {
  const fdr = store.fdrs.find(f => f.id === req.params.id);
  if (!fdr) return res.status(404).json({ error: 'FDR record not found' });
  const { simulationMode, requestedBy } = req.body;
  const effectiveMode = simulationMode || store.settings.mockBankMode;
  const result = executeMockBankVerification({ fdrId: fdr.id, bankName: fdr.bankName, fdrNumber: fdr.fdrNumber, principalAmount: fdr.principalAmount, institutionName: fdr.institutionName, accountNumberMasked: fdr.accountNumberMasked, requestedBy: requestedBy || 'AICTE Verification Officer' }, effectiveMode);
  store.bankAttempts.unshift(result);
  const idx = store.fdrs.findIndex(f => f.id === req.params.id);
  if (result.status === 'SUCCESS') store.fdrs[idx] = { ...store.fdrs[idx], status: 'VERIFIED', verifiedBy: `${requestedBy || 'AICTE Officer'} (via Bank CBS API)`, verifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  else if (result.status === 'MISMATCH') store.fdrs[idx] = { ...store.fdrs[idx], status: 'FLAGGED_FOR_REVIEW', updatedAt: new Date().toISOString() };
  addAuditLog({ actorId: requestedBy || 'USR-002', actorName: requestedBy || 'AICTE Verification Officer', actorRole: 'AICTE_OFFICER', action: 'BANK_VERIFICATION_ATTEMPT', entityType: 'BANK_VERIFICATION', entityId: result.attemptId, ipAddress: req.ip || '127.0.0.1', details: `Mock CBS verification against ${fdr.bankName} returned ${result.status} (${result.responseCode}).` });
  res.json({ attempt: result, fdr: store.fdrs[idx] });
});

// Review Cases
app.get('/api/review-cases', (req, res) => {
  let cases = [...store.reviewCases];
  const { status, severity } = req.query;
  if (status && status !== 'ALL') cases = cases.filter(c => c.status === status);
  if (severity && severity !== 'ALL') cases = cases.filter(c => c.severity === severity);
  res.json(cases);
});

app.get('/api/review-cases/:id', (req, res) => {
  const c = store.reviewCases.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Review case not found' });
  res.json({ ...c, fdr: store.fdrs.find(f => f.id === c.fdrId), bankAttempts: store.bankAttempts.filter(a => a.fdrId === c.fdrId) });
});

app.post('/api/review-cases/:id/notes', (req, res) => {
  const idx = store.reviewCases.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Review case not found' });
  const { author, role, text } = req.body;
  const newNote = { id: `NOTE-${Date.now()}`, author: author || 'Reviewer', role: role || 'AICTE_OFFICER', text, createdAt: new Date().toISOString() };
  store.reviewCases[idx].notes.push(newNote);
  addAuditLog({ actorId: author || 'USR-002', actorName: author || 'Reviewer', actorRole: role || 'AICTE_OFFICER', action: 'REVIEW_NOTE_ADDED', entityType: 'REVIEW_CASE', entityId: req.params.id, ipAddress: req.ip || '127.0.0.1', details: `Added note to ${req.params.id}` });
  res.json(store.reviewCases[idx]);
});

app.post('/api/review-cases/:id/decide', (req, res) => {
  const idx = store.reviewCases.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Review case not found' });
  const { action, reason, decidedBy } = req.body;
  const now = new Date().toISOString();
  store.reviewCases[idx].decision = { action, reason, decidedBy: decidedBy || 'AICTE Officer', decidedAt: now };
  if (action === 'RESOLVE_APPROVE') { store.reviewCases[idx].status = 'RESOLVED_VALID'; const fi = store.fdrs.findIndex(f => f.id === store.reviewCases[idx].fdrId); if (fi !== -1) store.fdrs[fi] = { ...store.fdrs[fi], status: 'VERIFIED', verifiedBy: `${decidedBy} (Review Case Decision)`, verifiedAt: now, updatedAt: now }; }
  else if (action === 'RESOLVE_REJECT') { store.reviewCases[idx].status = 'RESOLVED_REJECTED'; const fi = store.fdrs.findIndex(f => f.id === store.reviewCases[idx].fdrId); if (fi !== -1) store.fdrs[fi] = { ...store.fdrs[fi], status: 'REJECTED', rejectionReason: reason, updatedAt: now }; }
  else if (action === 'ESCALATE') store.reviewCases[idx].status = 'ESCALATED';
  else if (action === 'REQUEST_INFO') { store.reviewCases[idx].status = 'IN_REVIEW'; const fi = store.fdrs.findIndex(f => f.id === store.reviewCases[idx].fdrId); if (fi !== -1) store.fdrs[fi] = { ...store.fdrs[fi], status: 'NEEDS_CORRECTION', correctionReason: reason, updatedAt: now }; }
  addAuditLog({ actorId: decidedBy || 'USR-002', actorName: decidedBy || 'AICTE Officer', actorRole: 'AICTE_OFFICER', action: `CASE_DECISION_${action}`, entityType: 'REVIEW_CASE', entityId: req.params.id, ipAddress: req.ip || '127.0.0.1', details: `Case ${req.params.id} decided: ${action}. Reason: ${reason}` });
  res.json(store.reviewCases[idx]);
});

// Notifications
app.get('/api/notifications', (_req, res) => res.json(store.notifications));
app.post('/api/notifications/:id/read', (req, res) => {
  const n = store.notifications.find(n => n.id === req.params.id);
  if (n) n.read = true;
  res.json({ success: !!n });
});
app.post('/api/notifications/mark-all-read', (_req, res) => {
  store.notifications.forEach(n => n.read = true);
  res.json({ success: true });
});
app.post('/api/notifications/generate-alerts', (_req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  let count = 0;
  store.fdrs.forEach(f => {
    if (!f.maturityDate) return;
    const diffDays = Math.ceil((new Date(f.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const id = diffDays <= 7 ? `NOTIF-MAT-7-${f.id}` : diffDays <= 15 ? `NOTIF-MAT-15-${f.id}` : diffDays <= 30 ? `NOTIF-MAT-30-${f.id}` : diffDays < 0 ? `NOTIF-MAT-OVERDUE-${f.id}` : null;
    if (!id) return;
    const exists = store.notifications.some(n => n.id === id && !n.read);
    if (!exists) {
      const sev = diffDays <= 15 ? 'danger' : 'warning';
      store.notifications.unshift({ id, title: diffDays < 0 ? `Overdue / Matured: ${f.id}` : `Maturity Notice (${diffDays} Days): ${f.id}`, message: `Security deposit ${f.fdrNumber} (${f.institutionName}) ${diffDays < 0 ? 'is overdue for closure.' : `matures in ${diffDays} days (${f.maturityDate}).`}`, type: 'MATURITY', severity: sev, read: false, fdrId: f.id, institutionId: f.institutionId, createdAt: todayStr });
      count++;
    }
  });
  res.json({ message: `Maturity scanner completed. ${count} new alerts.`, newAlerts: count });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  let logs = [...store.auditLogs];
  const { action, entityType } = req.query;
  if (action && action !== 'ALL') logs = logs.filter(l => l.action.includes(action));
  if (entityType && entityType !== 'ALL') logs = logs.filter(l => l.entityType === entityType);
  res.json(logs);
});

// Users
app.get('/api/users', (_req, res) => res.json(store.users));

// Settings
app.get('/api/settings', (_req, res) => res.json(store.settings));
app.post('/api/settings', (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  addAuditLog({ actorId: 'USR-001', actorName: 'Super Admin', actorRole: 'SUPER_ADMIN', action: 'SETTINGS_UPDATE', entityType: 'SETTINGS', entityId: 'GLOBAL_SETTINGS', ipAddress: req.ip || '127.0.0.1', details: `Updated settings: ${JSON.stringify(req.body)}` });
  res.json(store.settings);
});
app.post('/api/settings/reset', (_req, res) => {
  store.users = JSON.parse(JSON.stringify(initialUsers));
  store.institutions = JSON.parse(JSON.stringify(initialInstitutions));
  store.fdrs = JSON.parse(JSON.stringify(initialFDRs));
  store.reviewCases = JSON.parse(JSON.stringify(initialReviewCases));
  store.bankAttempts = JSON.parse(JSON.stringify(initialBankAttempts));
  store.notifications = JSON.parse(JSON.stringify(initialNotifications));
  store.auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));
  store.settings = JSON.parse(JSON.stringify(initialSettings));
  res.json({ message: 'Database reset to initial synthetic demo seed data successfully.' });
});

// CSV Export
app.get('/api/reports/export-csv', (req, res) => {
  const { type } = req.query;
  let csvRows = [];
  if (type === 'institutions') {
    csvRows.push('Institution ID,AICTE Code,Institution Name,Type,State,City,Total FDRs,Total Deposit Value (INR),Compliance Status');
    store.institutions.forEach(i => csvRows.push(`"${i.id}","${i.code}","${i.name}","${i.type}","${i.state}","${i.city}",${i.totalDeposits},${i.totalValue},"${i.complianceStatus}"`));
  } else if (type === 'audit') {
    csvRows.push('Log ID,Timestamp,Actor Name,Actor Role,Action,Entity Type,Entity ID,IP Address,Details');
    store.auditLogs.forEach(l => csvRows.push(`"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.entityType}","${l.entityId}","${l.ipAddress}","${(l.details || '').replace(/"/g, '""')}"`));
  } else {
    let records = store.fdrs;
    if (type === 'verified') records = store.fdrs.filter(f => f.status === 'VERIFIED');
    if (type === 'pending') records = store.fdrs.filter(f => f.status === 'PENDING_VERIFICATION');
    if (type === 'flagged') records = store.fdrs.filter(f => f.status === 'FLAGGED_FOR_REVIEW');
    csvRows.push('Record ID,Institution Name,AICTE Code,Bank Name,Branch,FDR Receipt No,Account (Masked),Principal Amount (INR),Interest Rate,Issue Date,Maturity Date,Status,Verified By,Flags Count');
    records.forEach(r => csvRows.push(`"${r.id}","${r.institutionName}","${r.institutionCode}","${r.bankName}","${r.bankBranch}","${r.fdrNumber}","${r.accountNumberMasked}",${r.principalAmount},${r.interestRate},"${r.issueDate}","${r.maturityDate}","${r.status}","${r.verifiedBy || 'N/A'}",${r.flags?.length || 0}`));
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=SmartFDR_Export_${type || 'records'}_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csvRows.join('\n'));
});

export default app;

