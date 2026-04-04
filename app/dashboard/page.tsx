'use client';

import { useEffect, useState } from 'react';
import { Activity, CreditCard, Key, ArrowUpRight, Copy, Check } from 'lucide-react';

type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
    createdAt: string;
  };
  usage: {
    month: string;
    totalRequests: number;
  };
  totalKeys: number;
};

const planLimits: Record<string, number> = {
  free: 100,
  basic: 5000,
  pro: 50000,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const limit = planLimits[data.user.plan] || 100;
  const usagePercent = Math.min((data.usage.totalRequests / limit) * 100, 100);
  
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, {data.user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas chaves, acompanhe o uso e explore a API.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-foreground/[0.02] p-6 transition-all hover:bg-foreground/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Uso Mensal</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{data.usage.totalRequests.toLocaleString('pt-BR')}</span>
            <span className="text-sm text-muted-foreground">/ {limit.toLocaleString('pt-BR')}</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Plan Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-foreground/[0.02] p-6 transition-all hover:bg-foreground/[0.04]">
          <div className="flex items-center gap-2.5 mb-4">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Plano Atual</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold tracking-tight capitalize">{data.user.plan}</span>
            <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-medium">
            Renova em 1º de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
          </p>
        </div>

        {/* API Keys Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-foreground/[0.02] p-6 transition-all hover:bg-foreground/[0.04]">
          <div className="flex items-center gap-2.5 mb-4">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Chaves Ativas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold tracking-tight">{data.totalKeys}</span>
            <a href="/dashboard/keys" className="text-xs font-bold text-primary hover:underline underline-offset-4">
              GERENCIAR
            </a>
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-medium">
            Sempre mantenha suas chaves seguras.
          </p>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="rounded-2xl border border-border/50 bg-foreground/[0.01] overflow-hidden">
        <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between bg-foreground/[0.01]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
            </div>
            <span className="text-xs font-medium text-muted-foreground ml-2">Quick Start - Consulta CNPJ</span>
          </div>
          <button 
            onClick={() => copyToClipboard('curl -H "Authorization: Bearer SUA_API_KEY" https://primerapi.com/api/v1/cnpj/11222333000181')}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto bg-black/5 dark:bg-black/40">
          <div className="flex gap-4">
            <span className="text-muted-foreground/30 select-none">1</span>
            <p className="text-foreground">
              <span className="text-primary/80">curl</span> -H <span className="text-emerald-500/80">&quot;Authorization: Bearer SUA_API_KEY&quot;</span> \
            </p>
          </div>
          <div className="flex gap-4">
            <span className="text-muted-foreground/30 select-none">2</span>
            <p className="text-foreground">
              {"  "}https://primerapi.com/api/v1/cnpj/11222333000181
            </p>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/50 p-6 flex items-start gap-4 hover:border-border transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Documentação da API</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Explore todos os endpoints disponíveis, limites de taxa e exemplos de integração em nossa documentação completa.
            </p>
            <a href="/docs" className="inline-block mt-3 text-xs font-bold text-primary hover:underline underline-offset-4">
              LER DOCS →
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 p-6 flex items-start gap-4 hover:border-border transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Segurança das Chaves</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Nunca compartilhe suas chaves de API. Se você suspeitar que uma chave foi comprometida, revogue-a imediatamente.
            </p>
            <a href="/dashboard/keys" className="inline-block mt-3 text-xs font-bold text-primary hover:underline underline-offset-4">
              VER SEGURANÇA →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
