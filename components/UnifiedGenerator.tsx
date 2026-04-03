'use client';

import { useState } from 'react';
import {
  Copy,
  RefreshCcw,
  Check,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';

interface GeneratedDoc {
  type: 'CPF' | 'CNPJ' | 'CERTIDAO_NASCIMENTO' | 'CNS' | 'LINK' | 'ADDRESS';
  display?: 'text' | 'json' | 'compact';
  value: string;
  formatted: string;
  originalUrl?: string;
  cnsType?: string;
  hasCpf?: boolean;
  cpf?: string;
  cpfFormatted?: string;
  cnsGenerateType?: 'auto' | 'definitivo' | 'provisorio';
  certidaoData?: any;
  addressData?: any[];
}

type ToolType = 'link' | 'cpf' | 'cnpj' | 'cns' | 'certidao-nascimento' | 'cep-endereco' | 'base64';

export function UnifiedGenerator() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('cpf');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDoc | null>(null);
  const [copied, setCopied] = useState(false);
  const [certidaoFormat, setCertidaoFormat] = useState<'text' | 'json' | 'compact'>('text');
  const [cnsType, setCnsType] = useState<'definitivo' | 'provisorio' | 'auto'>('definitivo');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addressUf, setAddressUf] = useState('');
  const [addressCidade, setAddressCidade] = useState('');
  const [addressCount, setAddressCount] = useState(1);
  const [addressSeed, setAddressSeed] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode' | 'auto'>('encode');
  const [base64Variant, setBase64Variant] = useState<'standard' | 'base64url'>('standard');

  const tools = [
    { id: 'cpf', label: 'Gerador de CPF' },
    { id: 'cnpj', label: 'Gerador de CNPJ' },
    { id: 'cns', label: 'Gerador de CNS' },
    { id: 'cep-endereco', label: 'Gerador de Endereço (CEP)' },
    { id: 'certidao-nascimento', label: 'Certidão de Nascimento' },
    { id: 'base64', label: 'Base64 Encode/Decode' },
    { id: 'link', label: 'Encurtador de Links' },
  ] as const;

  const handleAction = () => {
    if (selectedTool === 'link') {
      shortenLink();
    } else if (selectedTool === 'cns') {
      generateCnsDoc(cnsType);
    } else if (selectedTool === 'cep-endereco') {
      generateAddressDoc();
    } else if (selectedTool === 'base64') {
      processBase64();
    } else {
      generateDoc(selectedTool, selectedTool === 'certidao-nascimento' ? certidaoFormat : undefined);
    }
  };

  const generateDoc = async (
    type: 'cpf' | 'cnpj' | 'certidao-nascimento',
    format?: 'text' | 'json' | 'compact'
  ) => {
    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const response = await fetch(
        type === 'certidao-nascimento'
          ? `/api/v1/certidao-nascimento/generate?format=${encodeURIComponent(format || 'text')}`
          : `/api/v1/${type}/generate`
      );
      const data = await response.json();
      const item = data.data[0];

      if (type === 'certidao-nascimento') {
        if (format === 'json') {
          setGenerated({
            type: 'CERTIDAO_NASCIMENTO',
            display: 'json',
            value: JSON.stringify(item, null, 2),
            formatted: item.formatted || item.value || JSON.stringify(item, null, 2),
          });
        } else if (format === 'compact') {
          const value = `NUMERO: ${item.numeroCertidao}\nCODIGO: ${item.codigoCertidao}`;
          setGenerated({ type: 'CERTIDAO_NASCIMENTO', display: 'compact', value, formatted: value });
        } else {
          setGenerated({
            type: 'CERTIDAO_NASCIMENTO',
            display: 'text',
            value: item.value,
            formatted: item.formatted,
            certidaoData: item
          });
        }
        return;
      }

      setGenerated({
        type: type === 'cpf' ? 'CPF' : 'CNPJ',
        display: 'text',
        value: type === 'cpf' ? item.cpf : item.cnpj,
        formatted: item.formatted,
      });
    } catch (error) {
      setError('Falha ao gerar documento');
    } finally {
      setLoading(false);
    }
  };

  const generateAddressDoc = async () => {
    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('count', String(Math.max(1, Math.min(addressCount, 50))));
      if (addressUf.trim()) {
        params.set('uf', addressUf.trim().toUpperCase());
      }
      if (addressCidade.trim()) {
        params.set('cidade', addressCidade.trim());
      }
      if (addressSeed.trim()) {
        params.set('seed', addressSeed.trim());
      }

      const response = await fetch(`/api/v1/generate/address?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || data.error || 'Falha ao gerar enderecos');
        return;
      }

      const items = Array.isArray(data.data) ? data.data : [];
      setGenerated({
        type: 'ADDRESS',
        display: 'json',
        value: JSON.stringify(items, null, 2),
        formatted: items[0]?.cep || 'Sem resultados',
        addressData: items,
      });

      if (data.warning) {
        setError(data.warning);
      }
    } catch (error) {
      setError('Falha ao gerar enderecos');
    } finally {
      setLoading(false);
    }
  };

  const generateCnsDoc = async (type: 'auto' | 'definitivo' | 'provisorio') => {
    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const response = await fetch(`/api/v1/cns/generate?count=1&type=${encodeURIComponent(type)}`);
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Erro'); return; }
      const item = data.data?.[0];
      setGenerated({
        type: 'CNS',
        display: 'text',
        value: item.cns,
        formatted: item.cnsFormatted || item.cns,
        cnsType: item.type,
        hasCpf: item.hasCpf,
        cpf: item.cpf,
        cpfFormatted: item.cpfFormatted,
        cnsGenerateType: type,
      });
    } catch (error) {
      setError('Falha ao gerar CNS');
    } finally {
      setLoading(false);
    }
  };

  const shortenLink = async () => {
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
        setGenerated({ type: 'LINK', value: data.data.shortUrl, formatted: data.data.shortUrl, originalUrl: data.data.originalUrl });
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

  const processBase64 = async () => {
    if (!base64Input.trim()) return;
    setLoading(true);
    setCopied(false);
    setError(null);
    try {
      const endpoint = base64Mode === 'encode' ? '/api/v1/base64/encode' : '/api/v1/base64/decode';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: base64Input,
          variant: base64Variant,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setGenerated({
          type: 'LINK',
          value: data.data.output,
          formatted: data.data.output,
        });
      } else {
        setError(data.message || data.error || 'Falha ao processar Base64');
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

  const renderCertidaoVisual = (data: any) => (
    <div className="relative bg-[#fcfcfc] border-[#e5e5e5] border-2 shadow-inner p-8 sm:p-12 text-[#1a1a1a] font-serif overflow-hidden rounded-lg">

      <div className="relative space-y-8">
        <div className="text-center space-y-2 border-b-2 border-dashed border-[#ddd] pb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.1em] uppercase">República Federativa do Brasil</h1>
          <h2 className="text-lg sm:text-xl font-medium uppercase tracking-wider text-[#444]">Registro Civil das Pessoas Naturais</h2>
          <p className="text-sm font-bold mt-4 uppercase bg-[#f0f0f0] inline-block px-4 py-1 rounded">Certidão de Nascimento</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] sm:text-xs">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Nome Registrado</label>
              <p className="text-base sm:text-lg font-bold uppercase">{data.nomeRegistrado}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Sexo</label>
                <p className="font-bold uppercase">{data.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Nascimento</label>
                <p className="font-bold uppercase">{data.dataNascimento}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Local de Nascimento</label>
              <p className="font-bold uppercase">{data.cidade} / {data.uf}</p>
            </div>
          </div>

          <div className="space-y-4 bg-[#f8f8f8] p-4 rounded-xl border border-[#eee]">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-[#999] font-sans font-bold">Livro</label>
                <p className="font-mono text-sm font-bold">{data.livro}</p>
              </div>
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-[#999] font-sans font-bold">Folha</label>
                <p className="font-mono text-sm font-bold">{data.folha}</p>
              </div>
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-[#999] font-sans font-bold">Termo</label>
                <p className="font-mono text-sm font-bold">{data.termo}</p>
              </div>
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#999] font-sans font-bold">Número da Certidão</label>
              <p className="font-mono text-sm font-bold text-blue-600">{data.numeroCertidao}</p>
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-[#999] font-sans font-bold">Data do Registro</label>
              <p className="font-bold">{data.dataRegistro}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-[#eee]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Filiação (Mãe)</label>
              <p className="font-bold uppercase">{data.mae}</p>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Filiação (Pai)</label>
              <p className="font-bold uppercase">{data.pai}</p>
            </div>
          </div>

          <div className="pt-6">
            <label className="block text-[10px] uppercase tracking-widest text-[#888] font-sans font-bold mb-1">Cartório e Oficial</label>
            <p className="text-[11px] font-medium leading-relaxed uppercase">{data.cartorio}</p>
            <p className="text-[11px] font-bold mt-1 uppercase italic">Oficial: {data.oficial}</p>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center justify-center space-y-4 opacity-40 grayscale">
          <div className="w-24 h-24 border-4 border-[#ddd] rounded-full flex items-center justify-center relative">
            <div className="absolute inset-1 border-2 border-[#eee] rounded-full" />
            <div className="text-[8px] font-bold text-center uppercase tracking-tighter px-2">Selo de<br />Autenticidade</div>
          </div>
          <p className="text-[10px] font-mono tracking-widest">{data.codigoCertidao}</p>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[9px] text-[#999] font-sans italic">
            Documento gerado automaticamente para fins de teste. Não possui valor jurídico.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto">
      <div className="bg-card shadow-2xl border border-border/50 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-muted/20 border-b md:border-b-0 md:border-r border-border/50 p-6 flex flex-col gap-1">
          <div className="mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Ferramentas</h3>
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool.id); setGenerated(null); setError(null); }}
                className={`whitespace-nowrap text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${selectedTool === tool.id
                  ? 'bg-foreground text-background shadow-lg shadow-foreground/5 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                {tool.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 sm:p-12 flex flex-col">
          <div className="flex-1 space-y-8">
            <header>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {tools.find(t => t.id === selectedTool)?.label}
              </h2>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {selectedTool === 'link'
                  ? 'Transforme URLs longas em links curtos rastreáveis.'
                  : selectedTool === 'base64'
                  ? 'Codifique e decodifique textos em Base64 com suporte a UTF-8 e base64url.'
                  : 'Gere dados sintéticos válidos para seus ambientes de desenvolvimento.'}
              </p>
            </header>

            <div className="space-y-6">
              {selectedTool === 'link' ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://sua-url-longa.com/aqui"
                      className="w-full px-6 py-4 bg-muted/30 border-2 border-transparent focus:border-foreground/10 rounded-2xl focus:outline-none transition-all text-sm font-semibold text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <button
                    onClick={handleAction}
                    disabled={loading || !url.trim()}
                    className="w-full h-14 bg-foreground text-background font-black rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCcw size={20} className="animate-spin" /> : (
                      <>
                        <span>ENCURTAR LINK AGORA</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedTool === 'certidao-nascimento' && (
                    <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl w-fit border border-border/50">
                      {(['text', 'json', 'compact'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCertidaoFormat(fmt)}
                          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${certidaoFormat === fmt ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTool === 'cns' && (
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-2xl w-fit border border-border/50">
                      {(['definitivo', 'provisorio', 'auto'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setCnsType(t)}
                          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${cnsType === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTool === 'cep-endereco' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={addressUf}
                        onChange={(e) => setAddressUf(e.target.value)}
                        placeholder="UF (ex: SP)"
                        maxLength={2}
                        className="px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 uppercase"
                      />
                      <input
                        value={addressCidade}
                        onChange={(e) => setAddressCidade(e.target.value)}
                        placeholder="Cidade (ex: Sao Paulo)"
                        className="px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
                      />
                      <input
                        type="number"
                        value={addressCount}
                        onChange={(e) => setAddressCount(Number(e.target.value || 1))}
                        placeholder="Quantidade"
                        min={1}
                        max={50}
                        className="px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
                      />
                      <input
                        value={addressSeed}
                        onChange={(e) => setAddressSeed(e.target.value)}
                        placeholder="Seed opcional"
                        className="px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
                      />
                    </div>
                  )}

                  {selectedTool === 'base64' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-2xl border border-border/50">
                          {(['encode', 'decode', 'auto'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setBase64Mode(m)}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${base64Mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              {m === 'encode' ? 'CODIFICAR' : m === 'decode' ? 'DECODIFICAR' : 'AUTO'}
                            </button>
                          ))}
                        </div>
                        {base64Mode !== 'auto' && (
                          <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-2xl border border-border/50">
                            <button
                              onClick={() => setBase64Variant('standard')}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${base64Variant === 'standard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              STANDARD
                            </button>
                            <button
                              onClick={() => setBase64Variant('base64url')}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${base64Variant === 'base64url' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              BASE64URL
                            </button>
                          </div>
                        )}
                      </div>
                      <textarea
                        value={base64Input}
                        onChange={(e) => setBase64Input(e.target.value)}
                        placeholder={base64Mode === 'encode' ? 'Digite o texto para codificar...' : base64Mode === 'decode' ? 'Cole o Base64 para decodificar...' : 'Digite texto ou Base64 para converter...'}
                        rows={6}
                        className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAction}
                    disabled={loading || (selectedTool === 'base64' && !base64Input.trim())}
                    className="w-full h-14 bg-foreground text-background font-black rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCcw size={20} className="animate-spin" /> : (
                      <>
                        <span>{selectedTool === 'base64' ? (base64Mode === 'encode' ? 'CODIFICAR' : base64Mode === 'decode' ? 'DECODIFICAR' : 'PROCESSAR') : 'GERAR DADOS'}</span>
                        {selectedTool === 'base64' && <ArrowLeftRight size={18} />}
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl text-destructive text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </div>
              )}
            </div>

            {/* Result Section */}
            <div className="pt-8 border-t border-border/50">
              {generated ? (
                <div className="bg-muted/40 rounded-md p-6 sm:p-8 border border-border/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-foreground/5 px-3 py-1 rounded-full">
                      Resultado Gerado
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedTool !== 'link' && selectedTool !== 'base64' && (
                        <button
                          onClick={handleAction}
                          disabled={loading}
                          className="h-10 w-10 flex items-center justify-center bg-card border border-border/50 text-muted-foreground rounded-xl hover:text-foreground hover:border-foreground/20 transition-all disabled:opacity-50"
                          title="Gerar outro"
                        >
                          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                      )}
                      <button
                        onClick={copyToClipboard}
                        className={`h-10 px-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${copied
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-foreground text-background hover:scale-105 active:scale-95 shadow-lg shadow-foreground/10'
                          }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span className="text-[10px] uppercase tracking-widest">{copied ? 'COPIADO' : 'COPIAR'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generated.type === 'CERTIDAO_NASCIMENTO' && generated.display === 'text' && generated.certidaoData ? (
                      renderCertidaoVisual(generated.certidaoData)
                    ) : generated.display === 'json' ? (
                      <pre className="text-xs font-mono font-bold text-foreground bg-card/50 p-6 rounded-2xl border border-border/50 whitespace-pre-wrap break-all overflow-x-auto max-h-[300px] scrollbar-hide">
                        {generated.value}
                      </pre>
                    ) : (
                      <div className="text-2xl sm:text-4xl font-mono font-black text-foreground tracking-tighter break-all">
                        {generated.formatted}
                      </div>
                    )}

                    {generated.originalUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">ORIGEM:</span>
                        <p className="text-[10px] font-medium truncate max-w-sm">
                          {generated.originalUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 border-2 border-dashed border-border/50 rounded-[2rem] flex flex-col items-center justify-center text-muted-foreground/20">

                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aguardando ação...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
