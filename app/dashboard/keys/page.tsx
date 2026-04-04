'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, Power, AlertCircle, ShieldCheck, Clock, ShieldAlert, Activity } from 'lucide-react';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchKeys() {
    try {
      const res = await fetch('/api/v1/keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewlyCreatedKey(data.key.key);
        setNewKeyName('');
        setShowCreateForm(false);
        fetchKeys();
      }
    } catch (error) {
      console.error('Error creating key:', error);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    try {
      await fetch(`/api/v1/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchKeys();
    } catch (error) {
      console.error('Error toggling key:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta API key? Esta ação não pode ser desfeita.')) return;

    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
      fetchKeys();
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  }

  function copyToClipboard(text: string, id?: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id || 'new');
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas chaves de acesso e permissões.</p>
        </div>
        {!showCreateForm && !newlyCreatedKey && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nova Chave
          </button>
        )}
      </div>

      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Chave Gerada</h3>
                <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Copie sua chave agora. Por segurança, ela não será exibida novamente.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/5 dark:bg-black/40 border border-border/50 rounded-lg px-4 py-3 text-foreground font-mono text-xs break-all leading-relaxed">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="shrink-0 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-lg font-bold text-xs hover:bg-emerald-600 transition-all active:scale-[0.98]"
                >
                  {copiedId === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'new' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-2xl border border-border/50 bg-foreground/[0.02] p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-md">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Criar nova API Key</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Nome Identificador
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Produção, Mobile App..."
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating || !newKeyName.trim()}
                  className="flex-1 bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm hover:bg-foreground/90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {creating ? 'Gerando...' : 'Gerar Chave'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setNewKeyName(''); }}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-foreground/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 mb-6">
          Suas Chaves Ativas
        </p>
        
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border/50 bg-foreground/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhuma chave de API encontrada.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Criar minha primeira chave →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`group relative rounded-2xl border border-border/50 bg-foreground/[0.01] p-5 transition-all hover:bg-foreground/[0.02] hover:border-border ${
                  !apiKey.isActive && 'opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      apiKey.isActive ? 'bg-primary/5' : 'bg-foreground/5'
                    }`}>
                      <Key className={`w-5 h-5 ${apiKey.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-sm tracking-tight truncate">{apiKey.name}</p>
                        {!apiKey.isActive && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                            Inativa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono text-muted-foreground bg-foreground/[0.03] px-2 py-0.5 rounded uppercase tracking-tighter">
                            {apiKey.key}
                          </code>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                          <Clock className="w-3 h-3" />
                          <span>Criada em {new Date(apiKey.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {apiKey.lastUsedAt && (
                          <div className="flex items-center gap-1.5 text-[11px] text-primary/70">
                            <Activity className="w-3 h-3" />
                            <span>Visto {new Date(apiKey.lastUsedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggle(apiKey.id, apiKey.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        apiKey.isActive 
                          ? 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10' 
                          : 'text-primary hover:bg-primary/10'
                      }`}
                      title={apiKey.isActive ? 'Desativar' : 'Ativar'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Info Card */}
      <div className="rounded-3xl border border-border/50 bg-foreground/[0.01] p-8 mt-12 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 duration-500">
          <ShieldAlert className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex gap-6 items-start max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Protocolo de Segurança</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Suas chaves de API funcionam como sua identidade. Nunca as exponha no front-end ou em repositórios públicos. 
              Em caso de exposição, revogue e gere uma nova chave imediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
