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
    <div className="grid min-h-screen bg-[#0d2926] lg:grid-cols-[1.1fr_.9fr]">
      <div className="relative hidden lg:block">
        <img src="/images/piano2.jpeg" alt="Teacher and student at an upright piano" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0d2926]/20" />
        <a href="/" className="absolute left-10 top-9 text-sm font-semibold text-white">← Back to studio</a>
        <p className="absolute bottom-10 left-10 max-w-md font-display text-4xl leading-tight text-white">A clear view of every lesson, student and week ahead.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-16 md:px-12">
      <div className="w-full max-w-md bg-[#f7f8f5] p-7 md:p-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 grid h-11 w-11 place-items-center border border-[#8fa39e] text-xl text-[#173c38]">♩</div>
          <h1 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-ink-600 text-sm">
            {mode === 'login' ? "Sign in to manage the studio." : "Set up your studio access."}
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
              className="w-full border border-[#aab8b4] bg-white px-4 py-3 focus:border-[#173c38] focus:outline-none focus:ring-2 focus:ring-[#173c38]/15"
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
              className="w-full border border-[#aab8b4] bg-white px-4 py-3 focus:border-[#173c38] focus:outline-none focus:ring-2 focus:ring-[#173c38]/15"
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
            className="w-full bg-[#173c38] px-6 py-3 font-medium text-white transition-colors hover:bg-[#24554f] disabled:opacity-50"
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
            className="text-sm font-medium text-[#2d665f] hover:text-[#173c38]"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
