import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl relative border border-gray-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold text-white mb-4 pr-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}
