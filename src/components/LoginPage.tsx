import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Check, Loader2, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess
}) => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
      } else {
        login(data.token, data.user, data.settings);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError('Server communication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    // Auto register/login demo user
    const demoEmail = 'demo@aisql.com';
    const demoPass = 'password123';

    try {
      // First try login
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass })
      });

      let data = await res.json();

      if (!res.ok) {
        // Register demo user if not created
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Demo Analyst',
            email: demoEmail,
            password: demoPass,
            confirmPassword: demoPass
          })
        });
        data = await res.json();
      }

      if (res.ok && data.token) {
        login(data.token, data.user, data.settings);
        onLoginSuccess();
      } else {
        setError('Demo login failed. Please register manually.');
      }
    } catch (e) {
      setError('Demo login error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 mb-3 cursor-pointer hover:scale-105 transition"
          >
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your AI SQL Query Builder workspace</p>
        </div>

        {/* Demo Account Quick Access */}
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Try instant access with Demo Account</span>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shrink-0 disabled:opacity-50"
          >
            Instant Demo
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="rememberMe" className="text-xs text-slate-400 select-none cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateRegister}
            className="font-bold text-indigo-400 hover:underline"
          >
            Register here
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-bold text-base text-white mb-2">Forgot Password</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Password reset links are configured via email integration. For testing, please use the instant demo button or register a new test account.
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
