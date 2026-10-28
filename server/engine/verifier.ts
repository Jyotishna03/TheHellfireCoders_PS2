import crypto from 'crypto';

export interface VerificationRuleResult {
  ruleCode: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  passed: boolean;
  evidence?: {
    field: string;
    enteredValue: string;
    comparisonValue: string;
    source: string;
    note: string;
  };
}

export interface VerificationCheckInput {
  institutionName: string;
  institutionCode: string;
  bankName: string;
  bankBranch: string;
  fdrNumber: string;
  principalAmount: number;
  issueDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  depositHolder: string;
  documentHash: string;
  ocrData?: any;
  existingRecords: Array<{
    id: string;
    institutionId: string;
    institutionName: string;
    bankName: string;
    fdrNumber: string;
    principalAmount: number;
    issueDate: string;
    maturityDate: string;
    documentHash: string;
    status: string;
  }>;
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function runVerificationRules(input: VerificationCheckInput): {
  isValid: boolean;
  flags: Array<{
    id: string;
    ruleCode: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resolved: boolean;
  }>;
  caseEvidence: Array<{
    field: string;
    enteredValue: string;
    comparisonValue: string;
    source: string;
    note: string;
  }>;
} {
  const flags: Array<any> = [];
  const caseEvidence: Array<any> = [];

  // Rule 1: Required Fields
  if (!input.fdrNumber || !input.bankName || !input.principalAmount || !input.issueDate || !input.maturityDate) {
    flags.push({
      id: `FLAG-${Date.now()}-REQ`,
      ruleCode: 'RULE_REQUIRED_FIELDS',
      title: 'Incomplete Submission Metadata',
      description: 'One or more mandatory FDR fields are missing or blank. Manual review required.',
      severity: 'HIGH',
      resolved: false
    });
    caseEvidence.push({
      field: 'Mandatory Fields',
      enteredValue: 'Incomplete',
      comparisonValue: 'All required fields present',
      source: 'Data Schema Validation',
      note: 'One or more mandatory parameters could not be validated.'
    });
  }

  // Rule 2: Positive Amount Validation
  if (input.principalAmount <= 0 || isNaN(input.principalAmount)) {
    flags.push({
      id: `FLAG-${Date.now()}-AMT`,
      ruleCode: 'RULE_INVALID_AMOUNT',
      title: 'Potential Amount Discrepancy',
      description: 'The specified security deposit amount is non-positive or invalid. Verification cannot proceed without correction.',
      severity: 'CRITICAL',
      resolved: false
    });
    caseEvidence.push({
      field: 'Principal Amount',
      enteredValue: `₹${input.principalAmount}`,
      comparisonValue: '> ₹0.00',
      source: 'Financial Sanity Check',
      note: 'Security deposit value must be a strictly positive denomination.'
    });
  }

  // Rule 3: Date Chronology (Maturity after Issue Date)
  if (input.issueDate && input.maturityDate) {
    const issueTime = new Date(input.issueDate).getTime();
    const maturityTime = new Date(input.maturityDate).getTime();
    if (maturityTime <= issueTime) {
      flags.push({
        id: `FLAG-${Date.now()}-DATE-CHRON`,
        ruleCode: 'RULE_DATE_CHRONOLOGY',
        title: 'Potential Date Chronology Inconsistency',
        description: 'Maturity date is earlier than or equal to the deposit issue date. Document review required.',
        severity: 'HIGH',
        resolved: false
      });
      caseEvidence.push({
        field: 'Maturity vs Issue Date',
        enteredValue: `Issue: ${input.issueDate}, Maturity: ${input.maturityDate}`,
        comparisonValue: 'Maturity > Issue Date',
        source: 'Deposit Chronology Rule',
        note: 'Maturity cannot precede or equal the issuance date.'
      });
    }
  }

  // Rule 4: Exact Duplicate Receipt Number Across Records
  const exactDuplicate = input.existingRecords.find(
    r => r.fdrNumber.trim().toUpperCase() === input.fdrNumber.trim().toUpperCase()
  );
  if (exactDuplicate) {
    flags.push({
      id: `FLAG-${Date.now()}-DUP-REC`,
      ruleCode: 'RULE_EXACT_DUP_RECEIPT',
      title: 'Potential Duplicate Receipt Number',
      description: `Receipt number "${input.fdrNumber}" matches an existing record (${exactDuplicate.id}) registered under "${exactDuplicate.institutionName}". Requires administrative review.`,
      severity: 'CRITICAL',
      resolved: false
    });
    caseEvidence.push({
      field: 'FDR Receipt Number',
      enteredValue: input.fdrNumber,
      comparisonValue: `${exactDuplicate.fdrNumber} (in record ${exactDuplicate.id})`,
      source: 'Central FDR Registry Index',
      note: `Record already lodged by ${exactDuplicate.institutionName}. Dual lodgement candidate.`
    });
  }

  // Rule 5: Duplicate Document Hash (Exact Same File Uploaded)
  if (input.documentHash) {
    const hashDuplicate = input.existingRecords.find(
      r => r.documentHash === input.documentHash
    );
    if (hashDuplicate) {
      flags.push({
        id: `FLAG-${Date.now()}-DUP-HASH`,
        ruleCode: 'RULE_EXACT_DOC_HASH',
        title: 'Identical Document File Detected',
        description: `Uploaded file binary hash matches existing record ${hashDuplicate.id}. A duplicate document upload may have occurred.`,
        severity: 'HIGH',
        resolved: false
      });
      caseEvidence.push({
        field: 'SHA-256 Checksum',
        enteredValue: input.documentHash.substring(0, 16) + '...',
        comparisonValue: hashDuplicate.documentHash.substring(0, 16) + '...',
        source: 'Cryptographic Document Store',
        note: `Binary collision with previously lodged document in ${hashDuplicate.id}.`
      });
    }
  }

  // Rule 6: Similar Record Match (Fuzzy Candidate: same Bank, exact same amount, matching maturity month)
  if (!exactDuplicate) {
    const similarCandidate = input.existingRecords.find(r => 
      r.bankName.toLowerCase().trim() === input.bankName.toLowerCase().trim() &&
      Math.abs(r.principalAmount - input.principalAmount) < 1 &&
      r.maturityDate.substring(0, 7) === input.maturityDate.substring(0, 7)
    );
    if (similarCandidate) {
      flags.push({
        id: `FLAG-${Date.now()}-SIMILAR`,
        ruleCode: 'RULE_SIMILAR_RECORD',
        title: 'Potential Duplicate Candidate (Similar Parameters)',
        description: `Deposit matches an existing entry (${similarCandidate.id}) with identical bank, amount (₹${input.principalAmount}), and maturity period. Requires cross-verification.`,
        severity: 'MEDIUM',
        resolved: false
      });
      caseEvidence.push({
        field: 'Deposit Amount & Period',
        enteredValue: `₹${input.principalAmount} @ ${input.bankName} (due ${input.maturityDate})`,
        comparisonValue: `₹${similarCandidate.principalAmount} in ${similarCandidate.id}`,
        source: 'Heuristic Pattern Matching',
        note: 'High similarity in financial attributes. Human confirmation recommended.'
      });
    }
  }

  // Rule 7: OCR Metadata Consistency (if OCR data provided)
  if (input.ocrData && !input.ocrData.isFallbackManual) {
    const ocrInst = input.ocrData.institutionName?.value?.toLowerCase() || '';
    const enteredInst = input.institutionName.toLowerCase();
    
    // Simple substring or token check
    const words = enteredInst.split(/\s+/).filter(w => w.length > 3);
    const matchesAnyWord = words.some(w => ocrInst.includes(w));

    if (ocrInst && !matchesAnyWord && input.ocrData.institutionName.confidence > 70) {
      flags.push({
        id: `FLAG-${Date.now()}-NAME-MISMATCH`,
        ruleCode: 'RULE_NAME_MISMATCH',
        title: 'Potential Institution Name Discrepancy',
        description: 'Extracted text on receipt differs from registered institution name. Verify that the deposit is drawn in the legal name of the institution.',
        severity: 'MEDIUM',
        resolved: false
      });
      caseEvidence.push({
        field: 'Institution Name',
        enteredValue: input.institutionName,
        comparisonValue: input.ocrData.institutionName.value,
        source: 'OCR Document Extraction',
        note: 'Header text on scanned certificate differs from institution profile.'
      });
    }

    // Rule 8: Low OCR Confidence Alert
    if (input.ocrData.overallConfidence < 75) {
      flags.push({
        id: `FLAG-${Date.now()}-LOW-CONF`,
        ruleCode: 'RULE_LOW_OCR_CONFIDENCE',
        title: 'Low OCR Extraction Confidence',
        description: `Average document clarity score is ${input.ocrData.overallConfidence}%. Manual verification of printed characters recommended before authorization.`,
        severity: 'LOW',
        resolved: false
      });
      caseEvidence.push({
        field: 'OCR Confidence Metric',
        enteredValue: `${input.ocrData.overallConfidence}%`,
        comparisonValue: '>= 75.0% Recommended',
        source: 'Computer Vision Optical Engine',
        note: 'Scan quality or resolution may impact automated reading.'
      });
    }
  }

  // Rule 9: Maturity Already Expired
  if (input.maturityDate) {
    const today = new Date().toISOString().split('T')[0];
    if (input.maturityDate < today) {
      flags.push({
        id: `FLAG-${Date.now()}-EXPIRED`,
        ruleCode: 'RULE_ALREADY_EXPIRED',
        title: 'Maturity Date In the Past',
        description: `Deposit maturity date (${input.maturityDate}) has already passed. Renewal certificate or renewal confirmation required.`,
        severity: 'MEDIUM',
        resolved: false
      });
      caseEvidence.push({
        field: 'Current Status',
        enteredValue: `Maturity: ${input.maturityDate}`,
        comparisonValue: `Current Date: ${today}`,
        source: 'Calendar Temporal Validator',
        note: 'Security deposit is overdue for renewal.'
      });
    }
  }

  return {
    isValid: flags.filter(f => f.severity === 'CRITICAL').length === 0,
    flags,
    caseEvidence
  };
}

