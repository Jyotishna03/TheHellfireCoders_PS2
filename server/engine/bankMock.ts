export interface BankVerificationRequest {
  fdrId: string;
  bankName: string;
  fdrNumber: string;
  principalAmount: number;
  institutionName: string;
  accountNumberMasked: string;
  requestedBy: string;
}

export interface BankVerificationResult {
  attemptId: string;
  fdrId: string;
  bankName: string;
  fdrNumber: string;
  provider: 'MOCK_CORE_BANKING_API';
  status: 'SUCCESS' | 'MISMATCH' | 'UNAVAILABLE' | 'TIMEOUT';
  responseCode: string;
  responseMessage: string;
  attemptedAt: string;
  attemptedBy: string;
  matchedFields: string[];
  mismatchedFields: string[];
  maskedPayload: {
    receiptNumber: string;
    holderName: string;
    amountCheck: string;
    statusReported: string;
  };
  simulatedProviderNotes: string;
}

export function executeMockBankVerification(
  req: BankVerificationRequest,
  simulationMode: 'AUTO_SUCCESS' | 'SIMULATE_MISMATCH' | 'SIMULATE_TIMEOUT' | 'SIMULATE_UNAVAILABLE' = 'AUTO_SUCCESS'
): BankVerificationResult {
  const attemptId = `ATTEMPT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();

  // If receipt number ends with specific suffix or mode forced, trigger test cases
  const isForcedTimeout = simulationMode === 'SIMULATE_TIMEOUT' || req.fdrNumber.toUpperCase().endsWith('-TMO');
  const isForcedMismatch = simulationMode === 'SIMULATE_MISMATCH' || req.fdrNumber.toUpperCase().endsWith('-MIS');
  const isForcedUnavailable = simulationMode === 'SIMULATE_UNAVAILABLE' || req.fdrNumber.toUpperCase().endsWith('-ERR');

  if (isForcedTimeout) {
    return {
      attemptId,
      fdrId: req.fdrId,
      bankName: req.bankName,
      fdrNumber: req.fdrNumber,
      provider: 'MOCK_CORE_BANKING_API',
      status: 'TIMEOUT',
      responseCode: 'GATEWAY_TIMEOUT_504',
      responseMessage: `Core Banking Integration Gateway for ${req.bankName} did not respond within the 15000ms SLA window.`,
      attemptedAt: now,
      attemptedBy: req.requestedBy,
      matchedFields: [],
      mismatchedFields: ['Gateway Response'],
      maskedPayload: {
        receiptNumber: req.fdrNumber,
        holderName: '••••••••••••',
        amountCheck: 'UNCONFIRMED',
        statusReported: 'CONNECTION_TIMED_OUT'
      },
      simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Gateway socket closed before response received. Can retry verification safely.'
    };
  }

  if (isForcedUnavailable) {
    return {
      attemptId,
      fdrId: req.fdrId,
      bankName: req.bankName,
      fdrNumber: req.fdrNumber,
      provider: 'MOCK_CORE_BANKING_API',
      status: 'UNAVAILABLE',
      responseCode: 'SERVICE_UNAVAILABLE_503',
      responseMessage: `The API endpoint for ${req.bankName} is temporarily undergoing scheduled end-of-day reconciliation.`,
      attemptedAt: now,
      attemptedBy: req.requestedBy,
      matchedFields: [],
      mismatchedFields: ['Service Availability'],
      maskedPayload: {
        receiptNumber: req.fdrNumber,
        holderName: '••••••••••••',
        amountCheck: 'UNCONFIRMED',
        statusReported: 'BANK_SYSTEM_OFFLINE'
      },
      simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Upstream CBS adapter returned HTTP 503. This is a temporary network state, not a fraud indicator.'
    };
  }

  if (isForcedMismatch) {
    return {
      attemptId,
      fdrId: req.fdrId,
      bankName: req.bankName,
      fdrNumber: req.fdrNumber,
      provider: 'MOCK_CORE_BANKING_API',
      status: 'MISMATCH',
      responseCode: 'CBS_RECORD_MISMATCH_409',
      responseMessage: `Bank CBS located record for receipt "${req.fdrNumber}", but reported a value disparity.`,
      attemptedAt: now,
      attemptedBy: req.requestedBy,
      matchedFields: ['Receipt Number Exists', 'Issuing Branch'],
      mismatchedFields: ['Deposit Amount (CBS records ₹1,00,000 lower)', 'Deposit Holder Title'],
      maskedPayload: {
        receiptNumber: req.fdrNumber,
        holderName: `${req.institutionName.substring(0, 5)}... [Discrepancy]`,
        amountCheck: 'AMOUNT_MISMATCH',
        statusReported: 'RECORD_FOUND_DISCREPANT'
      },
      simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: CBS verification returned field mismatches. Note: Bank discrepancies require manual human review; never conclude fraud prematurely.'
    };
  }

  // Default: Success
  return {
    attemptId,
    fdrId: req.fdrId,
    bankName: req.bankName,
    fdrNumber: req.fdrNumber,
    provider: 'MOCK_CORE_BANKING_API',
    status: 'SUCCESS',
    responseCode: 'CBS_CONFIRMED_200',
    responseMessage: `Deposit receipt verified successfully against ${req.bankName} Core Banking Records.`,
    attemptedAt: now,
    attemptedBy: req.requestedBy,
    matchedFields: [
      'FDR Receipt Number Valid',
      'Principal Amount Matches Exactly',
      'Account Lien Status: AICTE Marked',
      'Active & In-Force Deposit'
    ],
    mismatchedFields: [],
    maskedPayload: {
      receiptNumber: req.fdrNumber,
      holderName: req.institutionName,
      amountCheck: `₹${req.principalAmount.toLocaleString('en-IN')}`,
      statusReported: 'ACTIVE_SECURITY_DEPOSIT'
    },
    simulatedProviderNotes: 'SIMULATED MOCK TELEMETRY: Standard mock banking confirmation returned. This is synthetic test data for hackathon demo.'
  };
}

