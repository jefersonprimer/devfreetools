'use client';

import { useState } from 'react';

interface GeneratedDoc {
  type: 'CPF' | 'CNPJ' | 'LINK';
  value: string;
  formatted: string;
  originalUrl?: string;
}

export function UnifiedGenerator() {
  const [activeTab, setActiveTab] = useState<'docs' | 'links'>('docs');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDoc | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Link Shortener state
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateDoc = async (type: 'cpf' | 'cnpj') => {
    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const response = await fetch(`/api/v1/${type}/generate`);
      const data = await response.json();
      
      const item = data.data[0];
      setGenerated({
        type: type.toUpperCase() as 'CPF' | 'CNPJ',
        value: type === 'cpf' ? item.cpf : item.cnpj,
        formatted: item.formatted
      });
    } catch (error) {
      console.error('Error generating document:', error);
      setError('Falha ao gerar documento');
    } finally {
      setLoading(false);
    }
  };

  const shortenLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setCopied(false);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGenerated({
          type: 'LINK',
          value: data.data.shortUrl,
          formatted: data.data.shortUrl,
          originalUrl: data.data.originalUrl
        });
        setUrl('');
      } else {
        setError(data.error === 'Unauthorized' ? 'Faça login para encurtar links' : data.error);
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex p-1 bg-muted rounded-2xl mb-6 w-fit mx-auto sm:mx-0">
        <button
          onClick={() => { setActiveTab('docs'); setGenerated(null); setError(null); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'docs' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Documentos
        </button>
        <button
          onClick={() => { setActiveTab('links'); setGenerated(null); setError(null); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'links' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Encurtador
        </button>
      </div>

      <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
        {activeTab === 'docs' ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground">Gerador de Documentos</h3>
              <p className="text-muted-foreground text-sm">Gere CPF ou CNPJ válidos para testes.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateDoc('cpf')}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-500/20 transition-all border border-purple-500/20"
              >
                Gerar CPF
              </button>
              <button
                onClick={() => generateDoc('cnpj')}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20"
              >
                Gerar CNPJ
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="text-center md:text-left mb-6">
              <h3 className="text-xl font-bold text-foreground">Encurtador de Links</h3>
              <p className="text-muted-foreground text-sm">Transforme URLs longas em links curtos e rastreáveis.</p>
            </div>
            <form onSubmit={shortenLink} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole sua URL longa aqui..."
                className="flex-1 px-5 py-3 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-foreground"
                required
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-8 py-3 bg-foreground text-background font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Encurtar'}
              </button>
            </form>
            {error && (
              <p className="text-destructive text-xs mt-3 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
                {error.includes('login') && (
                  <a href="/login" className="underline hover:text-destructive/80">Entrar agora</a>
                )}
              </p>
            )}
          </div>
        )}

        {loading && activeTab === 'docs' ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Processando...</span>
            </div>
          </div>
        ) : generated ? (
          <div className="bg-muted/30 rounded-2xl p-6 border border-border animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block ${
                  generated.type === 'CPF' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 
                  generated.type === 'CNPJ' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                  'bg-green-500/10 text-green-600 dark:text-green-400'
                }`}>
                  {generated.type === 'LINK' ? 'Link Curto Gerado' : `${generated.type} Válido`}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground tracking-tighter truncate">
                  {generated.formatted}
                </div>
                {generated.originalUrl && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[250px]">
                    Para: {generated.originalUrl}
                  </p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                {generated.type !== 'LINK' && (
                  <button
                    onClick={() => generateDoc(generated.type.toLowerCase() as 'cpf' | 'cnpj')}
                    className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-foreground hover:border-primary transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground/30">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="font-medium text-sm">Aguardando sua ação...</p>
          </div>
        )}
      </div>
    </div>
  );
}
