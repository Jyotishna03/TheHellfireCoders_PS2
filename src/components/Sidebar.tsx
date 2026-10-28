import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  FolderLock,
  FileSearch,
  CheckSquare,
  AlertOctagon,
  Building2,
  CalendarDays,
  BellRing,
  FileSpreadsheet,
  History,
  Users,
  Settings,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  queueCount?: number;
  fraudCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ queueCount = 3, fraudCount = 3 }) => {
  const { role } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 shrink-0">
      <div className="space-y-6">
        {/* Core Navigation */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Overview
          </div>
          <NavLink to="/" className={navItemClass}>
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Main Dashboard</span>
            </div>
          </NavLink>
        </div>

        {/* Deposit Operations */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            FDR Deposit Intake
          </div>
          <div className="space-y-1">
            <NavLink to="/upload" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4" />
                <span>Upload New FDR</span>
              </div>
            </NavLink>

            <NavLink to="/registry" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4" />
                <span>FDR Registry</span>
              </div>
            </NavLink>

            <NavLink to="/ocr-review" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <FileSearch className="w-4 h-4" />
                <span>OCR Extraction Review</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Verification & Risk Review */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Verification & Integrity
          </div>
          <div className="space-y-1">
            <NavLink to="/verification-queue" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Verification Queue</span>
              </div>
              {queueCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                  {queueCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/fraud-review" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>Fraud & Discrepancies</span>
              </div>
              {fraudCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                  {fraudCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/maturity-calendar" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4" />
                <span>Maturity Calendar</span>
              </div>
            </NavLink>

            <NavLink to="/notifications" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4" />
                <span>Alerts & Notifications</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Governance & Records */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Governance & Audit
          </div>
          <div className="space-y-1">
            <NavLink to="/institutions" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Institutions</span>
              </div>
            </NavLink>

            <NavLink to="/reports" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Reports & Exports</span>
              </div>
            </NavLink>

            <NavLink to="/audit-logs" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>Audit Logs</span>
              </div>
            </NavLink>

            <NavLink to="/users" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>User & Roles</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Configuration
          </div>
          <div className="space-y-1">
            <NavLink to="/settings" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Settings & Mock Health</span>
              </div>
            </NavLink>

            <NavLink to="/help" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span className="text-teal-700 font-semibold">Help & Jury Guide</span>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-500 space-y-1 mt-4">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Fraud Safety Principle</span>
        </div>
        <p className="text-[10px] leading-tight text-slate-500">
          Discrepancies and OCR errors require manual human review. Never conclude fraud prematurely.
        </p>
      </div>
    </aside>
  );
};

