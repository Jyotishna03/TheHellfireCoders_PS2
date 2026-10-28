import fs from 'fs';
import path from 'path';

function createSimplePDF({
  bankName,
  branch,
  receiptNo,
  accountNo,
  amount,
  amountWords,
  holderName,
  institutionName,
  issueDate,
  maturityDate,
  interestRate,
  lienText,
  authCode
}) {
  // PostScript commands inside content stream
  const lines = [
    // Header Border Box
    '0.1 0.2 0.35 rg', // Deep navy
    '25 720 562 48 re f',
    '1 1 1 rg', // White text
    'BT /F1 16 Tf 40 742 Td (' + bankName.toUpperCase() + ') Tj ET',
    'BT /F2 10 Tf 40 730 Td (' + branch + ') Tj ET',
    'BT /F1 11 Tf 430 738 Td (SECURITY DEPOSIT RECEIPT) Tj ET',

    // Subtitle
    '0.2 0.2 0.2 rg',
    'BT /F1 13 Tf 140 680 Td (TERM DEPOSIT RECEIPT / AICTE STATUTORY LIEN) Tj ET',
    '0.8 0.8 0.8 RG 25 670 562 0.5 re S',

    // Receipt Metadata Box
    '0.96 0.97 0.98 rg 25 560 562 100 re f',
    '0.8 0.8 0.8 RG 25 560 562 100 re S',
    '0 0 0 rg',
    'BT /F1 10 Tf 40 642 Td (FDR / Certificate No:) Tj ET',
    'BT /F1 11 Tf 160 642 Td (' + receiptNo + ') Tj ET',
    'BT /F1 10 Tf 350 642 Td (Account No (Masked):) Tj ET',
    'BT /F2 10 Tf 470 642 Td (' + accountNo + ') Tj ET',

    'BT /F1 10 Tf 40 615 Td (Principal Deposit Sum:) Tj ET',
    'BT /F1 12 Tf 160 615 Td (' + amount + ') Tj ET',
    'BT /F1 10 Tf 350 615 Td (Annual Interest Rate:) Tj ET',
    'BT /F2 10 Tf 470 615 Td (' + interestRate + ') Tj ET',

    'BT /F1 10 Tf 40 588 Td (Amount in Words:) Tj ET',
    'BT /F2 9 Tf 160 588 Td (' + amountWords + ') Tj ET',

    'BT /F1 10 Tf 40 565 Td (Date of Issuance:) Tj ET',
    'BT /F2 10 Tf 160 565 Td (' + issueDate + ') Tj ET',
    'BT /F1 10 Tf 350 565 Td (Date of Maturity:) Tj ET',
    'BT /F1 10 Tf 470 565 Td (' + maturityDate + ') Tj ET',

    // Beneficiary Details Box
    '0.98 0.98 0.98 rg 25 430 562 110 re f',
    '0.8 0.8 0.8 RG 25 430 562 110 re S',
    '0.05 0.5 0.45 rg', // Teal
    'BT /F1 11 Tf 40 522 Td (DEPOSIT HOLDER & LIEN PARTICULARS) Tj ET',
    '0 0 0 rg',
    'BT /F1 10 Tf 40 498 Td (In the Name of:) Tj ET',
    'BT /F1 10 Tf 160 498 Td (' + holderName + ') Tj ET',

    'BT /F1 10 Tf 40 472 Td (Educational Institution:) Tj ET',
    'BT /F2 10 Tf 160 472 Td (' + institutionName + ') Tj ET',

    'BT /F1 10 Tf 40 445 Td (Statutory Lien Condition:) Tj ET',
    'BT /F2 9 Tf 160 445 Td (' + lienText + ') Tj ET',

    // Official Bank Mandate Notice
    '0.95 0.95 0.95 rg 25 330 562 80 re f',
    '0.85 0.85 0.85 RG 25 330 562 80 re S',
    '0.2 0.2 0.2 rg',
    'BT /F1 9 Tf 40 395 Td (BANK MANDATE & UNDERTAKING TO AICTE:) Tj ET',
    'BT /F2 8 Tf 40 380 Td (1. This security deposit is held under lien to the Member Secretary, AICTE New Delhi.) Tj ET',
    'BT /F2 8 Tf 40 365 Td (2. No loan, overdraft, premature encashment, or lien transfer shall be permitted without prior written Council consent.) Tj ET',
    'BT /F2 8 Tf 40 350 Td (3. Interest accrued shall remain linked to the deposit unless auto-reinvested in renewal terms.) Tj ET',

    // Signature Seals Box
    '0.8 0.8 0.8 RG 25 210 562 100 re S',
    '0.3 0.3 0.3 rg',
    'BT /F2 9 Tf 60 230 Td (Branch Accountant / Officer) Tj ET',
    'BT /F1 9 Tf 380 230 Td (Authorized Branch Manager & Seal) Tj ET',
    '0.1 0.2 0.35 RG 360 250 180 50 re S',
    '0.1 0.2 0.35 rg',
    'BT /F1 8 Tf 375 285 Td (SCHEDULED COMMERCIAL BANK) Tj ET',
    'BT /F2 8 Tf 375 270 Td (CBS SEAL: ' + authCode + ') Tj ET',
    'BT /F2 7 Tf 375 258 Td (Digitally Confirmed on CBS Gateway) Tj ET',

    // Footer
    '0.5 0.5 0.5 rg',
    'BT /F2 8 Tf 160 160 Td (Generated for AICTE SmartFDR Security Deposit Verification System) Tj ET',
    'BT /F2 7 Tf 200 145 Td (Strictly Valid for Prototype & Evaluation Use Only) Tj ET'
  ];

  const streamContent = lines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  let pdf = '%PDF-1.4\n';
  const offsets = [];

  function addObj(str) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += str + '\n';
  }

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  addObj(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj'
  );
  addObj(
    '4 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + streamContent + '\nendstream\nendobj'
  );
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  addObj('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

  const startxref = Buffer.byteLength(pdf, 'utf-8');
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 0; i < 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';

  return Buffer.from(pdf, 'utf-8');
}

// Generate the 5 sample documents
const samples = [
  {
    fileName: 'Sample_1_SBI_RVCE_35Lakh_Valid.pdf',
    data: {
      bankName: 'State Bank of India',
      branch: 'Mysore Road Campus Branch, Bengaluru (IFSC: SBIN0040182)',
      receiptNo: 'SBI-FDR-8890214',
      accountNo: '9847291012',
      amount: 'INR 35,00,000.00',
      amountWords: 'Rupees Thirty-Five Lakhs Only',
      holderName: 'AICTE New Delhi a/c R.V. College of Engineering',
      institutionName: 'R.V. College of Engineering, Bengaluru (AICTE: 1-10972361)',
      issueDate: '10-Apr-2023',
      maturityDate: '10-Apr-2028',
      interestRate: '7.10% p.a.',
      lienText: 'Lien marked in favour of Member Secretary, AICTE New Delhi',
      authCode: 'SBI-BLR-AUTH-9041'
    }
  },
  {
    fileName: 'Sample_2_PNB_DTU_50Lakh_Valid.pdf',
    data: {
      bankName: 'Punjab National Bank',
      branch: 'Bawana Industrial Area Branch, New Delhi (IFSC: PUNB0192800)',
      receiptNo: 'PNB-DEL-9921443',
      accountNo: '8871024421',
      amount: 'INR 50,00,000.00',
      amountWords: 'Rupees Fifty Lakhs Only',
      holderName: 'AICTE a/c Delhi Technological University',
      institutionName: 'Delhi Technological University (AICTE: 1-20984511)',
      issueDate: '15-Aug-2022',
      maturityDate: '15-Aug-2027',
      interestRate: '7.25% p.a.',
      lienText: 'Statutory lien noted for establishment of academic programmes',
      authCode: 'PNB-DEL-AUTH-4412'
    }
  },
  {
    fileName: 'Sample_3_CanaraBank_Discrepancy_Test.pdf',
    data: {
      bankName: 'Canara Bank',
      branch: 'Main Road Branch, Ranchi (IFSC: CNRB0001092)',
      receiptNo: 'CNB-SEC-7740192',
      accountNo: '7721091928',
      amount: 'INR 50,00,000.00',
      amountWords: 'Rupees Fifty Lakhs Only',
      holderName: 'Birla Institute of Technology Trust', // Discrepant holder
      institutionName: 'Birla Institute of Technology, Mesra (AICTE: 1-51290384)',
      issueDate: '20-Jan-2024',
      maturityDate: '20-Jan-2029',
      interestRate: '6.90% p.a.',
      lienText: 'Drawn in name of Sponsoring Trust (Discrepancy Flag Test Case)',
      authCode: 'CNB-RNC-AUTH-7719'
    }
  },
  {
    fileName: 'Sample_4_BOB_NearMaturity_GP_Mumbai.pdf',
    data: {
      bankName: 'Bank of Baroda',
      branch: 'Bandra East Branch, Mumbai (IFSC: BARB0BANDRA)',
      receiptNo: 'BOB-MUM-5501928',
      accountNo: '9920185510',
      amount: 'INR 25,00,000.00',
      amountWords: 'Rupees Twenty-Five Lakhs Only',
      holderName: 'AICTE Security Deposit a/c Government Polytechnic Mumbai',
      institutionName: 'Government Polytechnic Mumbai (AICTE: 1-89301244)',
      issueDate: '14-Feb-2024',
      maturityDate: '20-Nov-2026', // Approaching maturity (~23 days)
      interestRate: '6.80% p.a.',
      lienText: 'Subject to 30-day renewal notice in terms of AICTE guidelines',
      authCode: 'BOB-MUM-AUTH-5520'
    }
  },
  {
    fileName: 'Sample_5_HDFC_Expiring_Deposit_HBTU.pdf',
    data: {
      bankName: 'HDFC Bank',
      branch: 'Civil Lines Branch, Kanpur (IFSC: HDFC0000129)',
      receiptNo: 'HDFC-KNP-1102948',
      accountNo: '501004829981',
      amount: 'INR 30,00,000.00',
      amountWords: 'Rupees Thirty Lakhs Only',
      holderName: 'AICTE Joint a/c HBTU Kanpur',
      institutionName: 'Harcourt Butler Technical University (AICTE: 1-10294821)',
      issueDate: '01-Mar-2024',
      maturityDate: '05-Nov-2026', // Expiring in 8 days
      interestRate: '7.00% p.a.',
      lienText: 'Critical Maturity Window test candidate (≤ 8 days remaining)',
      authCode: 'HDFC-KNP-AUTH-1102'
    }
  }
];

const targetDirs = [
  path.resolve(process.cwd(), 'sample_documents'),
  path.resolve(process.cwd(), 'server/uploads/samples'),
  path.resolve(process.cwd(), 'dist/samples') // Also copy to static client assets if dist exists
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

samples.forEach(s => {
  const buf = createSimplePDF(s.data);
  targetDirs.forEach(dir => {
    const p = path.join(dir, s.fileName);
    fs.writeFileSync(p, buf);
  });
  console.log(`Generated sample PDF: ${s.fileName} (${buf.length} bytes)`);
});

