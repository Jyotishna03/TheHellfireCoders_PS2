export type UserRole = 'SUPER_ADMIN' | 'AICTE_OFFICER' | 'COLLEGE_ADMIN' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  institutionId?: string;
  institutionName?: string;
}

export type FDRStatus = 
  | 'DRAFT'
  | 'UPLOADED'
  | 'OCR_PROCESSING'
  | 'NEEDS_CORRECTION'
  | 'PENDING_VERIFICATION'
  | 'VERIFICATION_IN_PROGRESS'
  | 'VERIFIED'
  | 'REJECTED'
  | 'FLAGGED_FOR_REVIEW'
  | 'EXPIRED'
  | 'MATURED';

export interface ReviewFlag {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface OCRFieldConfidence {
  value: string;
  confidence: number; // 0 - 100
  flagged?: boolean;
  extractedRaw?: string;
}

export interface OCRExtractionData {
  institutionName: OCRFieldConfidence;
  institutionCode: OCRFieldConfidence;
  bankName: OCRFieldConfidence;
  bankBranch: OCRFieldConfidence;
  fdrNumber: OCRFieldConfidence;
  accountNumber: OCRFieldConfidence;
  principalAmount: OCRFieldConfidence;
  interestRate: OCRFieldConfidence;
  issueDate: OCRFieldConfidence;
  maturityDate: OCRFieldConfidence;
  depositHolder: OCRFieldConfidence;
  receiptReference: OCRFieldConfidence;
  overallConfidence: number;
  engine: string;
  isFallbackManual: boolean;
  processedAt: string;
}

export interface FDRRecord {
  id: string; // e.g. FDR-2026-0101
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  bankName: string;
  bankBranch: string;
  fdrNumber: string;
  accountNumberMasked: string; // e.g. "•••• •••• 4910"
  principalAmount: number;
  interestRate: number;
  issueDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  depositHolder: string;
  receiptReference: string;
  documentFileName: string;
  documentFilePath: string;
  documentMimeType: string;
  documentSizeBytes: number;
  documentHash: string; // SHA-256 for exact duplicate check
  status: FDRStatus;
  flags: ReviewFlag[];
  ocrData?: OCRExtractionData;
  verifiedBy?: string;
  verifiedAt?: string;
  correctionReason?: string;
  rejectionReason?: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: 'University' | 'Engineering College' | 'Polytechnic' | 'Management Institute' | 'Pharmacy College';
  state: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  totalDeposits: number;
  totalValue: number;
  complianceStatus: 'Compliant' | 'Pending Review' | 'Non-Compliant';
}

export interface BankVerificationAttempt {
  id: string;
  fdrId: string;
  bankName: string;
  fdrNumber: string;
  provider: 'MOCK_CORE_BANKING_API';
  status: 'SUCCESS' | 'MISMATCH' | 'UNAVAILABLE' | 'TIMEOUT';
  attemptedAt: string;
  attemptedBy: string;
  responseCode: string;
  responseMessage: string;
  maskedPayload: {
    receiptNumber: string;
    holderName: string;
    amountCheck: string;
    statusReported: string;
  };
  matchedFields: string[];
  mismatchedFields: string[];
}

export interface ReviewCase {
  id: string; // e.g. CASE-2026-081
  fdrId: string;
  fdrNumber: string;
  institutionName: string;
  institutionCode: string;
  ruleTriggered: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'RESOLVED_VALID' | 'RESOLVED_REJECTED';
  assignedTo?: string;
  detectedAt: string;
  supportingEvidence: {
    field: string;
    enteredValue: string;
    comparisonValue: string;
    source: string;
    note: string;
  }[];
  notes: {
    id: string;
    author: string;
    role: string;
    text: string;
    createdAt: string;
  }[];
  decision?: {
    action: string;
    reason: string;
    decidedBy: string;
    decidedAt: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'MATURITY' | 'DISCREPANCY' | 'VERIFICATION' | 'SYSTEM';
  severity: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
  fdrId?: string;
  institutionId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'FDR' | 'INSTITUTION' | 'REVIEW_CASE' | 'BANK_VERIFICATION' | 'SETTINGS' | 'USER';
  entityId: string;
  ipAddress: string;
  details: string;
}

export interface IntegrationSettings {
  mockBankMode: 'AUTO_SUCCESS' | 'SIMULATE_MISMATCH' | 'SIMULATE_TIMEOUT' | 'SIMULATE_UNAVAILABLE';
  mockBankLatencyMs: number;
  duplicateReceiptDetection: boolean;
  exactDocumentHashDetection: boolean;
  ocrConfidenceThreshold: number; // e.g. 75
  maturityNotificationWindows: number[]; // e.g. [30, 15, 7, 0]
  autoFlagAnomalies: boolean;
}

