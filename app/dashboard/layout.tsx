'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
};

type DashboardContextType = {
  user: User | null;
  refreshUser: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType>({
  user: null,
  refreshUser: async () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'API Keys',
    href: '/dashboard/keys',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function fetchUser() {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, refreshUser: fetchUser }}>
      <div className="min-h-screen bg-[#0a0a0f] text-white flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/[0.02] border-r border-white/[0.06] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06]">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PrimerAPI</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Plan badge */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Plano atual</p>
              <p className="text-white font-bold text-sm mt-1 capitalize">{user?.plan || 'Free'}</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="h-16 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
