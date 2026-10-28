import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  RefreshCw,
  Terminal,
  ArrowUpDown
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      l.action.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q);

    const matchEntity = selectedEntity === 'ALL' || l.entityType === selectedEntity;
    return matchSearch && matchEntity;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span>Immutable Governance Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident append-only log recording actor identities, status transitions, and cryptographic hashes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export-csv?type=audit"
            download
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export Audit CSV
          </a>
          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
          </button>
        </div>
      </div>

      {/* Security Assurance Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block text-sm">Non-Repudiation Guarantee</span>
            <span className="text-[11px] text-slate-300">
              Audit log entries cannot be modified or deleted. Every operation is tied to an actor session and IP address.
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-teal-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ledger Checksum: SHA256-SALTED</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action keyword, target ID, or payload details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">All Entity Types</option>
            <option value="FDR">FDR Records</option>
            <option value="BANK_VERIFICATION">Bank CBS Verifications</option>
            <option value="REVIEW_CASE">Discrepancy Cases</option>
            <option value="SETTINGS">System Settings</option>
            <option value="USER">User Sessions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Audit Events ({filteredLogs.length})</span>
          <span className="text-[10px] text-slate-400">Times in UTC / Indian Standard Time</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading audit ledger...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit events match search filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor / Principal</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Entity Ref</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Details & State Modifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 block">{log.actorName}</span>
                      <span className="text-[10px] text-slate-400">{log.actorRole}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {log.entityId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

