import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarbon } from '../context/CarbonContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { CarbonHistoryBarChart, CarbonContributionPieChart } from '../components/CarbonCharts.jsx';
import { Sparkles, Trophy, Flame, Zap, Compass, Award, Bell, ChevronRight, Check } from 'lucide-react';

export default function Dashboard() {
  const { analytics, loadingCarbon, fetchAnalyticsSummary, performRecommendationAction } = useCarbon();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyticsSummary();
  }, []);

  if (loadingCarbon || !analytics) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const { profile, footprints, aiInsights, badges, goalsSummary, recentActivities, activeRecommendations, recentNotifications } = analytics;
  const latestFootprint = footprints && footprints.length > 0 ? footprints[footprints.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Sustainability Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sustainability Score</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-4xl font-extrabold text-emerald-400">{profile?.sustainabilityScore}</span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {profile?.sustainabilityScore >= 80 ? '🌱 Excellent! Very low emissions.' : '⚡ Moderate. View recommended targets.'}
          </p>
        </div>

        {/* Card 2: Footprint */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Month Emissions</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-4xl font-extrabold text-white">{latestFootprint?.totalEmissions || 0}</span>
            <span className="text-xs text-gray-400">kg CO₂</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Global Target Avg: ~500 kg CO₂/month</p>
        </div>

        {/* Card 3: Goals progress */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carbon Reduction Targets</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-4xl font-extrabold text-blue-400">{goalsSummary?.active || 0}</span>
            <span className="text-xs text-gray-500">active</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {goalsSummary?.completed || 0} goals achieved overall
          </p>
        </div>

        {/* Card 4: Level details */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eco Rank Level</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-4xl font-extrabold text-amber-500">{profile?.level || 1}</span>
            <span className="text-xs text-gray-500">Rank</span>
          </div>
          
          <div className="w-full bg-gray-900/60 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((profile?.xpProgress || 0) / (profile?.xpNeededForNext || 500)) * 100}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-gray-400 mt-1 block text-right">
            {profile?.xpProgress}/{profile?.xpNeededForNext} XP for Level {profile ? profile.level + 1 : 2}
          </span>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 flex items-start gap-4 shadow-xl">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">EcoBot Personalized Analytics Insights</h4>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{aiInsights}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-lg">
          <h3 className="font-bold text-white text-sm mb-4">Carbon Footprint Trend (Last 12 Months)</h3>
          <CarbonHistoryBarChart footprints={footprints} />
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-white text-sm mb-1">Sector Breakdown</h3>
          <p className="text-[10px] text-gray-400 mb-4">Carbon category percentage distributions</p>
          <CarbonContributionPieChart latestFootprint={latestFootprint} />
        </div>
      </div>

      {/* Recommendations & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Suggestions */}
        <div className="glass-panel p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-900/60">
            <h3 className="font-bold text-white text-sm">Priority Reduction Recommendations</h3>
            <Link to="/recommendations" className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 hover:underline">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeRecommendations && activeRecommendations.length > 0 ? (
              activeRecommendations.map((rec) => (
                <div key={rec._id} className="glass-card p-4 rounded-xl flex justify-between items-center gap-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                      rec.difficulty === 'low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      rec.difficulty === 'medium' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {rec.difficulty} Effort
                    </span>
                    <h4 className="font-bold text-white text-xs mt-1.5">{rec.title}</h4>
                    <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                      <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                      <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => performRecommendationAction(rec._id, 'completed')}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                      title="Complete action"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => performRecommendationAction(rec._id, 'skipped')}
                      className="px-2 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded-lg text-[10px] transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">No active recommendations. You have done everything!</div>
            )}
          </div>
        </div>

        {/* Recent logs */}
        <div className="glass-panel p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm pb-2 border-b border-gray-900/60">Recent Activity Logs</h3>
          
          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act._id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <span className="text-white font-medium block">{act.actionName}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold">+{act.xpEarned} XP</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">No activities recorded yet. Complete recommendations to earn XP.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
