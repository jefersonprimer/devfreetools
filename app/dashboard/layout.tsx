'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, LayoutDashboard, Key, Link as LinkIcon } from 'lucide-react';
import { Header } from '@/components/Header';

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
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'API Keys',
    href: '/dashboard/keys',
    icon: <Key className="w-5 h-5" />,
  },
  {
    label: 'Links',
    href: '/dashboard/links',
    icon: <LinkIcon className="w-5 h-5" />,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, refreshUser: fetchUser }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
        <Header 
          leftElement={
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          }
        />
        
        <div className="flex-1 flex flex-col transition-colors">
          <div className="max-w-7xl mx-auto w-full flex flex-1 px-4 sm:px-6 lg:px-8 py-8 gap-8">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Logo - Hidden in Sidebar because it's in the Header now, but keeping for mobile if needed, or removing */}
              <div className="p-6 border-b border-border lg:hidden">
                <a href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-lg font-bold text-foreground tracking-tight">Devfreetools</span>
                </a>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 lg:mt-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* Plan badge */}
              <div className="pt-4 border-t border-border">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/10 rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Plano atual</p>
                  <p className="text-foreground font-bold text-sm mt-1 capitalize">{user?.plan || 'Free'}</p>
                </div>
              </div>
            </aside>

            {/* Page content */}
            <main className="flex-1 min-w-0 transition-colors">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
