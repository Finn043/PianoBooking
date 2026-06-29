"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../styles/globals.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on client side
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const auth = getCookie("adminAuth");
    if (!auth && window.location.pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    // Remove auth cookie
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  return (
    <html lang="en">
      <body className="bg-surface-100">
        {/* Admin Header */}
        <header className="bg-piano-black text-piano-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-piano-accent"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="1" fill="#f8f6f3"/>
                  <rect x="4" y="4" width="2" height="12" fill="#1a1a1a"/>
                  <rect x="7" y="4" width="2" height="12" fill="#1a1a1a"/>
                  <rect x="13" y="4" width="2" height="12" fill="#1a1a1a"/>
                  <rect x="16" y="4" width="2" height="12" fill="#1a1a1a"/>
                </svg>
                <h1 className="text-xl font-display font-semibold">
                  Hannah&apos;s Piano Class
                </h1>
                <span className="text-piano-white/60 text-sm">Admin</span>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="/admin/dashboard"
                  className="text-sm hover:text-piano-accent transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/calendar"
                  className="text-sm hover:text-piano-accent transition-colors"
                >
                  Calendar
                </a>
                <a
                  href="/admin/students"
                  className="text-sm hover:text-piano-accent transition-colors"
                >
                  Students
                </a>
                <a
                  href="/admin/packages"
                  className="text-sm hover:text-piano-accent transition-colors"
                >
                  Packages
                </a>
                <a
                  href="/admin/settings"
                  className="text-sm hover:text-piano-accent transition-colors"
                >
                  Settings
                </a>
              </nav>

              <div className="flex items-center gap-4">
                <span className="text-sm text-piano-white/80 hidden sm:block">
                  Hannah (Admin)
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-piano-white/80 hover:text-piano-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="md:hidden flex gap-4 mt-4 pb-2 text-sm">
              <a
                href="/admin/dashboard"
                className="text-piano-white/80 hover:text-piano-accent transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/admin/calendar"
                className="text-piano-white/80 hover:text-piano-accent transition-colors"
              >
                Calendar
              </a>
              <a
                href="/admin/students"
                className="text-piano-white/80 hover:text-piano-accent transition-colors"
              >
                Students
              </a>
              <a
                href="/admin/packages"
                className="text-piano-white/80 hover:text-piano-accent transition-colors"
              >
                Packages
              </a>
              <a
                href="/admin/settings"
                className="text-piano-white/80 hover:text-piano-accent transition-colors"
              >
                Settings
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
