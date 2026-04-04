'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register');
        return;
      }

      await refresh();
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#DC5A5A]/5 dark:bg-[#DC5A5A]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-foreground/5 dark:bg-foreground/5 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-lg shadow-foreground/10 group-hover:shadow-foreground/20 transition-all group-hover:-translate-y-0.5">
              <span className="text-background font-black text-xs tracking-tighter">DFT</span>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Devfreetools</span>
          </a>
        </div>

        {/* Card */}
        <div className="bg-card backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl shadow-foreground/5">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Criar conta</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">Comece a usar a Devfreetools hoje mesmo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-5 py-3.5 bg-muted/30 border border-border/50 rounded-2xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#DC5A5A]/20 focus:border-[#DC5A5A]/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@empresa.com"
                className="w-full px-5 py-3.5 bg-muted/30 border border-border/50 rounded-2xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#DC5A5A]/20 focus:border-[#DC5A5A]/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Senha
              </label>
              <div className="relative group/input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-5 py-3.5 bg-muted/30 border border-border/50 rounded-2xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#DC5A5A]/20 focus:border-[#DC5A5A]/50 transition-all text-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/5 border border-destructive/10 rounded-2xl px-4 py-3.5 text-destructive text-xs font-bold text-center uppercase tracking-wider">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-4 px-4 rounded-2xl font-bold hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-foreground/10 text-xs uppercase tracking-[0.2em] active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar conta grátis'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Já tem uma conta?{' '}
              <a href="/login" className="text-[#DC5A5A] hover:opacity-80 font-bold transition-all decoration-[#DC5A5A]/30 decoration-2 underline-offset-4 hover:underline">
                Fazer login
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-10">
          &copy; 2026 PrimerLabs &bull; DFT
        </p>
      </div>
    </div>
  );
}
