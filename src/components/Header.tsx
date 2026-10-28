import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, ShieldCheck, ChevronDown, Check, HelpCircle, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const Header: React.FC<{ onMenuToggle?: () => void }> = () => {
  const { user, role, switchRole, demoUsers } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, runMaturityScan } = useNotifications();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleScanMaturity = async () => {
    setIsScanning(true);
    await runMaturityScan();
    setIsScanning(false);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badge: 'Apex Governance', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    AICTE_OFFICER: { label: 'AICTE Officer', badge: 'Approval Authority', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    COLLEGE_ADMIN: { label: 'College Admin', badge: 'Institution Portal', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    AUDITOR: { label: 'Auditor / Reviewer', badge: 'Oversight & CAG', color: 'bg-amber-100 text-amber-800 border-amber-300' }
  };

  return (
    <header className="h-16 bg-[#0f2942] text-white border-b border-slate-700/60 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between shadow-md">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-inner font-bold text-white text-xl">
            ₹
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide text-white group-hover:text-teal-300 transition-colors">
                SmartFDR
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AICTE Official
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Security Deposit (FDR) Management & Fraud Prevention
            </p>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Maturity Scan Trigger */}
        <button
          onClick={handleScanMaturity}
          disabled={isScanning}
          title="Run Background Maturity Verification Scanner"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Maturities'}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications available.</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.fdrId) navigate(`/fdr/${n.fdrId}`);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-teal-50/40 font-medium' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-semibold ${n.severity === 'danger' ? 'text-rose-600' : n.severity === 'warning' ? 'text-amber-600' : 'text-slate-800'}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />}
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 text-left transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                {user.name.split(' ')[0]}
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${roleLabels[role].color}`}>
                  {roleLabels[role].label}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 leading-tight">Switch Role Demo</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Role Switcher
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Test the portal as different stakeholders
                </p>
              </div>

              <div className="p-1 space-y-1">
                {demoUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchRole(u.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors ${role === u.role ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {role === u.role && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.designation}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleLabels[u.role].color}`}>
                      {roleLabels[u.role].label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to="/help"
                  onClick={() => setShowRoleMenu(false)}
                  className="flex items-center gap-1 text-slate-600 hover:text-teal-600"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Jury Demo Script
                </Link>
                <Link
                  to="/login"
                  onClick={() => setShowRoleMenu(false)}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Switch User
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

