"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple hardcoded admin credential for demo
  // In production, use Supabase Auth or proper backend
  const ADMIN_EMAIL = "admin@pianoclass.com";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Demo: Simple hardcoded check
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Store auth in cookie for middleware to read
        document.cookie = "adminAuth=true; path=/; max-age=86400"; // 24 hours
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
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
            Admin Login
          </h1>
          <p className="text-ink-600 text-sm">
            Hannah&apos;s Piano Class Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="admin@pianoclass.com"
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
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo Credentials Notice */}
        <div className="mt-6 p-3 bg-surface-50 rounded-lg">
          <p className="text-xs text-ink-600 text-center">
            <strong>Demo Credentials:</strong><br/>
            Email: admin@pianoclass.com<br/>
            Password: admin123
          </p>
          <p className="text-xs text-ink-500 text-center mt-2">
            🔒 In production, use Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
