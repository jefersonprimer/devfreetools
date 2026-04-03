'use client';

import { useEffect, useState } from 'react';

type ShortLink = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
};

export default function LinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  async function fetchLinks() {
    try {
      const res = await fetch('/api/v1/links');
      const data = await res.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          expiresInDays: expiresInDays > 0 ? expiresInDays : undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUrl('');
        setShowCreateForm(false);
        fetchLinks();
      } else {
        setError(data.error || 'Falha ao criar link');
      }
    } catch (error) {
      setError('Erro de conexão');
      console.error('Error creating link:', error);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;

    try {
      await fetch(`/api/v1/links/${id}`, { method: 'DELETE' });
      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  }

  function copyToClipboard(code: string, id: string) {
    const shortUrl = `${baseUrl}/l/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 overflow-hidden lg:overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Encurtador de Links</h1>
          <p className="text-gray-400 mt-1">Crie e gerencie seus links curtos personalizados.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Link
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-white font-bold text-sm mb-4">Encurtar nova URL</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  URL Original
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://sua-url-longa.com/alguma-coisa"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Expira em (dias)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                  placeholder="30"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating || !url.trim()}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Processando...' : 'Encurtar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setError(null); }}
                className="text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {links.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Nenhum link encurtado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Link Curto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">URL Original</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Cliques</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {links.map((link) => {
                  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                  return (
                    <tr key={link.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-blue-400 font-mono text-sm">/l/{link.code}</code>
                          <button
                            onClick={() => copyToClipboard(link.code, link.id)}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Copiar URL completa"
                          >
                            {copiedId === link.id ? (
                              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-400 text-sm truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold text-sm bg-white/[0.04] px-3 py-1 rounded-full">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            Expirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            Ativo
                          </span>
                        )}
                        {link.expiresAt && !isExpired && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            Expira em {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Links Públicos</h4>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Todos os links curtos são públicos. Qualquer pessoa com o link poderá ser redirecionada. O controle de acesso é apenas para quem cria/gerencia.
            </p>
          </div>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Estatísticas em Tempo Real</h4>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              O contador de cliques é atualizado instantaneamente cada vez que alguém acessa seu link curto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
