"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import "../../styles/globals.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and get user
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && window.location.pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session) {
        setUserEmail(session.user.email || 'Admin');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && window.location.pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session) {
        setUserEmail(session.user.email || 'Admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const links = [['Overview', '/admin/dashboard'], ['Calendar', '/admin/calendar'], ['Students', '/admin/students'], ['Packages', '/admin/packages'], ['Settings', '/admin/settings']];

  if (pathname === '/admin/login') return <>{children}</>;

  return (
      <div className="min-h-screen bg-[#f3f5f2] text-[#172523]">
        {/* Admin Header */}
        <header className="border-b border-white/10 bg-[#0d2926] text-white">
          <div className="mx-auto max-w-[90rem] px-5 py-5 md:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center border border-white/30">♩</span>
                <div><h1 className="font-heading text-base font-semibold md:text-lg">Hannah Piano Studio</h1><span className="text-sm text-white/65">Studio admin</span></div>
              </div>

              <nav className="hidden items-center gap-1 md:flex">{links.map(([label, href]) => <a key={href} href={href} className={`px-3 py-2 text-base transition ${pathname === href ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>{label}</a>)}</nav>

              <div className="flex items-center gap-4">
                <span className="text-sm text-piano-white/80 hidden sm:block">
                  {userEmail || 'Admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-white/20 px-3 py-2 text-sm text-white/75 hover:border-white/50 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 text-base md:hidden">{links.map(([label, href]) => <a key={href} href={href} className={`whitespace-nowrap px-3 py-2 ${pathname === href ? 'bg-white/12 text-white' : 'text-white/70'}`}>{label}</a>)}</nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[90rem] px-5 py-8 md:px-8 md:py-12">
          {children}
        </main>
      </div>
  );
}
