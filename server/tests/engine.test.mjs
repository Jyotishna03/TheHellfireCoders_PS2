import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { runVerificationRules, computeFileHash } from '../engine/verifier.js';
import { executeMockBankVerification } from '../engine/bankMock.js';
import { db } from '../db/store.js';

test('1. File Hash Calculation and Exact Duplicate Document Detection', () => {
  const buf1 = Buffer.from('TEST_FDR_CERTIFICATE_CONTENT_A');
  const buf2 = Buffer.from('TEST_FDR_CERTIFICATE_CONTENT_A');
  const buf3 = Buffer.from('TEST_FDR_CERTIFICATE_CONTENT_DIFFERENT');

  const hash1 = computeFileHash(buf1);
  const hash2 = computeFileHash(buf2);
  const hash3 = computeFileHash(buf3);

  assert.strictEqual(hash1, hash2, 'Identical buffers must produce identical SHA-256 hashes');
  assert.notStrictEqual(hash1, hash3, 'Different buffers must produce different hashes');

  // Test duplicate detection rule
  const result = runVerificationRules({
    institutionName: 'Test College',
    institutionCode: '1-0001',
    bankName: 'SBI',
    bankBranch: 'Main',
    fdrNumber: 'NEW-FDR-999',
    principalAmount: 1000000,
    issueDate: '2024-01-01',
    maturityDate: '2029-01-01',
    depositHolder: 'AICTE Joint Account',
    documentHash: hash1,
    existingRecords: [
      {
        id: 'FDR-PREV',
        institutionId: 'INST-001',
        institutionName: 'Previous College',
        bankName: 'SBI',
        fdrNumber: 'PREV-FDR-111',
        principalAmount: 1000000,
        issueDate: '2023-01-01',
        maturityDate: '2028-01-01',
        documentHash: hash1, // Colliding hash
        status: 'VERIFIED'
      }
    ]
  });

  const dupFlag = result.flags.find(f => f.ruleCode === 'RULE_EXACT_DOC_HASH');
  assert.ok(dupFlag, 'Should flag exact document hash collision');
  assert.strictEqual(dupFlag.severity, 'HIGH');
});

test('2. Missing Required Fields Validation', () => {
  const result = runVerificationRules({
    institutionName: 'Test College',
    institutionCode: '1-0001',
    bankName: '', // Missing bank name
    bankBranch: '',
    fdrNumber: '', // Missing receipt number
    principalAmount: 0, // Missing amount
    issueDate: '',
    maturityDate: '',
    depositHolder: '',
    documentHash: 'samplehash',
    existingRecords: []
  });

  const reqFlag = result.flags.find(f => f.ruleCode === 'RULE_REQUIRED_FIELDS');
  assert.ok(reqFlag, 'Must flag missing mandatory fields');
  assert.strictEqual(reqFlag.severity, 'HIGH');
});

test('3. Positive Amount and Date Chronology Rules', () => {
  // Chronology inversion (Maturity earlier than Issue)
  const result = runVerificationRules({
    institutionName: 'Test College',
    institutionCode: '1-0001',
    bankName: 'State Bank of India',
    bankBranch: 'Main',
    fdrNumber: 'FDR-CHRON-001',
    principalAmount: -50000, // Negative amount
    issueDate: '2025-06-01',
    maturityDate: '2024-06-01', // Earlier than issue date!
    depositHolder: 'AICTE Joint Account',
    documentHash: 'uniquehash1',
    existingRecords: []
  });

  const amtFlag = result.flags.find(f => f.ruleCode === 'RULE_INVALID_AMOUNT');
  const dateFlag = result.flags.find(f => f.ruleCode === 'RULE_DATE_CHRONOLOGY');

  assert.ok(amtFlag, 'Must flag invalid/negative amount');
  assert.ok(dateFlag, 'Must flag maturity date preceding issue date');
  assert.strictEqual(result.isValid, false, 'Critical flags must mark record invalid');
});

test('4. Exact Duplicate Receipt Number Detection Across Records', () => {
  const result = runVerificationRules({
    institutionName: 'College B',
    institutionCode: '1-0002',
    bankName: 'Canara Bank',
    bankBranch: 'City Branch',
    fdrNumber: 'FDR-DUPLICATE-KEY',
    principalAmount: 2500000,
    issueDate: '2024-01-01',
    maturityDate: '2029-01-01',
    depositHolder: 'AICTE Joint Account',
    documentHash: 'differenthash',
    existingRecords: [
      {
        id: 'FDR-2024-EXISTING',
        institutionId: 'INST-001',
        institutionName: 'College A',
        bankName: 'Canara Bank',
        fdrNumber: 'FDR-DUPLICATE-KEY', // Identical receipt number
        principalAmount: 2500000,
        issueDate: '2024-01-01',
        maturityDate: '2029-01-01',
        documentHash: 'previoushash',
        status: 'VERIFIED'
      }
    ]
  });

  const exactDupFlag = result.flags.find(f => f.ruleCode === 'RULE_EXACT_DUP_RECEIPT');
  assert.ok(exactDupFlag, 'Must flag duplicate receipt number');
  assert.strictEqual(exactDupFlag.severity, 'CRITICAL');
});

test('5. Low Confidence OCR and Name Mismatch Flagging', () => {
  const result = runVerificationRules({
    institutionName: 'Indian Institute of Information Technology',
    institutionCode: '1-0099',
    bankName: 'HDFC Bank',
    bankBranch: 'Main',
    fdrNumber: 'HDFC-8821',
    principalAmount: 3000000,
    issueDate: '2024-02-01',
    maturityDate: '2029-02-01',
    depositHolder: 'AICTE Joint Account',
    documentHash: 'hashlowconf',
    ocrData: {
      institutionName: { value: 'Completely Different Medical Society', confidence: 85 },
      overallConfidence: 65, // Below 75% threshold
      isFallbackManual: false
    },
    existingRecords: []
  });

  const confFlag = result.flags.find(f => f.ruleCode === 'RULE_LOW_OCR_CONFIDENCE');
  const nameFlag = result.flags.find(f => f.ruleCode === 'RULE_NAME_MISMATCH');

  assert.ok(confFlag, 'Must flag low OCR confidence');
  assert.ok(nameFlag, 'Must flag mismatch in extracted institution name');
});

test('6. Mock Bank Verification Integration (Success, Mismatch, Timeout)', () => {
  // Test Success
  const successRes = executeMockBankVerification(
    {
      fdrId: 'FDR-TEST-01',
      bankName: 'State Bank of India',
      fdrNumber: 'SBI-VALID-100',
      principalAmount: 5000000,
      institutionName: 'Test Tech Institute',
      accountNumberMasked: '•••• •••• 1234',
      requestedBy: 'Test Officer'
    },
    'AUTO_SUCCESS'
  );
  assert.strictEqual(successRes.status, 'SUCCESS');
  assert.strictEqual(successRes.responseCode, 'CBS_CONFIRMED_200');

  // Test Mismatch
  const mismatchRes = executeMockBankVerification(
    {
      fdrId: 'FDR-TEST-02',
      bankName: 'State Bank of India',
      fdrNumber: 'SBI-MISMATCH-100',
      principalAmount: 5000000,
      institutionName: 'Test Tech Institute',
      accountNumberMasked: '•••• •••• 1234',
      requestedBy: 'Test Officer'
    },
    'SIMULATE_MISMATCH'
  );
  assert.strictEqual(mismatchRes.status, 'MISMATCH');
  assert.strictEqual(mismatchRes.responseCode, 'CBS_RECORD_MISMATCH_409');

  // Test Timeout
  const timeoutRes = executeMockBankVerification(
    {
      fdrId: 'FDR-TEST-03',
      bankName: 'State Bank of India',
      fdrNumber: 'SBI-TIMEOUT-100',
      principalAmount: 5000000,
      institutionName: 'Test Tech Institute',
      accountNumberMasked: '•••• •••• 1234',
      requestedBy: 'Test Officer'
    },
    'SIMULATE_TIMEOUT'
  );
  assert.strictEqual(timeoutRes.status, 'TIMEOUT');
  assert.strictEqual(timeoutRes.responseCode, 'GATEWAY_TIMEOUT_504');
});

test('7. Database Persistence and Audit Trail', () => {
  const initialLogCount = db.getAuditLogs().length;

  const log = db.addAuditLog({
    actorId: 'USR-TEST',
    actorName: 'Test Tester',
    actorRole: 'AICTE_OFFICER',
    action: 'TEST_ACTION_EXECUTION',
    entityType: 'FDR',
    entityId: 'FDR-TEST-PERSIST',
    ipAddress: '127.0.0.1',
    details: 'Testing audit log creation and immutability'
  });

  assert.ok(log.id.startsWith('LOG-'));
  const currentLogs = db.getAuditLogs();
  assert.strictEqual(currentLogs.length, initialLogCount + 1);
  assert.strictEqual(currentLogs[0].action, 'TEST_ACTION_EXECUTION');
});

test('8. Alert Deduplication in Notification Engine', () => {
  const uniqueKey = `DEDUP-${Date.now()}-${Math.random()}`;
  const testNotif = {
    id: `NOTIF-${uniqueKey}`,
    title: `Duplicate Prevention Check ${uniqueKey}`,
    message: 'Test notification deduplication message',
    type: 'SYSTEM',
    severity: 'info',
    read: false,
    fdrId: `FDR-${uniqueKey}`,
    institutionId: 'INST-001',
    createdAt: new Date().toISOString()
  };

  const countBefore = db.getNotifications().length;
  db.addNotification(testNotif);
  const countAfterFirst = db.getNotifications().length;
  assert.strictEqual(countAfterFirst, countBefore + 1, 'First notification should be added');

  // Attempt duplicate addition
  db.addNotification({
    ...testNotif,
    id: `NOTIF-${uniqueKey}-SECOND`
  });
  const countAfterSecond = db.getNotifications().length;
  assert.strictEqual(countAfterSecond, countAfterFirst, 'Identical unread alert for same FDR must be deduplicated');
});
