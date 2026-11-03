import React from 'react';

export default function LoadingSkeleton({ type = 'dashboard' }) {
  if (type === 'chat') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-start">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none w-2/3 h-10"></div>
        </div>
        <div className="flex justify-end">
          <div className="bg-emerald-950/20 border border-emerald-900/10 rounded-2xl rounded-tr-none w-1/2 h-10"></div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none w-3/4 h-12"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-900/60 border border-gray-800/40 rounded-xl w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-900 border border-gray-800/80 rounded-2xl"></div>
        ))}
      </div>

      {/* Large Banner */}
      <div className="h-20 bg-gray-900 border border-gray-800/80 rounded-2xl"></div>

      {/* Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-72 bg-gray-900 border border-gray-800/80 rounded-2xl lg:col-span-2"></div>
        <div className="h-72 bg-gray-900 border border-gray-800/80 rounded-2xl"></div>
      </div>
    </div>
  );
}
