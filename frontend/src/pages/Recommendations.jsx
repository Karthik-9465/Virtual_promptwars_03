import React, { useEffect } from 'react';
import { useCarbon } from '../context/CarbonContext.jsx';
import { RefreshCw, Leaf, Check, X, Shield, Award } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Recommendations() {
  const { recommendations, loadingCarbon, fetchRecommendationsOnly, performRecommendationAction, regenerateUserRecommendations } = useCarbon();

  useEffect(() => {
    fetchRecommendationsOnly();
  }, []);

  if (loadingCarbon) {
    return <LoadingSkeleton type="list" />;
  }

  const difficulties = [
    { key: 'low', title: 'Quick Wins', colorClass: 'text-emerald-400', bulletClass: 'bg-emerald-400' },
    { key: 'medium', title: 'Moderate Actions', colorClass: 'text-blue-400', bulletClass: 'bg-blue-400' },
    { key: 'high', title: 'High Impact Changes', colorClass: 'text-amber-500', bulletClass: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-900/60">
        <div>
          <h3 className="font-bold text-white text-lg">Personalized Actions</h3>
          <p className="text-xs text-gray-400 mt-1">Recommendations prioritized by maximum carbon impact, feasibility, and preference.</p>
        </div>
        <button
          onClick={regenerateUserRecommendations}
          disabled={loadingCarbon}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingCarbon ? 'animate-spin' : ''}`} />
          <span>Regenerate Pool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((diff) => {
          const list = recommendations.filter((r) => r.difficulty === diff.key);
          return (
            <div key={diff.key} className="space-y-4">
              <h4 className={`font-bold ${diff.colorClass} text-sm border-b border-gray-900 pb-2 flex items-center gap-1.5`}>
                <span className={`w-2 h-2 rounded-full ${diff.bulletClass}`}></span>
                <span>{diff.title} ({list.length})</span>
              </h4>

              <div className="space-y-3">
                {list.length > 0 ? (
                  list.map((rec) => (
                    <div key={rec._id} className="glass-card p-5 rounded-xl space-y-3 flex flex-col justify-between h-[190px]">
                      <div>
                        <h5 className="font-bold text-white text-xs leading-normal line-clamp-2">{rec.title}</h5>
                        <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{rec.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-3 border-t border-gray-900/50 pt-2">
                          <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                          <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => performRecommendationAction(rec._id, 'completed')}
                            className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => performRecommendationAction(rec._id, 'skipped')}
                            className="w-1/2 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded text-[10px] transition-all text-center cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-600 text-xs bg-white/2 border border-dashed border-gray-900/40 rounded-xl">
                    All cleared!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
