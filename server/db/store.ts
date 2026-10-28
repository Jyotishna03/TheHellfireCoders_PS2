import fs from 'fs';
import path from 'path';
import { FDRRecord, Institution, ReviewCase, BankVerificationAttempt, Notification, AuditLog, IntegrationSettings, User } from '../../src/types/index.js';
import { initialUsers, initialInstitutions, initialFDRs, initialReviewCases, initialBankAttempts, initialNotifications, initialAuditLogs, initialSettings } from './seedData.js';

interface DatabaseData {
  users: User[];
  institutions: Institution[];
  fdrs: FDRRecord[];
  reviewCases: ReviewCase[];
  bankAttempts: BankVerificationAttempt[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: IntegrationSettings;
}

const DB_FILE = path.resolve(process.cwd(), 'server/db/data.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'server/uploads');

class DataStore {
  private data: DatabaseData;

  constructor() {
    this.ensureDirs();
    this.data = this.loadData();
    this.ensureSampleFiles();
  }

  private ensureDirs() {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn('Failed to parse database file, re-initializing with seed data.', e);
    }

    // Default Seed Data
    const seed: DatabaseData = {
      users: initialUsers,
      institutions: initialInstitutions,
      fdrs: initialFDRs,
      reviewCases: initialReviewCases,
      bankAttempts: initialBankAttempts,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      settings: initialSettings
    };
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave?: DatabaseData) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data to database file:', e);
    }
  }

  private ensureSampleFiles() {
    // Generate realistic sample mock certificate text/pdf placeholders
    const samples = [
      'sample_fdr_rvce.pdf',
      'sample_fdr_dtu.pdf',
      'sample_fdr_bit.jpg',
      'sample_gp_mumbai.pdf',
      'sample_hbtu.png',
      'sample_coep.pdf',
      'sample_psg.pdf',
      'sample_bmsce.pdf',
      'sample_rvce_dup.pdf',
      'sample_vjti.pdf'
    ];

    samples.forEach(fileName => {
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        const dummyContent = Buffer.from(
          `%PDF-1.4\n%AICTE FIXED DEPOSIT RECEIPT SAMPLE CERTIFICATE\nInstitution Security Deposit Record\nFile: ${fileName}\nGenerated for SmartFDR Hackathon Demonstration.\n`
        );
        fs.writeFileSync(filePath, dummyContent);
      }
    });
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  // Institutions
  getInstitutions(): Institution[] {
    return this.data.institutions;
  }

  getInstitutionById(id: string): Institution | undefined {
    return this.data.institutions.find(i => i.id === id);
  }

  // FDRs
  getFDRs(): FDRRecord[] {
    return this.data.fdrs;
  }

  getFDRById(id: string): FDRRecord | undefined {
    return this.data.fdrs.find(f => f.id === id);
  }

  addFDR(record: FDRRecord): FDRRecord {
    this.data.fdrs.unshift(record);
    this.saveData();
    return record;
  }

  updateFDR(id: string, updates: Partial<FDRRecord>): FDRRecord | undefined {
    const idx = this.data.fdrs.findIndex(f => f.id === id);
    if (idx === -1) return undefined;
    this.data.fdrs[idx] = {
      ...this.data.fdrs[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.fdrs[idx];
  }

  // Review Cases
  getReviewCases(): ReviewCase[] {
    return this.data.reviewCases;
  }

  getReviewCaseById(id: string): ReviewCase | undefined {
    return this.data.reviewCases.find(c => c.id === id);
  }

  getReviewCaseByFDRId(fdrId: string): ReviewCase | undefined {
    return this.data.reviewCases.find(c => c.fdrId === fdrId);
  }

  addReviewCase(reviewCase: ReviewCase): ReviewCase {
    this.data.reviewCases.unshift(reviewCase);
    this.saveData();
    return reviewCase;
  }

  updateReviewCase(id: string, updates: Partial<ReviewCase>): ReviewCase | undefined {
    const idx = this.data.reviewCases.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.reviewCases[idx] = {
      ...this.data.reviewCases[idx],
      ...updates
    };
    this.saveData();
    return this.data.reviewCases[idx];
  }

  // Bank Attempts
  getBankAttempts(fdrId?: string): BankVerificationAttempt[] {
    if (fdrId) {
      return this.data.bankAttempts.filter(a => a.fdrId === fdrId);
    }
    return this.data.bankAttempts;
  }

  addBankAttempt(attempt: BankVerificationAttempt): BankVerificationAttempt {
    this.data.bankAttempts.unshift(attempt);
    this.saveData();
    return attempt;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  addNotification(notif: Notification): Notification {
    // Alert deduplication: don't add identical title and fdrId within active notifications
    const exists = this.data.notifications.some(
      n => n.fdrId === notif.fdrId && n.title === notif.title && n.read === false
    );
    if (!exists) {
      this.data.notifications.unshift(notif);
      this.saveData();
    }
    return notif;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(): void {
    this.data.notifications.forEach(n => (n.read = true));
    this.saveData();
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.auditLogs.unshift(newLog);
    this.saveData();
    return newLog;
  }

  // Settings
  getSettings(): IntegrationSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<IntegrationSettings>): IntegrationSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.saveData();
    return this.data.settings;
  }

  resetToSeed(): void {
    this.data = {
      users: initialUsers,
      institutions: initialInstitutions,
      fdrs: initialFDRs,
      reviewCases: initialReviewCases,
      bankAttempts: initialBankAttempts,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      settings: initialSettings
    };
    this.saveData();
    this.ensureSampleFiles();
  }
}

export const db = new DataStore();

