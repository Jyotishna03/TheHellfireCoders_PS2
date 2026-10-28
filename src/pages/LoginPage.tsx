import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, ArrowRight, Info, CheckCircle2, Lock } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { demoUsers, loginAs, switchRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('AICTE_OFFICER');

  const handleDemoLogin = (role: UserRole) => {
    switchRole(role);
    navigate('/');
  };

  const roleCardDetails: Record<UserRole, { badge: string; color: string; desc: string; sampleActions: string[] }> = {
    SUPER_ADMIN: {
      badge: 'Super Admin',
      color: 'border-purple-300 hover:border-purple-500 bg-purple-50/30',
      desc: 'Complete administrative control over council institutions, verification rules, system health, and audit governance.',
      sampleActions: ['Configure verification rules', 'Manage system health & mock APIs', 'View immutable audit logs']
    },
    AICTE_OFFICER: {
      badge: 'AICTE Approval Officer',
      color: 'border-blue-300 hover:border-blue-500 bg-blue-50/30',
      desc: 'Responsible for reviewing institutional FDRs, conducting bank CBS checks, approving deposits, and resolving flagged discrepancies.',
      sampleActions: ['Process Verification Queue', 'Execute Bank CBS Verifications', 'Resolve Discrepancy Cases']
    },
    COLLEGE_ADMIN: {
      badge: 'College Administrator',
      color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/30',
      desc: 'Authorized college finance desk lodging fresh FDR certificates, correcting OCR extractions, and receiving renewal notices.',
      sampleActions: ['Upload FDR Certificates', 'Review & Correct OCR extractions', 'Respond to correction queries']
    },
    AUDITOR: {
      badge: 'Auditor / Reviewer (CAG)',
      color: 'border-amber-300 hover:border-amber-500 bg-amber-50/30',
      desc: 'Independent auditor conducting financial compliance reviews, inspecting verification trails, and exporting audit dossiers.',
      sampleActions: ['Inspect verification evidence', 'Add independent audit notes', 'Export compliance reports']
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-xl">
            ₹
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-wide">SmartFDR Portal</span>
            <span className="text-[10px] text-slate-400 block">All India Council for Technical Education (AICTE)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hackathon Evaluation Environment</span>
        </div>
      </div>

      {/* Main Login / Demo Access Body */}
      <div className="max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AICTE Security Deposit (FDR) Management & Fraud Detection Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Digitized repository and multi-tier verification engine for fixed deposit receipts submitted by educational institutions across India.
          </p>
        </div>

        {/* Demo Roles Selection Grid */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-400" />
                Select Demo Role to Enter
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any role card to immediately simulate authentic access for jury evaluation.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
              Instant Demo Access
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoUsers.map(u => {
              const details = roleCardDetails[u.role];
              return (
                <div
                  key={u.id}
                  onClick={() => handleDemoLogin(u.role)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${details.color} bg-slate-800/60 hover:bg-slate-800/90`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        {details.badge}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{u.name}</h3>
                      <p className="text-xs text-slate-400">{u.designation}</p>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{details.desc}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Permitted Workflow:
                    </span>
                    {details.sampleActions.map((act, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hackathon Jury Documentation Notice */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-200">Production Deployment Notice:</strong>
              <p>
                This development-only one-click demo login mechanism is provided exclusively for prototype review. In production, this authentication layer integrates with official AICTE Single Sign-On (SSO) backed by OAuth2/OpenID Connect and hardware-token 2FA for authorized government officers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-12 border-t border-slate-800 px-6 flex items-center justify-between text-xs text-slate-500">
        <span>AICTE SmartFDR • Ministry of Education, Government of India</span>
        <span>Synthetic Hackathon Prototype Data</span>
      </div>
    </div>
  );
};

