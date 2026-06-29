"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.session) {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setError("Account created! You can now login.");
        setMode('login');
      }
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 flex items-center justify-center p-4">
      <div className="bg-piano-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-piano-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="2" y="4" width="20" height="16" rx="1" fill="#f8f6f3"/>
              <rect x="4" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="7" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="13" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="16" y="4" width="2" height="12" fill="#1a1a1a"/>
            </svg>
          </div>
          <h1 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            {mode === 'login' ? 'Admin Login' : 'Create Account'}
          </h1>
          <p className="text-ink-600 text-sm">
            {mode === 'login' ? "Login to access your dashboard" : "Sign up for a new account"}
          </p>
        </div>

        {/* Login/Register Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-900 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? (mode === 'login' ? "Logging in..." : "Creating account...") : (mode === 'login' ? "Login" : "Sign Up")}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-sm text-piano-accent hover:text-piano-highlight transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>

        {/* Supabase Auth Notice */}
        <div className="mt-6 p-3 bg-surface-50 rounded-lg">
          <p className="text-xs text-ink-600 text-center">
            🔒 Powered by Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
