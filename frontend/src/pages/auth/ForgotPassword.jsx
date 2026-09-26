import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Boxes, Mail, KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request, 2 = verify
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.auth.forgotPassword(email);
      if (res.success) {
        setGeneratedOtpHint(res.otp);
        setMessage('OTP generated successfully! Please enter the 6-digit code below.');
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.auth.verifyOtpReset({
        email,
        otp,
        newPassword,
      });
      if (res.success) {
        setMessage('Password successfully reset! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 ? 'Enter your email to receive a 6-digit OTP' : 'Enter verification code & new password'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Demo OTP Banner to guarantee instant testing */}
        {generatedOtpHint && step === 2 && (
          <div className="mb-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
            <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
              🔑 Demo Simulation Code:
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xl font-bold tracking-widest text-indigo-900">
                {generatedOtpHint}
              </span>
              <button
                type="button"
                onClick={() => setOtp(generatedOtpHint)}
                className="text-[11px] bg-indigo-600 text-white px-2.5 py-1 rounded font-semibold hover:bg-indigo-700 transition"
              >
                Auto-Fill
              </button>
            </div>
            <p className="text-[10px] text-indigo-600 mt-1">
              (Valid for 15 minutes. In production, this is emailed to the user).
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit OTP Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Verify & Set New Password'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Change Email
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
