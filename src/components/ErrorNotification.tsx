import React from 'react';
import { AlertCircle, AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';
import type { ValidationError } from '../core/types';

interface ErrorNotificationProps {
  errors: ValidationError[];
  onDismiss?: () => void;
  title?: string;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  errors,
  onDismiss,
  title = 'Grammar Validation Issues',
}) => {
  if (!errors || errors.length === 0) return null;

  const hasFatal = errors.some((e) => e.severity === 'error');

  return (
    <div
      className={`rounded-xl border p-4 shadow-lg transition-all ${
        hasFatal
          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {hasFatal ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <h3 className="text-sm font-semibold tracking-tight">
            {title} ({errors.length})
          </h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2 text-xs">
        {errors.map((err, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg font-mono flex items-start space-x-2 border ${
              err.severity === 'error'
                ? 'bg-rose-900/30 border-rose-800/40 text-rose-200'
                : 'bg-amber-900/30 border-amber-800/40 text-amber-200'
            }`}
          >
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-bold uppercase shrink-0 mt-0.5 ${
                err.severity === 'error' ? 'bg-rose-800/50 text-rose-300' : 'bg-amber-800/50 text-amber-300'
              }`}
            >
              {err.severity}
            </span>
            <div className="flex-1">
              <span className="font-semibold">{err.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900 text-emerald-200';
      case 'error':
        return 'border-rose-500/40 bg-slate-900 text-rose-200';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900 text-amber-200';
      case 'info':
        return 'border-cyan-500/40 bg-slate-900 text-cyan-200';
    }
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-xl shadow-black/60 text-xs font-medium backdrop-blur ${getBorderColor()} animate-in fade-in slide-in-from-bottom-3 duration-200`}
    >
      {getIcon()}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white transition p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
