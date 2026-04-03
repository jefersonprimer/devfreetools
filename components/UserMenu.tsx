'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, LogOut, User, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const { user, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
      if (res.ok) {
        await refresh();
        router.push('/');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
          <User size={12} className="text-background" />
        </div>
        <span className="text-xs font-medium text-foreground hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg shadow-lg border border-border py-1 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conta</p>
            <p className="text-xs font-medium text-foreground truncate mt-0.5">{user.email}</p>
          </div>

          <div className="p-1">
            <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Aparência</p>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[
                { id: 'light', icon: <Sun size={14} /> },
                { id: 'dark', icon: <Moon size={14} /> },
                { id: 'system', icon: <Monitor size={14} /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                    mounted && theme === t.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="p-1 border-t border-border mt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
