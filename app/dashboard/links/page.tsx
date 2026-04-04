'use client';

import { useEffect, useState } from 'react';
import { Link as LinkIcon, Plus, Copy, Check, Trash2, ExternalLink, MousePointer2, Calendar, AlertCircle, Info, BarChart3 } from 'lucide-react';

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
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Links Curtos</h1>
          <p className="text-sm text-muted-foreground">Transforme URLs longas em links gerenciáveis.</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Novo Link
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-2xl border border-border/50 bg-foreground/[0.02] p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Encurtar nova URL</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    URL Original
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://sua-url-longa.com/path/to/resource"
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Expiração (Dias)
                  </label>
                  <input
                    type="number"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating || !url.trim()}
                  className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm hover:bg-foreground/90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {creating ? 'Processando...' : 'Encurtar URL'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setError(null); }}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-foreground/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 mb-6">
          Seus Links Ativos
        </p>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border/50 bg-foreground/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
              <LinkIcon className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum link encurtado encontrado.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Criar meu primeiro link →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-foreground/[0.01] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-foreground/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Link Curto</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">URL Original</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Cliques</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {links.map((link) => {
                    const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                    return (
                      <tr key={link.id} className="group hover:bg-foreground/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <code className="text-primary font-mono text-sm font-semibold tracking-tight">/l/{link.code}</code>
                            <button
                              onClick={() => copyToClipboard(link.code, link.id)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                              title="Copiar link"
                            >
                              {copiedId === link.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 max-w-xs">
                          <p className="text-muted-foreground text-xs truncate font-medium" title={link.originalUrl}>
                            {link.originalUrl}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-foreground/5 px-2.5 py-1 rounded-full">
                            <MousePointer2 className="w-3 h-3 opacity-50" />
                            {link.clicks}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full w-fit">
                                Expirado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                                Ativo
                              </span>
                            )}
                            {link.expiresAt && (
                              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`${baseUrl}/l/${link.code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all opacity-0 group-hover:opacity-100"
                              title="Abrir link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="rounded-2xl border border-border/50 p-6 flex items-start gap-4 hover:border-border transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Links Públicos</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Todos os links encurtados são públicos por padrão. Certifique-se de não encurtar URLs que contenham informações sensíveis ou tokens de acesso.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 p-6 flex items-start gap-4 hover:border-border transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Métricas de Acesso</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Acompanhamos o número de cliques em tempo real. Em breve, você terá acesso a estatísticas detalhadas como origem geográfica e dispositivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
