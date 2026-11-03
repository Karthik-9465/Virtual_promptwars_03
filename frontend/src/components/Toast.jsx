import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
  return (
    <div
      className={`fixed bottom-4 right-4 px-5 py-3.5 rounded-xl shadow-2xl text-white z-50 text-xs font-semibold border flex items-center gap-3 backdrop-blur-md animate-bounce-short ${
        toast.type === 'error'
          ? 'bg-red-950/90 border-red-800/60'
          : 'bg-emerald-950/90 border-emerald-800/60'
      }`}
    >
      {toast.type === 'error' ? (
        <AlertCircle className="h-5 w-5 text-red-400" />
      ) : (
        <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
