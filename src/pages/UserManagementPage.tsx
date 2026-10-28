import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  UserCheck,
  Lock,
  Building,
  Key,
  Info
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user, role, switchRole, demoUsers } = useAuth();

  const permissionsMatrix = [
    { permission: 'Upload FDR Documents', superAdmin: true, aicteOfficer: false, collegeAdmin: true, auditor: false },
    { permission: 'Review Extracted OCR & Correct Metadata', superAdmin: true, aicteOfficer: true, collegeAdmin: true, auditor: false },
    { permission: 'Execute Core Banking System (CBS) Verification', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: false },
    { permission: 'Sanction Approval of Fixed Deposit', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: false },
    { permission: 'Issue Request for Correction / Re-upload', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: false },
    { permission: 'Adjudicate Flagged Discrepancy Cases', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: false },
    { permission: 'Add Reviewer & Independent Audit Notes', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: true },
    { permission: 'View Complete Audit Logs & SHA-256 Hashes', superAdmin: true, aicteOfficer: true, collegeAdmin: false, auditor: true },
    { permission: 'Configure Mock Verification & Rules Thresholds', superAdmin: true, aicteOfficer: false, collegeAdmin: false, auditor: false },
    { permission: 'Export Statutory CSV & Print Audit Sheets', superAdmin: true, aicteOfficer: true, collegeAdmin: true, auditor: true }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <span>User & Role Governance Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-Based Access Control (RBAC) matrix and development demo principal switcher.
        </p>
      </div>

      {/* Active User Card */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-white text-xl shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Active Logged-in Principal
            </span>
            <h2 className="text-base font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-300">{user.designation} • {user.email}</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-xs font-semibold">
          Role: {role.replace('_', ' ')}
        </span>
      </div>

      {/* Demo Users Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Available Stakeholder Roles (One-Click Demo Switcher)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoUsers.map(u => (
            <div
              key={u.id}
              className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between transition-all ${user.role === u.role ? 'ring-2 ring-teal-500 border-teal-500' : 'hover:border-slate-300'}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {u.role.replace('_', ' ')}
                  </span>
                  {user.role === u.role && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{u.designation}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => switchRole(u.role)}
                  disabled={user.role === u.role}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${user.role === u.role ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'}`}
                >
                  {user.role === u.role ? 'Currently Active' : 'Switch to this Role'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">Role-Based Access Control (RBAC) Matrix</h3>
          <p className="text-xs text-slate-500">Statutory operational privileges defined per AICTE financial guidelines</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">System Operation / Capability</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">AICTE Officer</th>
                <th className="py-3 px-4 text-center">College Admin</th>
                <th className="py-3 px-4 text-center">Auditor (CAG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.permission}</td>
                  <td className="py-3 px-4 text-center">
                    {item.superAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.aicteOfficer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.collegeAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.auditor ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 block">Production Security Architecture:</strong>
          <p className="mt-0.5">
            In production deployments, role-switching is strictly disabled. Identities are verified via AICTE centralized Gov-SSO using JSON Web Tokens (JWT) signed with RS256 private keys, combined with IP-whitelisting for internal administrative endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};

