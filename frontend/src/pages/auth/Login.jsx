import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Boxes, Shield, User, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">StockSense</h1>
          <p className="text-xs text-slate-500 mt-1">Intelligent Furniture Inventory & Operations ERP</p>
        </div>

        {/* 1-Click Quick Demo Sign-in Cards */}
        <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5 text-center">
            🚀 1-Click Demo Evaluation Access
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('manager')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-50/60 hover:border-indigo-400 transition shadow-xs group"
            >
              <Shield className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-bold">Manager / Owner</span>
              <span className="text-[10px] text-slate-500">Full ERP Access</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('staff')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50/60 hover:border-emerald-400 transition shadow-xs group"
            >
              <User className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-bold">Warehouse Staff</span>
              <span className="text-[10px] text-slate-500">Stock & Pick/Pack</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">Or Sign in with Email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@stocksense.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                Forgot with OTP?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register new user
          </Link>
        </p>
      </div>
    </div>
  );
};
