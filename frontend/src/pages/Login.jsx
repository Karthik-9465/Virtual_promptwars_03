import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Leaf, Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { loginUser, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await loginUser(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl relative overflow-hidden shadow-2xl border border-gray-900">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Leaf className="h-8 w-8 animate-float" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white font-sans">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to track and reduce your carbon footprint
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:underline font-bold">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
