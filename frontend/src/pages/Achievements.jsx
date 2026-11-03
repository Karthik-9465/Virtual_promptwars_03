import React, { useEffect } from 'react';
import { useCarbon } from '../context/CarbonContext.jsx';
import { Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Achievements() {
  const { analytics, loadingCarbon, fetchAnalyticsSummary } = useCarbon();

  useEffect(() => {
    fetchAnalyticsSummary();
  }, []);

  if (loadingCarbon || !analytics) {
    return <LoadingSkeleton type="list" />;
  }

  const { profile, badges } = analytics;

  const badgeDescriptions = {
    'Eco Beginner': 'Created profile and initiated sustainability tracking.',
    'Green Champion': 'Earned a total of 1,000 XP points.',
    'Carbon Hero': 'Earned a total of 3,000 XP points.',
    'Planet Protector': 'Reached elite carbon tracking level with 6,000 XP.',
    'Sustainability Sage': 'Achieved an outstanding Eco Sustainability Score of 80+.',
    'Streak Star': 'Maintained a consecutive log streak of 7 days.',
  };

  const getBadgeIcon = (name) => {
    switch (name) {
      case 'Eco Beginner': return '🌱';
      case 'Green Champion': return '🎖️';
      case 'Carbon Hero': return '🛡️';
      case 'Planet Protector': return '🌍';
      case 'Sustainability Sage': return '🦉';
      case 'Streak Star': return '⭐';
      default: return '🏅';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-white text-lg">Milestone Badges</h3>
        <p className="text-xs text-gray-400 mt-1">Earn points, streaks, and scores to unlock exclusive eco achievements.</p>
      </div>

      {/* Stats display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-gray-900/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Badges Earned</span>
          <span className="text-3xl font-extrabold text-amber-500">{badges?.length || 0}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-gray-900/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Current Level</span>
          <span className="text-3xl font-extrabold text-blue-400">Level {profile?.level || 1}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-gray-900/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total XP Earned</span>
          <span className="text-3xl font-extrabold text-emerald-400">{profile?.xpPoints || 0} XP</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.keys(badgeDescriptions).map((badgeName) => {
          const earnedInfo = badges?.find((b) => b.badgeName === badgeName);
          const isEarned = !!earnedInfo;
          return (
            <div
              key={badgeName}
              className={`glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4 border transition-all duration-300 shadow-lg ${
                isEarned
                  ? 'border-emerald-500/20 bg-emerald-950/5'
                  : 'border-gray-900 opacity-40 grayscale'
              }`}
            >
              <span className="text-5xl">{getBadgeIcon(badgeName)}</span>
              <div>
                <h4 className="font-bold text-white text-sm">{badgeName}</h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{badgeDescriptions[badgeName]}</p>
                {isEarned && (
                  <span className="text-[10px] text-gray-500 block mt-2">
                    Earned: {new Date(earnedInfo.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {isEarned ? (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Unlocked</span>
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 font-bold bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Locked</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
