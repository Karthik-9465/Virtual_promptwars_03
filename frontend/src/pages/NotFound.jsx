import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial-gradient text-center px-4">
      <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-6">
        <Compass className="h-16 w-16 animate-float" />
      </div>
      <h1 className="text-6xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="mt-4 text-xl font-bold text-gray-300">Eco-Map Uncharted</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
        The environmental coordinate you requested does not exist. Navigate back to stable ground.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
