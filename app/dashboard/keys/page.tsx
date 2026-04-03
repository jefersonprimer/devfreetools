'use client';

import { useEffect, useState } from 'react';

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
        <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 overflow-hidden lg:overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">API Keys</h1>
          <p className="text-gray-400 mt-1">Gerencie suas chaves de acesso à API.</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(true); setNewlyCreatedKey(null); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Key
        </button>
      </div>

      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-green-400 font-bold text-sm">API Key criada com sucesso!</p>
              <p className="text-gray-400 text-xs mt-1 mb-3">
                Copie sua key agora — ela não será exibida novamente.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg px-4 py-2.5 text-green-300 font-mono text-sm break-all">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="shrink-0 bg-green-500/20 text-green-400 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-green-500/30 transition-colors cursor-pointer"
                >
                  {copiedId === 'new' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-white font-bold text-sm mb-4">Criar nova API Key</h3>
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Nome da Key
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ex: Produção, Testes, Cliente X..."
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creating ? 'Criando...' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setNewKeyName(''); }}
              className="text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Keys list */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Nenhuma API key criada ainda</p>
            <p className="text-gray-600 text-sm mt-1">Crie sua primeira key para começar a usar a API</p>
          </div>
        ) : (
          keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className={`bg-white/[0.03] border rounded-2xl p-5 transition-all hover:border-white/[0.1] ${
                apiKey.isActive ? 'border-white/[0.06]' : 'border-red-500/10 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    apiKey.isActive ? 'bg-blue-500/10' : 'bg-red-500/10'
                  }`}>
                    <svg className={`w-5 h-5 ${apiKey.isActive ? 'text-blue-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">{apiKey.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        apiKey.isActive
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {apiKey.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <code className="text-gray-500 text-xs font-mono">{apiKey.key}</code>
                      <span className="text-gray-600 text-xs">
                        Criada em {new Date(apiKey.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {apiKey.lastUsedAt && (
                        <span className="text-gray-600 text-xs">
                          · Último uso {new Date(apiKey.lastUsedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(apiKey.id, apiKey.isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      apiKey.isActive ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                    title={apiKey.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      apiKey.isActive ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(apiKey.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-400 font-semibold text-sm">Dica de segurança</p>
            <p className="text-gray-400 text-sm mt-1">
              Suas API keys são mostradas de forma mascarada após a criação. Copie e guarde cada key em um lugar seguro no momento da criação, pois não será possível visualizá-la novamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
