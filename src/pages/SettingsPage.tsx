import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IntegrationSettings } from '../types';
import {
  Settings,
  ShieldCheck,
  Building,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Cpu,
  Activity,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const [s, h] = await Promise.all([api.getSettings(), api.getHealth()]);
      setSettings(s);
      setHealth(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database to initial synthetic demo seed data? Any new uploads during this session will be refreshed.')) {
      return;
    }
    try {
      const res = await api.resetData();
      setResetMessage(res.message);
      fetchConfig();
      setTimeout(() => setResetMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading system parameters...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>Settings & Integration Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mock Core Banking adapters, anomaly detection thresholds, and evaluate subsystem health.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-3.5 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Seed Data
        </button>
      </div>

      {resetMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Integration Health Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Subsystem & Gateway Health Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Mock Bank Integration */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-600" />
                Bank CBS Gateway
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Mock Connected
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Active simulated Core Banking integration ready for SBI, PNB, Canara, and BoB queries.
            </p>
            <div className="text-[10px] text-slate-400">
              Provider: {health?.integrations?.mockBankApi?.provider || 'Mock Adapter'}
            </div>
          </div>

          {/* OCR Engine */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                OCR Optical Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Ready & Available
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Tesseract optical layout parser with confidence metrics and manual fallback active.
            </p>
            <div className="text-[10px] text-slate-400">
              Confidence Floor: {settings.ocrConfidenceThreshold}%
            </div>
          </div>

          {/* Document Storage */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-600" />
                Document Vault
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Local Encrypted
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Files isolated in private server store with SHA-256 hash deduplication.
            </p>
            <div className="text-[10px] text-slate-400">
              Path: /server/uploads
            </div>
          </div>
        </div>
      </div>

      {/* Mock Bank Simulator Configuration */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Mock Core Banking Simulator Controls</h3>
          <p className="text-xs text-slate-500">
            Simulate diverse bank core-banking responses to evaluate edge cases during evaluation.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Default Simulator Behavior Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { val: 'AUTO_SUCCESS', label: 'Simulate Success (200 OK)', desc: 'Valid active deposit verified against CBS records' },
                { val: 'SIMULATE_MISMATCH', label: 'Simulate Discrepancy (409 Mismatch)', desc: 'CBS reports deposit amount or beneficiary mismatch' },
                { val: 'SIMULATE_TIMEOUT', label: 'Simulate Gateway Timeout (504 Timeout)', desc: 'Bank CBS connection timeout beyond 15s SLA' },
                { val: 'SIMULATE_UNAVAILABLE', label: 'Simulate Maintenance (503 Offline)', desc: 'Bank CBS server undergoing scheduled maintenance' }
              ].map(m => (
                <label
                  key={m.val}
                  className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${settings.mockBankMode === m.val ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mockMode"
                      value={m.val}
                      checked={settings.mockBankMode === m.val}
                      onChange={() => setSettings({ ...settings, mockBankMode: m.val as any })}
                    />
                    <span>{m.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 ml-5 font-normal">{m.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Simulated Gateway Latency</label>
              <span className="font-mono text-teal-700 font-bold">{settings.mockBankLatencyMs} ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={settings.mockBankLatencyMs}
              onChange={(e) => setSettings({ ...settings, mockBankLatencyMs: parseInt(e.target.value) })}
              className="w-full accent-teal-600"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Fast (100ms)</span>
              <span>Realistic Core Banking (600ms)</span>
              <span>High Latency (2000ms)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Engine Rule Parameters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Automated Integrity Engine Rule Config</h3>
          <p className="text-xs text-slate-500">Heuristic thresholds for dual lodgement and discrepancy flagging.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="font-bold text-slate-800 block">Exact Duplicate Receipt Number Detection</span>
              <span className="text-[11px] text-slate-500">Flags deposits sharing identical receipt numbers across institutions</span>
            </div>
            <input
              type="checkbox"
              checked={settings.duplicateReceiptDetection}
              onChange={(e) => setSettings({ ...settings, duplicateReceiptDetection: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="font-bold text-slate-800 block">Cryptographic File Hash (SHA-256) Collision Check</span>
              <span className="text-[11px] text-slate-500">Flags identical certificate scans re-uploaded under different metadata</span>
            </div>
            <input
              type="checkbox"
              checked={settings.exactDocumentHashDetection}
              onChange={(e) => setSettings({ ...settings, exactDocumentHashDetection: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">OCR Confidence Discrepancy Floor</label>
              <span className="font-mono text-teal-700 font-bold">{settings.ocrConfidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={settings.ocrConfidenceThreshold}
              onChange={(e) => setSettings({ ...settings, ocrConfidenceThreshold: parseInt(e.target.value) })}
              className="w-full accent-teal-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Any document scan scoring below this threshold will automatically be routed to manual human review.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Settings updated successfully!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors ml-auto disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

