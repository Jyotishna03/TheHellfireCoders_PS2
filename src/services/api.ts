import { FDRRecord, Institution, ReviewCase, BankVerificationAttempt, Notification, AuditLog, IntegrationSettings, User } from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Institutions
  async getInstitutions(): Promise<Institution[]> {
    const res = await fetch(`${API_BASE}/institutions`);
    return res.json();
  },

  async getInstitution(id: string): Promise<Institution & { records: FDRRecord[] }> {
    const res = await fetch(`${API_BASE}/institutions/${id}`);
    return res.json();
  },

  // FDRs
  async getFDRs(params?: { q?: string; status?: string; bank?: string; institutionId?: string; sortBy?: string; sortOrder?: string }): Promise<FDRRecord[]> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.bank) searchParams.append('bank', params.bank);
    if (params?.institutionId) searchParams.append('institutionId', params.institutionId);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/fdr?${searchParams.toString()}`);
    return res.json();
  },

  async getFDR(id: string): Promise<FDRRecord & { bankAttempts: BankVerificationAttempt[]; reviewCase?: ReviewCase }> {
    const res = await fetch(`${API_BASE}/fdr/${id}`);
    if (!res.ok) throw new Error('FDR not found');
    return res.json();
  },

  async uploadFDR(formData: FormData): Promise<{ message: string; fdr: FDRRecord; verificationResults: any }> {
    const res = await fetch(`${API_BASE}/fdr/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload FDR');
    }
    return res.json();
  },

  async updateFDR(id: string, updates: Partial<FDRRecord>): Promise<FDRRecord> {
    const res = await fetch(`${API_BASE}/fdr/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async updateFDRStatus(id: string, data: { status: string; reason?: string; actorName?: string; actorRole?: string }): Promise<FDRRecord> {
    const res = await fetch(`${API_BASE}/fdr/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Bank Verification
  async verifyBank(id: string, data: { simulationMode?: string; requestedBy?: string }): Promise<{ attempt: BankVerificationAttempt; fdr: FDRRecord }> {
    const res = await fetch(`${API_BASE}/fdr/${id}/verify-bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Review Cases
  async getReviewCases(params?: { status?: string; severity?: string }): Promise<ReviewCase[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.severity) searchParams.append('severity', params.severity);

    const res = await fetch(`${API_BASE}/review-cases?${searchParams.toString()}`);
    return res.json();
  },

  async getReviewCase(id: string): Promise<ReviewCase & { fdr: FDRRecord; bankAttempts: BankVerificationAttempt[] }> {
    const res = await fetch(`${API_BASE}/review-cases/${id}`);
    return res.json();
  },

  async addReviewNote(id: string, data: { author: string; role: string; text: string }): Promise<ReviewCase> {
    const res = await fetch(`${API_BASE}/review-cases/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async decideReviewCase(id: string, data: { action: string; reason: string; decidedBy: string }): Promise<ReviewCase> {
    const res = await fetch(`${API_BASE}/review-cases/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
    return res.json();
  },

  async triggerMaturityScan(): Promise<{ message: string; newAlerts: number }> {
    const res = await fetch(`${API_BASE}/notifications/generate-alerts`, { method: 'POST' });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: { action?: string; entityType?: string }): Promise<AuditLog[]> {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.append('action', params.action);
    if (params?.entityType) searchParams.append('entityType', params.entityType);

    const res = await fetch(`${API_BASE}/audit-logs?${searchParams.toString()}`);
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  // Settings
  async getSettings(): Promise<IntegrationSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async resetData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/settings/reset`, { method: 'POST' });
    return res.json();
  }
};

