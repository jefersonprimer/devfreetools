'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, Key, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import Link from 'next/link';

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
    label: 'Visão Geral',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Chaves de API',
    href: '/dashboard/keys',
    icon: Key,
  },
  {
    label: 'Links Curtos',
    href: '/dashboard/links',
    icon: LinkIcon,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, refreshUser: fetchUser }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header 
          leftElement={
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          }
        />
        
        <div className="flex-1 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-1 px-4 sm:px-6 lg:px-8 py-8 gap-10">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-all duration-300 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex flex-col h-full lg:h-auto">
                <nav className="flex-1 space-y-1">
                  <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    Menu Principal
                  </p>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-foreground/5 text-foreground shadow-sm ring-1 ring-foreground/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                          {item.label}
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <div className="px-4 py-4 rounded-xl border border-border/50 bg-foreground/[0.02]">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Plano Atual</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-foreground font-semibold text-sm capitalize">{user?.plan || 'Free'}</p>
                      <Link 
                        href="/#pricing" 
                        className="text-[10px] font-bold text-primary hover:underline underline-offset-4"
                      >
                        UPGRADE
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Page content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
