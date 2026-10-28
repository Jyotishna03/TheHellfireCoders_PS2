import React from 'react';
import { FDRStatus } from '../types';
import { CheckCircle2, AlertTriangle, Clock, XCircle, FileEdit, Eye, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: FDRStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  switch (status) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Verified
        </span>
      );
    case 'PENDING_VERIFICATION':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Verification
        </span>
      );
    case 'FLAGGED_FOR_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          Flagged for Review
        </span>
      );
    case 'NEEDS_CORRECTION':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          <FileEdit className="w-3.5 h-3.5 text-orange-600" />
          Needs Correction
        </span>
      );
    case 'MATURED':
    case 'EXPIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
          Matured / Expired
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Rejected
        </span>
      );
    case 'OCR_PROCESSING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Eye className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          OCR Processing
        </span>
      );
    case 'DRAFT':
    case 'UPLOADED':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {status.replace(/_/g, ' ')}
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">CRITICAL</span>;
    case 'HIGH':
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">HIGH</span>;
    case 'MEDIUM':
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">MEDIUM</span>;
    case 'LOW':
    default:
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">LOW</span>;
  }
};

