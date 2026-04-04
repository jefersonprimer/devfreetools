'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const limit = planLimits[data.user.plan] || 100;
  const usagePercent = Math.min((data.usage.totalRequests / limit) * 100, 100);
  const memberSince = new Date(data.user.createdAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-8 overflow-hidden lg:overflow-visible">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Olá, {data.user.name}
        </h1>
        <p className="text-gray-400 mt-1">Aqui está o resumo da sua conta.</p>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Plan Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plano</span>
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white capitalize">{data.user.plan}</p>
          <p className="text-gray-500 text-sm mt-1">Membro desde {memberSince}</p>
        </div>

        {/* Usage Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Uso Mensal</span>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {data.usage.totalRequests.toLocaleString('pt-BR')}
            <span className="text-gray-500 text-base font-normal"> / {limit.toLocaleString('pt-BR')}</span>
          </p>
          <div className="mt-3 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">{usagePercent.toFixed(1)}% utilizado</p>
        </div>

        {/* API Keys Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">API Keys</span>
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{data.totalKeys}</p>
          <p className="text-gray-500 text-sm mt-1">
            <a href="/dashboard/keys" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Gerenciar keys →
            </a>
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">Quick Start</h2>
        <p className="text-gray-400 text-sm mb-4">Use sua API key para fazer consultas:</p>
        <div className="bg-black/40 rounded-xl p-4 overflow-x-auto border border-white/[0.04]">
          <pre className="text-sm font-mono">
            <code>
              <span className="text-blue-400">curl</span>
              <span className="text-gray-300"> -H </span>
              <span className="text-green-400">&quot;Authorization: Bearer SUA_API_KEY&quot;</span>
              <span className="text-gray-300"> \{'\n'}</span>
              <span className="text-gray-300">{'  '}https://primerapi.com/api/cnpj/11222333000181</span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
