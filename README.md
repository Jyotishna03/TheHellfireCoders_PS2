# SmartFDR — AI-Powered AICTE Security Deposit (FDR) Management & Fraud Detection Portal

A modern, responsive, full-stack enterprise web portal built for the **All India Council for Technical Education (AICTE)** to digitize the lodging, verification, maturity tracking, and fraud anomaly detection of Fixed Deposit Receipts (FDRs) submitted by educational institutions as statutory security deposits.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6
- **Backend**: Node.js & Express REST API (TypeScript with `tsx`)
- **Database & Persistence**: File-based ACID JSON store (`server/db/data.json`) surviving application restarts
- **Document Vault**: Private workspace storage with cryptographic SHA-256 hash collision detection
- **Optical Character Recognition (OCR)**: Tesseract layout extraction pipeline with field-level confidence indicators and an explicit manual fallback interface
- **Bank CBS Adapter**: Modular mock Core Banking System connector with configurable response modes (`SUCCESS`, `MISMATCH`, `TIMEOUT`, `UNAVAILABLE`) and masked payload protection

---

## 2. User Roles & Access Control (RBAC)

The portal features 4 distinct institutional stakeholder profiles with an instant top-bar role switcher for jury evaluation:

| Role | Demo Identity | Permitted Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | Dr. T. G. Sitharam (`chairman@aicte-india.org`) | System configuration, rule thresholds, mock CBS controls, user access, and global audit logs |
| **AICTE Officer** | Rajiv Kumar (`rajiv.kumar@aicte.gov.in`) | Queue review, Core Banking CBS checks, deposit approvals, correction requests, and case adjudication |
| **College Administrator** | Dr. Sneha Kulkarni (`principal@rvce.edu.in`) | Intake wizard, certificate upload, OCR metadata correction, and maturity renewal alerts |
| **Auditor / Reviewer (CAG)** | Vinod Sharma (`v.sharma@cag.gov.in`) | Independent financial oversight, forensic evidence comparison, audit notes, and statutory dossier export |

*Note: In production, the demo switcher is replaced by AICTE's centralized Single Sign-On (SSO) backed by OAuth2/OpenID Connect and hardware 2FA.*

---

## 3. Implemented Pages & Workspaces (All 16 Master Prompt Pages)

1. **Login & Controlled Demo Access** (`/login`): Instant role selection with privilege explanations.
2. **Main Dashboard** (`/`): 8 live data-driven KPI cards, status distribution donut chart, monthly submission trends, issuing bank breakdown, and discrepancy category charts.
3. **FDR Central Registry** (`/registry`): Full data grid with live search, bank/status/institution filters, column sorting, masked account views, and CSV export.
4. **Upload New FDR** (`/upload`): Multi-step wizard with file drag-and-drop (PDF/JPG/PNG), size validation, optical character recognition simulation, confidence badges, and fallback mode.
5. **FDR Record Details** (`/fdr/:id`): Deep inspection view with deposit financials, institution profile, document preview modal, bank verification attempt history, and officer action dialogs.
6. **OCR Extraction Review** (`/ocr-review`): Field-by-field OCR comparison bench showing confidence scores (e.g. 98%, 71%), discrepancy flags, and edit-and-save capabilities.
7. **Verification Queue** (`/verification-queue`): Prioritized officer workflow queue for pending deposits with 1-click Bank CBS checks and sanction controls.
8. **Suspicious Records / Fraud Review** (`/fraud-review`): Dedicated case management workspace (`CASE-2026-XXXX`) with side-by-side evidence tables, investigator notes, and non-accusatory adjudication.
9. **Institutions Management** (`/institutions`): Technical college directory with permanent AICTE codes, total deposit tallies, secured valuation in Crores/Lakhs, and FDR portfolio drawers.
10. **Maturity & Expiry Calendar** (`/maturity-calendar`): Horizon timeline categorizing deposits into 30-day, 15-day, 7-day, and overdue windows with renewal notice triggers.
11. **Alerts & Notification Center** (`/notifications`): Live alert feed with category filters, unread badge counter, and built-in alert deduplication.
12. **Reports & Statutory Exports** (`/reports`): Multi-dataset CSV exporter and print-ready AICTE formal audit report sheet with signature blocks.
13. **Immutable Audit Logs** (`/audit-logs`): Append-only governance ledger tracking actor, action, timestamp, entity ID, IP address, and change details.
14. **User & Role Management** (`/users`): Complete RBAC permissions matrix and demo persona directory.
15. **Settings & Integration Health** (`/settings`): Mock bank response mode selector, latency slider, rule toggles, and seed data reset trigger.
16. **Help & Jury Guide** (`/help`): Step-by-step 5-minute hackathon demonstration script and architecture FAQ.

---

## 4. Automated Integrity & Verification Engine Rules

The portal enforces deterministic financial and security rules:
- **`RULE_REQUIRED_FIELDS`**: Mandatory presence of deposit sum, receipt number, bank, and dates.
- **`RULE_INVALID_AMOUNT`**: Rejects non-positive or zero principal amounts.
- **`RULE_DATE_CHRONOLOGY`**: Maturity date must strictly follow the issue date.
- **`RULE_EXACT_DUP_RECEIPT`**: Detects duplicate receipt numbers across different educational institutions.
- **`RULE_EXACT_DOC_HASH`**: Cryptographic SHA-256 binary checksum comparison flags re-uploaded certificates.
- **`RULE_SIMILAR_RECORD`**: Fuzzy heuristic matching for identical bank, amount, and maturity month.
- **`RULE_NAME_MISMATCH`**: Identifies disparity between OCR extracted certificate header and registered college title.
- **`RULE_LOW_OCR_CONFIDENCE`**: Flags scans with clarity score below threshold (< 75%) for manual operator review.
- **`RULE_ALREADY_EXPIRED`**: Detects deposits whose maturity has already lapsed.

### Statutory Fraud-Safety Principle
A mismatch, OCR error, CBS gateway timeout, or duplicate candidate is **NOT proof of fraud**. The portal strictly uses non-accusatory terminology: *"Potential Discrepancy"*, *"Unable to Verify"*, and *"Requires Administrative Clarification"*.

---

## 5. Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v26.7)
- npm v9+

### Quick Start
1. Clone the repository and navigate into the project directory:
   ```bash
   cd smartFDR
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run both the Express API Server (port 5001) and Vite Frontend (port 5173) concurrently:
   ```bash
   npm run dev
   ```
4. Access the web application:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API Health**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### Running Automated Verification Tests
Execute the verification engine and rule test suite:
```bash
npm test
```
*Result: 8 passing test suites covering SHA-256 hash collisions, duplicate receipt numbers, negative sums, date inversions, OCR confidence floors, mock bank verification responses, and alert deduplication.*

---

## 6. 5-Minute Hackathon Jury Demonstration Script

1. **Role Switcher & Intake**:
   - Log in or switch to **College Administrator** (`Dr. Sneha Kulkarni`).
   - Click **"Upload New FDR"**. Select *R.V. College of Engineering*. Attach an FDR certificate.
   - Run the **Optical Character Recognition (OCR)** extraction. Observe field-by-field confidence metrics.
   - Submit the deposit to generate a unique record ID (`FDR-2026-XXXX`).

2. **Officer Queue & Bank CBS Verification**:
   - Switch role to **AICTE Officer** (`Rajiv Kumar`).
   - Click **"Verification Queue"** in the sidebar. Locate pending deposits.
   - Click **"Verify with Bank"**. Select *Simulate Success (200)* or *Simulate Mismatch (409)*.
   - Review the Core Banking confirmation showing account lien status and masked account details.

3. **Discrepancy Investigation Workspace**:
   - Open **"Fraud & Discrepancies"**.
   - Select `CASE-2026-003` (Identical Document File Detected).
   - Show the jury the cryptographic SHA-256 collision comparison with previous record `FDR-2026-0001`.
   - Point out the non-accusatory statutory terminology and add an investigation note to the thread.
   - Adjudicate the case using the **"Record Decision"** action.

4. **Maturity Horizon & Deduplication**:
   - Open **"Maturity Calendar"**.
   - Filter by `≤ 7 Days` or `≤ 15 Days`. Click **"Execute Maturity Scanner"** to demonstrate automated alert generation with alert deduplication.

5. **Statutory Audit Dossier**:
   - Switch to **Auditor (CAG)** (`Vinod Sharma`).
   - Open **"Reports & Exports"**. Download a dataset CSV and click **"Print Audit Sheet"** to show the formal AICTE seal and dual-signatory verification block.
   - Open **"Audit Logs"** to demonstrate the immutable governance trail.

# TheHellfireCoders_PS2
