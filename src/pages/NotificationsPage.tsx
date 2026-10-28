import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  BellRing,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Calendar,
  Check,
  Filter,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, runMaturityScan, loading } = useNotifications();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await runMaturityScan();
    setIsScanning(false);
  };

  const filtered = notifications.filter(n => {
    if (selectedType === 'ALL') return true;
    return n.type === selectedType;
  });

  const getIcon = (type: string, severity: string) => {
    if (severity === 'danger') return <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />;
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
    if (type === 'VERIFICATION') return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
    return <Info className="w-5 h-5 text-teal-600 shrink-0" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-teal-600" />
            <span>Alerts & Notifications Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of maturity warnings, discrepancy flags, and Core Banking verification outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Trigger Maturity Check'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        {['ALL', 'MATURITY', 'DISCREPANCY', 'VERIFICATION', 'SYSTEM'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${selectedType === t ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className={`p-4 transition-colors flex items-start justify-between gap-4 ${!notif.read ? 'bg-teal-50/40' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getIcon(notif.type, notif.severity)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{notif.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${notif.severity === 'danger' ? 'bg-rose-100 text-rose-800 border-rose-300' : notif.severity === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {notif.type}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.fdrId && (
                  <Link
                    to={`/fdr/${notif.fdrId}`}
                    onClick={() => markAsRead(notif.id)}
                    className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    View Deposit <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

