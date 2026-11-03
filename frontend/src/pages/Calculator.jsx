import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCarbon } from '../context/CarbonContext.jsx';
import { RefreshCw, Info, Zap, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function Calculator() {
  const { user } = useAuth();
  const { syncCalculatorForm, loadingCarbon } = useCarbon();

  // Local state initialized with user profile details
  const [calcForm, setCalcForm] = useState({
    ageGroup: 'professional',
    location: 'India',
    diet: 'low_meat',
    transportMode: 'car_petrol',
    weeklyDistanceKm: 80,
    electricityKwhM: 120,
    acHoursPerDay: 4,
    flightHoursPerYear: 5,
    shoppingFrequency: 'medium',
    wasteRecyclingRate: 0.2,
  });

  // State to hold response from AWS Lambda / API Gateway calculation
  const [awsResult, setAwsResult] = useState(null);
  const [isAwsCalculating, setIsAwsCalculating] = useState(false);
  const [awsLatency, setAwsLatency] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setCalcForm({
        ageGroup: user.profile.ageGroup || 'professional',
        location: user.profile.location || 'India',
        diet: user.profile.diet || 'low_meat',
        transportMode: user.profile.transportMode || 'car_petrol',
        weeklyDistanceKm: user.profile.weeklyDistanceKm || 0,
        electricityKwhM: user.profile.electricityKwhM || 0,
        acHoursPerDay: user.profile.acHoursPerDay || 0,
        flightHoursPerYear: user.profile.flightHoursPerYear || 0,
        shoppingFrequency: user.profile.shoppingFrequency || 'medium',
        wasteRecyclingRate: user.profile.wasteRecyclingRate || 0,
      });
    }
  }, [user]);

  // Live client-side preview for immediate slider feedback
  const calculateLivePreview = () => {
    let transFactor = 0.06;
    if (calcForm.transportMode === 'car_petrol') transFactor = 0.18;
    if (calcForm.transportMode === 'car_electric') transFactor = 0.05;
    if (calcForm.transportMode === 'motorcycle') transFactor = 0.10;
    if (calcForm.transportMode === 'walk') transFactor = 0.0;

    const t = (calcForm.weeklyDistanceKm * 4.33 * transFactor) + ((calcForm.flightHoursPerYear / 12) * 90);
    
    let locationFactor = 0.50;
    const loc = (calcForm.location || '').toLowerCase();
    if (loc.includes('india') || loc.includes('in')) locationFactor = 0.82;
    else if (loc.includes('usa') || loc.includes('us')) locationFactor = 0.38;
    else if (loc.includes('europe') || loc.includes('eu')) locationFactor = 0.25;

    const e = (calcForm.electricityKwhM * locationFactor) + (calcForm.acHoursPerDay * 30 * 1.5 * locationFactor);
    
    let foodFactor = 4.0;
    if (calcForm.diet === 'vegan') foodFactor = 1.5;
    if (calcForm.diet === 'vegetarian') foodFactor = 2.5;
    if (calcForm.diet === 'high_meat') foodFactor = 7.5;
    const f = foodFactor * 30;

    let s = 50.0;
    if (calcForm.shoppingFrequency === 'low') s = 15;
    if (calcForm.shoppingFrequency === 'high') s = 150;

    const w = Math.max(0, 15.0 * (1 - (0.6 * calcForm.wasteRecyclingRate)));
    const total = t + e + f + s + w;

    return {
      t: Math.round(t * 10) / 10,
      e: Math.round(e * 10) / 10,
      f: Math.round(f * 10) / 10,
      s: Math.round(s * 10) / 10,
      w: Math.round(w * 10) / 10,
      total: Math.round(total * 10) / 10,
    };
  };

  const liveStats = calculateLivePreview();

  // Test invocation directly to AWS Lambda / API Gateway endpoint (with local fallback)
  const handleInvokeAwsLambda = async () => {
    setIsAwsCalculating(true);
    const start = performance.now();
    try {
      const res = await api.calculateViaLambda(calcForm);
      const elapsed = Math.round(performance.now() - start);
      setAwsResult(res);
      setAwsLatency(elapsed);
    } catch (err) {
      console.error('AWS Lambda calculation error:', err);
    } finally {
      setIsAwsCalculating(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await syncCalculatorForm(calcForm);
      // Also update AWS simulation result snapshot
      handleInvokeAwsLambda();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Subtle AWS Lambda Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-gray-900/60 to-amber-950/30 border border-emerald-500/20 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-gray-200">
            Carbon calculation powered by <span className="text-amber-400 font-semibold">AWS Lambda</span> &amp; <span className="text-emerald-400 font-semibold">API Gateway</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {awsResult?._source || 'Serverless Ready (Auto Fallback)'}
          </span>
          {awsLatency !== null && (
            <span className="text-[11px] text-gray-400">
              Latency: <span className="text-emerald-400 font-mono">{awsLatency}ms</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Settings sliders */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white text-base">Eco Footprint Model Parameters</h3>
              <p className="text-xs text-gray-400 mt-1">Adjust dials to model carbon footprint alterations instantly.</p>
            </div>
            <button
              type="button"
              onClick={handleInvokeAwsLambda}
              disabled={isAwsCalculating}
              className="py-1.5 px-3 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Test direct calculation on AWS Lambda via API Gateway"
            >
              <Cloud className={`h-3.5 w-3.5 ${isAwsCalculating ? 'animate-bounce' : ''}`} />
              <span>{isAwsCalculating ? 'Invoking AWS...' : 'Compute on AWS Lambda'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Row 1: Transport Mode and Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Transport commute mode</label>
                <select
                  value={calcForm.transportMode}
                  onChange={(e) => setCalcForm({ ...calcForm, transportMode: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="car_petrol">Petrol/Diesel Sedan</option>
                  <option value="car_electric">Electric Car (EV)</option>
                  <option value="motorcycle">Motorcycle/Scooter</option>
                  <option value="public">Public Transit (Subway/Bus)</option>
                  <option value="walk">Walking or Cycling</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Weekly commuting distance: {calcForm.weeklyDistanceKm} km</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={calcForm.weeklyDistanceKm}
                  onChange={(e) => setCalcForm({ ...calcForm, weeklyDistanceKm: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-3 cursor-pointer"
                />
              </div>
            </div>

            {/* Row 2: Electricity & AC Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Monthly Electricity: {calcForm.electricityKwhM} kWh</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="20"
                  value={calcForm.electricityKwhM}
                  onChange={(e) => setCalcForm({ ...calcForm, electricityKwhM: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-3 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Air Conditioning Hours/Day: {calcForm.acHoursPerDay} hrs</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={calcForm.acHoursPerDay}
                  onChange={(e) => setCalcForm({ ...calcForm, acHoursPerDay: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-3 cursor-pointer"
                />
              </div>
            </div>

            {/* Row 3: Diet & Flight hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Diet type</label>
                <select
                  value={calcForm.diet}
                  onChange={(e) => setCalcForm({ ...calcForm, diet: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="vegan">Vegan (Completely plant-based)</option>
                  <option value="vegetarian">Vegetarian (Dairy-inclusive)</option>
                  <option value="low_meat">Low Meat (Mixed/Flexitarian)</option>
                  <option value="high_meat">High Meat (Heavy beef/meat)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Annual flight duration: {calcForm.flightHoursPerYear} hours</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={calcForm.flightHoursPerYear}
                  onChange={(e) => setCalcForm({ ...calcForm, flightHoursPerYear: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-3 cursor-pointer"
                />
              </div>
            </div>

            {/* Row 4: Shopping & Recycling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Consumer Shopping frequency</label>
                <select
                  value={calcForm.shoppingFrequency}
                  onChange={(e) => setCalcForm({ ...calcForm, shoppingFrequency: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="low">Low (Minimalist/Essentials)</option>
                  <option value="medium">Medium (Moderate shopping)</option>
                  <option value="high">High (Frequent purchases)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Recycling Rate: {Math.round(calcForm.wasteRecyclingRate * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcForm.wasteRecyclingRate * 100}
                  onChange={(e) => setCalcForm({ ...calcForm, wasteRecyclingRate: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500 mt-3 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-900 flex justify-between items-center">
            <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-400" />
              <span>Saves calculation history under MongoDB profile &amp; optional AWS DynamoDB audit</span>
            </p>
            <button
              type="submit"
              disabled={loadingCarbon}
              className="py-2.5 px-6 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loadingCarbon ? 'animate-spin' : ''}`} />
              <span>Save Profile calculations</span>
            </button>
          </div>
        </form>

        {/* Right Column preview gauge */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-fit shadow-xl border border-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-base">Carbon Footprint Preview</h3>
                <p className="text-xs text-gray-400 mt-1">Real-time simulation feedback</p>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                AWS Spec
              </span>
            </div>

            <div className="py-6 text-center space-y-2">
              <span className="text-5xl font-extrabold text-emerald-400">
                {awsResult?.totalCarbon ?? liveStats.total}
              </span>
              <span className="text-xs text-gray-400 block">kg CO₂ / month</span>
              
              <div className="pt-4">
                <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(liveStats.t / liveStats.total) * 100}%` }} title="Transport"></div>
                  <div className="bg-blue-500 h-full" style={{ width: `${(liveStats.e / liveStats.total) * 100}%` }} title="Energy"></div>
                  <div className="bg-amber-500 h-full" style={{ width: `${(liveStats.f / liveStats.total) * 100}%` }} title="Food"></div>
                  <div className="bg-pink-500 h-full" style={{ width: `${(liveStats.s / liveStats.total) * 100}%` }} title="Shopping"></div>
                  <div className="bg-purple-500 h-full" style={{ width: `${(liveStats.w / liveStats.total) * 100}%` }} title="Waste"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-gray-900/60 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1">🚗 Transport</span>
                <span className="font-bold text-white">{awsResult?.breakdown?.transport ?? liveStats.t} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1">⚡ Home Energy</span>
                <span className="font-bold text-white">{awsResult?.breakdown?.homeEnergy ?? liveStats.e} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1">🍔 Food habits</span>
                <span className="font-bold text-white">{awsResult?.breakdown?.food ?? liveStats.f} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1">🛍️ Shopping habits</span>
                <span className="font-bold text-white">{awsResult?.breakdown?.shopping ?? liveStats.s} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-1">🗑️ Waste output</span>
                <span className="font-bold text-white">{awsResult?.breakdown?.waste ?? liveStats.w} kg</span>
              </div>
            </div>

            {/* Largest Source Indicator from AWS */}
            {(awsResult?.largestSource || liveStats.total > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-900/80 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Largest Contributor:</span>
                <span className="font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {awsResult?.largestSource || 'Computed on AWS'}
                </span>
              </div>
            )}
          </div>

          {/* Actionable recommendations card from AWS calculation */}
          {awsResult?.recommendations && awsResult.recommendations.length > 0 && (
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 text-xs space-y-2 bg-emerald-950/20">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>AWS Actionable Insights</span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium">
                {awsResult.recommendations[0].title}
              </p>
              <p className="text-[10px] text-gray-400">
                {awsResult.recommendations[0].description}
              </p>
              <div className="text-[10px] text-emerald-400/90 font-mono">
                Estimated savings: ~{awsResult.recommendations[0].estimatedReductionKg} kg CO₂/mo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
