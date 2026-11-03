import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Leaf, Loader2, Mail, Lock, User as UserIcon, Globe, Info } from 'lucide-react';

export default function Register() {
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();

  // Auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initial Onboarding parameters
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        password,
        ...calcForm,
      };
      const success = await registerUser(payload);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-8">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl relative overflow-hidden shadow-2xl border border-gray-900">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="text-center mb-6">
          <div className="mx-auto h-11 w-11 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Leaf className="h-7 w-7 animate-float" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white font-sans">
            Create EcoCarbon Account
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Register now to receive a customized carbon reduction plan and unlock EcoBot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-gray-900 pb-1">
              1. Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500">
                    <UserIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="Alex Green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    placeholder="Minimum 6 chars"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Onboarding Questionnaire */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-gray-900 pb-1">
              2. Onboarding Questionnaire (Used to calculate initial footprint)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Age Group</label>
                <select
                  value={calcForm.ageGroup}
                  onChange={(e) => setCalcForm({ ...calcForm, ageGroup: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="student">Student</option>
                  <option value="professional">Working Professional</option>
                  <option value="senior">Senior Citizen</option>
                  <option value="family">Family Household</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Country/Location</label>
                <input
                  type="text"
                  required
                  value={calcForm.location}
                  onChange={(e) => setCalcForm({ ...calcForm, location: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  placeholder="e.g. India, USA, Germany"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Dietary Habits</label>
                <select
                  value={calcForm.diet}
                  onChange={(e) => setCalcForm({ ...calcForm, diet: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="vegan">Vegan (No animal products)</option>
                  <option value="vegetarian">Vegetarian (No meat, eats dairy)</option>
                  <option value="low_meat">Low Meat (Occasional poultry/fish)</option>
                  <option value="high_meat">High Meat (Regular beef/pork)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Commute Mode</label>
                <select
                  value={calcForm.transportMode}
                  onChange={(e) => setCalcForm({ ...calcForm, transportMode: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="car_petrol">Petrol/Diesel Car</option>
                  <option value="car_electric">Electric Car (EV)</option>
                  <option value="motorcycle">Motorcycle/Scooter</option>
                  <option value="public">Public Transport (Train/Bus)</option>
                  <option value="walk">Bicycle or Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Weekly Distance Commuted (km)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.weeklyDistanceKm}
                  onChange={(e) => setCalcForm({ ...calcForm, weeklyDistanceKm: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Monthly Electricity Usage (kWh)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.electricityKwhM}
                  onChange={(e) => setCalcForm({ ...calcForm, electricityKwhM: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">AC Usage (Hours per day)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  required
                  value={calcForm.acHoursPerDay}
                  onChange={(e) => setCalcForm({ ...calcForm, acHoursPerDay: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Annual Flight Duration (Hours)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={calcForm.flightHoursPerYear}
                  onChange={(e) => setCalcForm({ ...calcForm, flightHoursPerYear: Number(e.target.value) })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Shopping habits</label>
                <select
                  value={calcForm.shoppingFrequency}
                  onChange={(e) => setCalcForm({ ...calcForm, shoppingFrequency: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="low">Minimalist (Buy only essentials)</option>
                  <option value="medium">Average (Moderate clothes/electronics)</option>
                  <option value="high">Frequent (Regular fast-fashion & gadgets)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Recycling Rate: {Math.round(calcForm.wasteRecyclingRate * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcForm.wasteRecyclingRate * 100}
                  onChange={(e) => setCalcForm({ ...calcForm, wasteRecyclingRate: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-900 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3 text-blue-400" />
              <span>Inputs can be edited on your dashboard anytime</span>
            </span>
            
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
