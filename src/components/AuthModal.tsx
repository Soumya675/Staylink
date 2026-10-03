import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { X, Eye, EyeOff, Check, AlertCircle, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultTab = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('renter');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = tab === 'login' || (password === confirmPassword && confirmPassword.length > 0);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
        onClose();
      } else {
        if (!isPasswordValid) {
          setError('Please fulfill all password security rules');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!agreeTerms) {
          setError('Please agree to StayLink Terms of Service & Privacy Policy');
          setLoading(false);
          return;
        }

        const res = await api.register({
          name,
          email,
          phone,
          role,
          password
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType: 'renter' | 'owner' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail =
        roleType === 'renter'
          ? 'rahul.sharma@example.in'
          : roleType === 'owner'
          ? 'priya.verma@example.in'
          : 'admin@staylink.in';

      const res = await api.login(demoEmail, 'DemoPass@123');
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {tab === 'login' ? 'Welcome Back to StayLink' : 'Join StayLink Direct'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tab === 'login' ? 'Access your saved homes, visits, and direct chats' : 'Zero middleman rental marketplace in India'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher Strip */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Quick One-Click Demo:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('renter')}
              className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-500 rounded text-slate-700 font-medium hover:text-blue-600 transition-colors shadow-2xs"
            >
              Renter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-500 rounded text-slate-700 font-medium hover:text-blue-600 transition-colors shadow-2xs"
            >
              Homeowner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-500 rounded text-slate-700 font-medium hover:text-blue-600 transition-colors shadow-2xs"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 rounded-md transition-colors ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 rounded-md transition-colors ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {tab === 'register' && (
            <>
              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am joining as a:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('renter')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                      role === 'renter'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">Tenant / Renter</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Looking for home or PG</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                      role === 'owner'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">Property Owner</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Listing properties directly</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (India +91)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@example.in"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              {tab === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter secure password"
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Live Password Strength Checklist */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] space-y-1.5">
                <p className="font-semibold text-slate-700">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${hasDigit ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Special symbol (@#$)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch && confirmPassword ? 'text-emerald-700 font-medium' : ''}`}>
                    <Check className={`w-3 h-3 ${passwordsMatch && confirmPassword ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-500 leading-tight">
                  I agree to StayLink's Terms of Service, Privacy Policy, and Anti-Broker Fair Housing Covenant.
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
          >
            {loading ? 'Processing...' : tab === 'login' ? 'Sign In to StayLink' : 'Create Free StayLink Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
