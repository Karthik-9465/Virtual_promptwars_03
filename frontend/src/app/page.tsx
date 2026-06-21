'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  Flame,
  Award,
  TrendingDown,
  MessageSquare,
  Zap,
  Car,
  Compass,
  Plus,
  Loader2,
  CheckCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  HelpCircle,
  DollarSign,
  ChevronRight,
  Send,
  Trash2,
  Shield,
  ShoppingBag,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [footprints, setFootprints] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'actions' | 'goals' | 'chat' | 'badges'>('dashboard');

  // Authentication forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Onboarding wizard & Calculator edit forms
  const [isOnboarded, setIsOnboarded] = useState(false);
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

  // Goals forms
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('total');
  const [goalTarget, setGoalTarget] = useState(50); // kg CO2
  const [goalWeeks, setGoalWeeks] = useState(4);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Status Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('carbon_auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userRes = await api.getMe();
      setUser(userRes);
      
      if (userRes.profile) {
        setProfile(userRes.profile);
        setCalcForm({
          ageGroup: userRes.profile.ageGroup,
          location: userRes.profile.location,
          diet: userRes.profile.diet,
          transportMode: userRes.profile.transportMode,
          weeklyDistanceKm: userRes.profile.weeklyDistanceKm,
          electricityKwhM: userRes.profile.electricityKwhM,
          acHoursPerDay: userRes.profile.acHoursPerDay,
          flightHoursPerYear: userRes.profile.flightHoursPerYear,
          shoppingFrequency: userRes.profile.shoppingFrequency,
          wasteRecyclingRate: userRes.profile.wasteRecyclingRate,
        });
        setIsOnboarded(true);
        await Promise.all([
          fetchAnalytics(),
          fetchRecommendations(),
          fetchGoals(),
          fetchChatHistory()
        ]);
      } else {
        setIsOnboarded(false);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error(err);
    showToast(err.message || 'Authentication error', 'error');
    api.logout();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      setAnalytics(data);
      setProfile(data.profile);
      setFootprints(data.footprints);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const fetchGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const data = await api.getChatHistory();
      setChatMessages(data);
    } catch (err: any) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.login({ email: loginEmail, password: loginPassword });
      setToken(res.token);
      showToast(`Welcome back, ${res.user.name}!`);
      await fetchUserData();
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.register({
        email: regEmail,
        password: regPassword,
        name: regName,
        ...calcForm
      });
      setToken(res.token);
      showToast(`Welcome to EcoCarbon, ${res.user.name}!`);
      await fetchUserData();
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.updateProfile(calcForm);
      setProfile(res.profile);
      setIsOnboarded(true);
      showToast('Eco profile successfully set up!');
      await fetchUserData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.updateProfile(calcForm);
      setProfile(res.profile);
      showToast('Calculations updated and profile saved!');
      await fetchAnalytics();
      await fetchRecommendations();
    } catch (err: any) {
      showToast(err.message || 'Failed to update footprint', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recId: string, status: 'completed' | 'skipped') => {
    try {
      const res = await api.performAction(recId, status);
      
      if (status === 'completed') {
        const xpEarned = res.gamification?.xpPoints - (profile?.xpPoints || 0);
        showToast(`Action completed! +${xpEarned} XP. Streak: ${res.gamification?.streakDays} days 🔥`);
        
        if (res.gamification?.newlyUnlockedBadges?.length > 0) {
          setTimeout(() => {
            showToast(`🎖️ New badge unlocked: ${res.gamification.newlyUnlockedBadges.join(', ')}!`, 'success');
          }, 1500);
        }
      } else {
        showToast('Action dismissed');
      }

      await Promise.all([
        fetchAnalytics(),
        fetchRecommendations(),
        fetchGoals()
      ]);
    } catch (err: any) {
      showToast(err.message || 'Failed to update action', 'error');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (goalWeeks * 7));

      await api.createGoal({
        title: goalTitle,
        category: goalCategory,
        targetValue: Number(goalTarget),
        endDate: endDate.toISOString(),
      });

      showToast('Goal created successfully!');
      setGoalTitle('');
      setGoalTarget(50);
      await fetchGoals();
    } catch (err: any) {
      showToast(err.message || 'Failed to create goal', 'error');
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const text = customMsg || chatInput;
    if (!text.trim() || chatLoading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      setChatMessages((prev) => [...prev, res.aiResponse]);
    } catch (err: any) {
      showToast(err.message || 'Chat service error', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setToken(null);
    setUser(null);
    setProfile(null);
    showToast('Logged out successfully');
  };

  // Immediate Carbon Calculator preview factor outputs (client side slider reactivities)
  const calculateLivePreview = () => {
    let transFactor = 0.06;
    if (calcForm.transportMode === 'car_petrol') transFactor = 0.18;
    if (calcForm.transportMode === 'car_electric') transFactor = 0.05;
    if (calcForm.transportMode === 'motorcycle') transFactor = 0.10;
    if (calcForm.transportMode === 'walk') transFactor = 0.0;

    const t = (calcForm.weeklyDistanceKm * 4.33 * transFactor) + ((calcForm.flightHoursPerYear / 12) * 90);
    
    let locationFactor = 0.50;
    const loc = calcForm.location.toLowerCase();
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
      t: Math.round(t),
      e: Math.round(e),
      f: Math.round(f),
      s: Math.round(s),
      w: Math.round(w),
      total: Math.round(total),
    };
  };

  const liveStats = calculateLivePreview();

  // Guard against server side hydration mismatch
  if (!mounted) return null;

  // Render Login & Registration screens
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Leaf className="h-8 w-8 animate-float" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
              EcoCarbon
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              AI-Powered Carbon Footprint Tracker & Reduction Assistant
            </p>
          </div>

          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setAuthTab('login')}
              className={`w-1/2 py-2 text-center font-medium border-b-2 transition-all ${
                authTab === 'login'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`w-1/2 py-2 text-center font-medium border-b-2 transition-all ${
                authTab === 'register'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {authTab === 'login' ? (
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
              <div className="rounded-md space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="Alex Green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Onboarding Settings (Can edit later):</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400">Diet</label>
                      <select
                        value={calcForm.diet}
                        onChange={(e) => setCalcForm({ ...calcForm, diet: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-1 text-xs text-white"
                      >
                        <option value="vegan">Vegan</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="low_meat">Low Meat</option>
                        <option value="high_meat">High Meat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400">Transport</label>
                      <select
                        value={calcForm.transportMode}
                        onChange={(e) => setCalcForm({ ...calcForm, transportMode: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-1 text-xs text-white"
                      >
                        <option value="car_petrol">Petrol Car</option>
                        <option value="car_electric">Electric Car</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="public">Public Transport</option>
                        <option value="walk">Walk/Bicycle</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
        {toast && (
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl text-white z-50 text-sm font-medium border ${
            toast.type === 'error' ? 'bg-red-950 border-red-800' : 'bg-emerald-950 border-emerald-800'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  // Render Onboarding questionnaire if not completed profile setup
  if (!isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Create Your Eco Sustainability Profile</h2>
            <p className="text-sm text-gray-400 mt-2">
              EcoCarbon calculates your footprints using precise localized grids and dietary impacts.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Age Group</label>
                <select
                  value={calcForm.ageGroup}
                  onChange={(e) => setCalcForm({ ...calcForm, ageGroup: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="student">Student</option>
                  <option value="professional">Working Professional</option>
                  <option value="senior">Senior Citizen</option>
                  <option value="family">Family Household</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Country/Location</label>
                <input
                  type="text"
                  required
                  value={calcForm.location}
                  onChange={(e) => setCalcForm({ ...calcForm, location: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="e.g. India, USA, Germany"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Dietary Habit</label>
                <select
                  value={calcForm.diet}
                  onChange={(e) => setCalcForm({ ...calcForm, diet: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="vegan">Vegan (Zero animal products)</option>
                  <option value="vegetarian">Vegetarian (No meat, consumes dairy)</option>
                  <option value="low_meat">Low Meat (Occasional poultry/fish)</option>
                  <option value="high_meat">High Meat (Regular beef/pork)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Primary Commute Mode</label>
                <select
                  value={calcForm.transportMode}
                  onChange={(e) => setCalcForm({ ...calcForm, transportMode: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="car_petrol">Petrol/Diesel Car</option>
                  <option value="car_electric">Electric Car (EV)</option>
                  <option value="motorcycle">Motorcycle/Scooter</option>
                  <option value="public">Public Transport (Train/Bus)</option>
                  <option value="walk">Bicycle or Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Weekly Distance Commuted (km)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.weeklyDistanceKm}
                  onChange={(e) => setCalcForm({ ...calcForm, weeklyDistanceKm: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Monthly Electricity Usage (kWh)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.electricityKwhM}
                  onChange={(e) => setCalcForm({ ...calcForm, electricityKwhM: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">AC Usage (Hours per day)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  required
                  value={calcForm.acHoursPerDay}
                  onChange={(e) => setCalcForm({ ...calcForm, acHoursPerDay: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Annual Flight Duration (Hours)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.flightHoursPerYear}
                  onChange={(e) => setCalcForm({ ...calcForm, flightHoursPerYear: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Shopping Frequency</label>
                <select
                  value={calcForm.shoppingFrequency}
                  onChange={(e) => setCalcForm({ ...calcForm, shoppingFrequency: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="low">Minimalist (Buy only essentials)</option>
                  <option value="medium">Average (Moderate clothes/electronics)</option>
                  <option value="high">Frequent (Regular fast-fashion & gadgets)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Waste Recycling Rate (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcForm.wasteRecyclingRate * 100}
                  onChange={(e) => setCalcForm({ ...calcForm, wasteRecyclingRate: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500 mt-3"
                />
                <span className="text-xs text-gray-400 mt-1 block text-right">{Math.round(calcForm.wasteRecyclingRate * 100)}% recycled</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <div className="text-left">
                <span className="text-xs text-gray-400 block">Estimated Footprint</span>
                <span className="text-lg font-bold text-emerald-400">{liveStats.total} kg CO₂ / month</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-8 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Save Profile & Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Helper variables for badge displays
  const getBadgeIcon = (name: string) => {
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

  const badgeDescriptions: Record<string, string> = {
    'Eco Beginner': 'Created profile and initiated sustainability tracking.',
    'Green Champion': 'Earned a total of 1,000 XP points.',
    'Carbon Hero': 'Earned a total of 3,000 XP points.',
    'Planet Protector': 'Reached elite carbon tracking level with 6,000 XP.',
    'Sustainability Sage': 'Achieved an outstanding Eco Sustainability Score of 80+.',
    'Streak Star': 'Maintained a consecutive log streak of 7 days.',
  };

  // Setup dynamic category data for Pie Chart
  const latestFootprint = footprints[footprints.length - 1];
  const pieData = latestFootprint
    ? [
        { name: 'Transport', value: latestFootprint.transportEmissions },
        { name: 'Home Energy', value: latestFootprint.energyEmissions },
        { name: 'Food', value: latestFootprint.foodEmissions },
        { name: 'Shopping', value: latestFootprint.shoppingEmissions },
        { name: 'Waste', value: latestFootprint.wasteEmissions },
      ].filter((item) => item.value > 0)
    : [];

  const trendData = footprints.map((record) => {
    const monthName = new Date(record.recordedMonth).toLocaleString('default', { month: 'short' });
    return {
      month: monthName,
      Transport: record.transportEmissions,
      Energy: record.energyEmissions,
      Food: record.foodEmissions,
      Shopping: record.shoppingEmissions,
      Waste: record.wasteEmissions,
      Total: record.totalEmissions,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-200">
      
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl text-white z-50 text-sm font-medium border flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-950 border-red-800' : 'bg-emerald-950 border-emerald-800'
        }`}>
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 glass-panel border-r border-gray-900 hidden md:flex flex-col h-full">
        <div className="p-6 border-b border-gray-900 flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
            <Leaf className="h-6 w-6 animate-float" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">EcoCarbon</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'calculator', label: 'Eco Calculator', icon: Zap },
            { id: 'actions', label: 'Recommendations', icon: Leaf },
            { id: 'goals', label: 'My Goals', icon: TrendingDown },
            { id: 'chat', label: 'EcoBot Chat', icon: MessageSquare },
            { id: 'badges', label: 'Achievements', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:bg-red-950/20 hover:text-red-400 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-radial-gradient">
        
        {/* HEADER SECTION */}
        <header className="h-16 border-b border-gray-900 flex items-center justify-between px-6 bg-gray-900/20 backdrop-blur-md">
          <div className="flex items-center gap-3 md:hidden">
            <Leaf className="h-6 w-6 text-emerald-400" />
            <span className="font-extrabold text-lg tracking-wider text-white">EcoCarbon</span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-400">Welcome, <span className="text-white font-bold">{user?.name}</span></span>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-1 text-xs">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Flame className="h-4 w-4 fill-amber-500 animate-pulse" />
                  <span>{profile.streakDays} Day Streak</span>
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300 font-medium">Level {profile.level || 1}</span>
                <span className="text-emerald-400 font-bold">({profile.xpPoints} XP)</span>
              </div>
            )}
            
            {/* Mobile burger alternatives for navigation */}
            <div className="md:hidden flex gap-1">
              {['dashboard', 'calculator', 'actions', 'goals', 'chat', 'badges'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`p-1.5 rounded transition-all capitalize text-[10px] ${
                    activeTab === t ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEW PORT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TOAST ON SCREEN ERROR */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          )}

          {!loading && (
            <>
              {/* TAB 1: DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-float-none">
                  
                  {/* Top Stats Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sustainability Score</span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-4xl font-extrabold text-emerald-400">{profile?.sustainabilityScore}</span>
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {profile?.sustainabilityScore >= 80 ? 'Excellent! Highly sustainable lifestyle.' : 'Moderate emissions. Check reduction plans.'}
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Footprint</span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-4xl font-extrabold text-white">{latestFootprint?.totalEmissions || 0}</span>
                        <span className="text-xs text-gray-400">kg CO₂</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Global Avg: ~500 kg CO₂/month
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Goals</span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-4xl font-extrabold text-blue-400">
                          {analytics?.goalsSummary?.active || 0}
                        </span>
                        <span className="text-xs text-gray-500">ongoing</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {analytics?.goalsSummary?.completed || 0} goals achieved so far!
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank Level</span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-4xl font-extrabold text-amber-500">{profile?.level || 1}</span>
                      </div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-3">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${((profile?.xpProgress || 0) / (profile?.xpNeededForNext || 500)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block text-right">{profile?.xpProgress}/{profile?.xpNeededForNext} XP</span>
                    </div>
                  </div>

                  {/* AI insights panel */}
                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">EcoBot Personalized AI Insights</h4>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed">{analytics?.aiInsights}</p>
                    </div>
                  </div>

                  {/* Charts visualization panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
                      <h3 className="font-bold text-white text-base mb-4">Carbon Footprint Monthly History (kg CO₂)</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendData}>
                            <XAxis dataKey="month" stroke="#4b5563" fontSize={11} />
                            <YAxis stroke="#4b5563" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Transport" stackId="a" fill="#10b981" />
                            <Bar dataKey="Energy" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="Food" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Shopping" stackId="a" fill="#ec4899" />
                            <Bar dataKey="Waste" stackId="a" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base mb-2">Category Contribution</h3>
                        <p className="text-xs text-gray-400">Current month carbon breakdown</p>
                      </div>
                      
                      {pieData.length > 0 ? (
                        <div className="h-48 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-white">{latestFootprint?.totalEmissions}</span>
                            <span className="text-[10px] text-gray-500">Total kg</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 text-xs">No footprint data to display. Please run calculator.</div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {pieData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-gray-400 truncate">{item.name} ({Math.round(item.value)} kg)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick wins actions highlight */}
                  <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white text-base">Top Carbon Reduction Recommendations</h3>
                      <button onClick={() => setActiveTab('actions')} className="text-emerald-400 text-xs font-semibold flex items-center gap-1 hover:underline">
                        <span>View All Recommendations</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 2).map((rec) => (
                        <div key={rec.id} className="glass-card p-5 rounded-xl flex justify-between gap-4">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              rec.difficulty === 'low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              rec.difficulty === 'medium' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {rec.difficulty} Effort
                            </span>
                            <h4 className="font-bold text-white text-sm mt-2">{rec.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rec.description}</p>
                            
                            <div className="flex gap-4 mt-3 text-xs text-gray-500">
                              <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                              <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 justify-center">
                            <button
                              onClick={() => handleRecommendationAction(rec.id, 'completed')}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all text-center"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => handleRecommendationAction(rec.id, 'skipped')}
                              className="px-3 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg text-xs transition-all text-center"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                      {recommendations.length === 0 && (
                        <div className="col-span-2 text-center py-6 text-xs text-gray-500">All recommendation actions cleared! Good job!</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: INTERACTIVE ECO CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Side Sliders Settings */}
                  <form onSubmit={handleUpdateProfile} className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                    <div>
                      <h3 className="font-bold text-white text-lg">Eco Habits Calculator</h3>
                      <p className="text-xs text-gray-400 mt-1">Adjust sliders to model sustainability changes instantly.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Transport mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Transport Mode</label>
                          <select
                            value={calcForm.transportMode}
                            onChange={(e) => setCalcForm({ ...calcForm, transportMode: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="car_petrol">Petrol Car</option>
                            <option value="car_electric">Electric Car</option>
                            <option value="motorcycle">Motorcycle/Scooter</option>
                            <option value="public">Public Transport (Train/Bus)</option>
                            <option value="walk">Walking or Cycling</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Weekly Distance Commuted: {calcForm.weeklyDistanceKm} km</label>
                          <input
                            type="range"
                            min="0"
                            max="500"
                            step="10"
                            value={calcForm.weeklyDistanceKm}
                            onChange={(e) => setCalcForm({ ...calcForm, weeklyDistanceKm: Number(e.target.value) })}
                            className="w-full accent-emerald-500 mt-3"
                          />
                        </div>
                      </div>

                      {/* Energy */}
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
                            className="w-full accent-emerald-500 mt-3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Air Conditioner Hours/Day: {calcForm.acHoursPerDay} hrs</label>
                          <input
                            type="range"
                            min="0"
                            max="24"
                            step="1"
                            value={calcForm.acHoursPerDay}
                            onChange={(e) => setCalcForm({ ...calcForm, acHoursPerDay: Number(e.target.value) })}
                            className="w-full accent-emerald-500 mt-3"
                          />
                        </div>
                      </div>

                      {/* Diet & Flights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Diet Type</label>
                          <select
                            value={calcForm.diet}
                            onChange={(e) => setCalcForm({ ...calcForm, diet: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="vegan">Vegan</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="low_meat">Low Meat / Mixed</option>
                            <option value="high_meat">High Meat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Annual Flight Commute: {calcForm.flightHoursPerYear} hours</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={calcForm.flightHoursPerYear}
                            onChange={(e) => setCalcForm({ ...calcForm, flightHoursPerYear: Number(e.target.value) })}
                            className="w-full accent-emerald-500 mt-3"
                          />
                        </div>
                      </div>

                      {/* Shopping & waste */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Shopping habits</label>
                          <select
                            value={calcForm.shoppingFrequency}
                            onChange={(e) => setCalcForm({ ...calcForm, shoppingFrequency: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="low">Low (Minimalist)</option>
                            <option value="medium">Medium (Average)</option>
                            <option value="high">High (Frequent Shopping)</option>
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
                            className="w-full accent-emerald-500 mt-3"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-900 flex justify-between items-center">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-blue-400" />
                        <span>Updating calculations saves history record for current month</span>
                      </p>
                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span>Save to Profile</span>
                      </button>
                    </div>
                  </form>

                  {/* Right Side Instant Feedback Gauge */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-bold text-white text-base">Carbon Footprint Preview</h3>
                      <p className="text-xs text-gray-400 mt-1">Real-time simulation feedback</p>
                    </div>

                    <div className="py-8 text-center space-y-2">
                      <span className="text-5xl font-extrabold text-emerald-400">{liveStats.total}</span>
                      <span className="text-xs text-gray-400 block">kg CO₂ / month</span>
                      
                      <div className="pt-4 px-4">
                        <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (liveStats.t / liveStats.total) * 100)}%` }}></div>
                          <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (liveStats.e / liveStats.total) * 100)}%` }}></div>
                          <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (liveStats.f / liveStats.total) * 100)}%` }}></div>
                          <div className="bg-pink-500 h-full" style={{ width: `${Math.min(100, (liveStats.s / liveStats.total) * 100)}%` }}></div>
                          <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (liveStats.w / liveStats.total) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs border-t border-gray-900 pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">🚗 Transportation</span>
                        <span className="font-semibold text-white">{liveStats.t} kg CO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">⚡ Home Energy</span>
                        <span className="font-semibold text-white">{liveStats.e} kg CO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🍔 Food habits</span>
                        <span className="font-semibold text-white">{liveStats.f} kg CO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🛍️ Shopping habits</span>
                        <span className="font-semibold text-white">{liveStats.s} kg CO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🗑️ Waste output</span>
                        <span className="font-semibold text-white">{liveStats.w} kg CO₂</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: AI RECOMMENDATIONS ENGINE */}
              {activeTab === 'actions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">Personalized Actions</h3>
                      <p className="text-xs text-gray-400 mt-1">Recommendations prioritized by maximum impact, feasibility, and preference.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Quick Wins */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-emerald-400 text-sm border-b border-gray-900 pb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Quick Wins (Low Difficulty)</span>
                      </h4>
                      {recommendations.filter(r => r.difficulty === 'low').map(rec => (
                        <div key={rec.id} className="glass-card p-5 rounded-xl space-y-3 flex flex-col justify-between h-[180px]">
                          <div>
                            <h5 className="font-bold text-white text-xs leading-normal">{rec.title}</h5>
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{rec.description}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-2.5">
                              <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                              <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleRecommendationAction(rec.id, 'completed')} className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all text-center">Complete</button>
                              <button onClick={() => handleRecommendationAction(rec.id, 'skipped')} className="w-1/2 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded text-[11px] transition-all text-center">Dismiss</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {recommendations.filter(r => r.difficulty === 'low').length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-xs bg-white/2 rounded-xl">Clear!</div>
                      )}
                    </div>

                    {/* Column 2: Moderate Actions */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-blue-400 text-sm border-b border-gray-900 pb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>Moderate Actions (Medium Effort)</span>
                      </h4>
                      {recommendations.filter(r => r.difficulty === 'medium').map(rec => (
                        <div key={rec.id} className="glass-card p-5 rounded-xl space-y-3 flex flex-col justify-between h-[180px]">
                          <div>
                            <h5 className="font-bold text-white text-xs leading-normal">{rec.title}</h5>
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{rec.description}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-2.5">
                              <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                              <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleRecommendationAction(rec.id, 'completed')} className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all text-center">Complete</button>
                              <button onClick={() => handleRecommendationAction(rec.id, 'skipped')} className="w-1/2 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded text-[11px] transition-all text-center">Dismiss</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {recommendations.filter(r => r.difficulty === 'medium').length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-xs bg-white/2 rounded-xl">Clear!</div>
                      )}
                    </div>

                    {/* Column 3: High Impact Changes */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-amber-500 text-sm border-b border-gray-900 pb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>High Impact Changes (Significant Effort)</span>
                      </h4>
                      {recommendations.filter(r => r.difficulty === 'high').map(rec => (
                        <div key={rec.id} className="glass-card p-5 rounded-xl space-y-3 flex flex-col justify-between h-[180px]">
                          <div>
                            <h5 className="font-bold text-white text-xs leading-normal">{rec.title}</h5>
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{rec.description}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-2.5">
                              <span>CO₂: <strong className="text-emerald-400">-{rec.co2Reduction} kg/m</strong></span>
                              <span>Savings: <strong className="text-white">₹{rec.estimatedSavings}/m</strong></span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleRecommendationAction(rec.id, 'completed')} className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all text-center">Complete</button>
                              <button onClick={() => handleRecommendationAction(rec.id, 'skipped')} className="w-1/2 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded text-[11px] transition-all text-center">Dismiss</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {recommendations.filter(r => r.difficulty === 'high').length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-xs bg-white/2 rounded-xl">Clear!</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GOAL TRACKING SYSTEM */}
              {activeTab === 'goals' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Create Goal panel */}
                  <div className="glass-panel p-6 rounded-2xl h-fit">
                    <h3 className="font-bold text-white text-base mb-4">Set Carbon Reduction Goal</h3>
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Goal Title</label>
                        <input
                          type="text"
                          required
                          value={goalTitle}
                          onChange={(e) => setGoalTitle(e.target.value)}
                          className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                          placeholder="e.g. Reduce commuter footprint"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Focus Category</label>
                        <select
                          value={goalCategory}
                          onChange={(e) => setGoalCategory(e.target.value)}
                          className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        >
                          <option value="total">Overall Emissions</option>
                          <option value="transport">Transportation</option>
                          <option value="energy">Home Energy</option>
                          <option value="food">Diet Habits</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Carbon Reduction (kg CO₂)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(Number(e.target.value))}
                          className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Timeframe (Weeks)</label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          required
                          value={goalWeeks}
                          onChange={(e) => setGoalWeeks(Number(e.target.value))}
                          className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Activate Goal</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Ongoing/History lists */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                    <div>
                      <h3 className="font-bold text-white text-base">Carbon Mitigation Targets</h3>
                      <p className="text-xs text-gray-400 mt-1">Goal updates trigger dynamically as you complete recommendation actions.</p>
                    </div>

                    <div className="space-y-4">
                      {goals.map((g) => (
                        <div key={g.id} className="glass-card p-5 rounded-xl border-l-4 border-l-blue-500 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-sm">{g.title}</h4>
                              <p className="text-[10px] text-gray-500 uppercase mt-0.5">{g.category} category goal</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              g.isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}>
                              {g.isCompleted ? 'Completed' : 'Active'}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Progress: <strong className="text-white">{g.currentValue}</strong> / {g.targetValue} kg CO₂</span>
                              <span className="text-emerald-400 font-bold">{Math.round(Math.min(100, (g.currentValue / g.targetValue) * 100))}%</span>
                            </div>
                            <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-500 flex justify-between">
                            <span>Started: {new Date(g.startDate).toLocaleDateString()}</span>
                            <span>Ends: {new Date(g.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}

                      {goals.length === 0 && (
                        <div className="text-center py-12 text-gray-500 text-xs">You have no reduction goals set. Use the form to start one!</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: AI CHAT ASSISTANT */}
              {activeTab === 'chat' && (
                <div className="glass-panel rounded-2xl flex flex-col h-[calc(100vh-160px)] overflow-hidden">
                  
                  {/* Chat header */}
                  <div className="p-4 border-b border-gray-900 bg-gray-950/40 flex items-center gap-3">
                    <div className="bg-emerald-500/15 p-2 rounded-full text-emerald-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">EcoBot</h4>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                        <span>Context Aware AI Assistant</span>
                      </p>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
                        <Leaf className="h-10 w-10 text-emerald-500/30 animate-float" />
                        <h4 className="font-bold text-white text-sm">Ask EcoBot Anything</h4>
                        <p className="text-xs text-gray-500">
                          Ask about carbon footprint values, custom eco calculations, diet modifications, or shopping options.
                        </p>
                        <div className="w-full space-y-2 pt-2">
                          <button
                            onClick={() => handleSendChat(undefined, 'What is the environmental impact of eating meat daily?')}
                            className="w-full text-left p-2.5 rounded-lg border border-gray-800 hover:border-emerald-800 text-xs text-gray-400 hover:text-white transition-all bg-white/2"
                          >
                            🍔 What is the environmental impact of eating meat daily?
                          </button>
                          <button
                            onClick={() => handleSendChat(undefined, 'Is cycling better than using a scooter?')}
                            className="w-full text-left p-2.5 rounded-lg border border-gray-800 hover:border-emerald-800 text-xs text-gray-400 hover:text-white transition-all bg-white/2"
                          >
                            🚲 Is cycling better than using a scooter?
                          </button>
                          <button
                            onClick={() => handleSendChat(undefined, 'How can I reduce my home energy footprint?')}
                            className="w-full text-left p-2.5 rounded-lg border border-gray-800 hover:border-emerald-800 text-xs text-gray-400 hover:text-white transition-all bg-white/2"
                          >
                            💡 How can I reduce my home energy footprint?
                          </button>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none font-medium'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4 text-emerald-400" />
                          <span>EcoBot is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef}></div>
                  </div>

                  {/* Input form */}
                  <form onSubmit={(e) => handleSendChat(e)} className="p-3 border-t border-gray-900 bg-gray-950/20 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      placeholder="Ask EcoBot a sustainability question..."
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: GAMIFICATION & BADGES SYSTEM */}
              {activeTab === 'badges' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">Milestone Badges</h3>
                    <p className="text-xs text-gray-400 mt-1">Earn points, streaks, and scores to unlock exclusive eco achievements.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.keys(badgeDescriptions).map((badgeName) => {
                      const isEarned = analytics?.badges?.some((b: any) => b.badgeName === badgeName);
                      return (
                        <div
                          key={badgeName}
                          className={`glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4 border transition-all duration-300 ${
                            isEarned
                              ? 'border-emerald-500/30 bg-emerald-950/10'
                              : 'border-gray-900 opacity-40 grayscale'
                          }`}
                        >
                          <span className="text-5xl">{getBadgeIcon(badgeName)}</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">{badgeName}</h4>
                            <p className="text-xs text-gray-400 mt-1.5">{badgeDescriptions[badgeName]}</p>
                          </div>
                          {isEarned ? (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              Unlocked 🎖️
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-600 font-semibold bg-gray-900 px-2 py-0.5 rounded">
                              Locked 🔒
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
}
