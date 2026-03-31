'use client';

import { useState, useEffect } from 'react';

interface CnpjData {
  cnpj: string;
  cnpjFormatted: string;
  name: string;
  status: string;
  foundedAt?: string;
  mainActivity: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface CpfData {
  cpf: string;
  cpfFormatted: string;
  isValid: boolean;
  isSmartValid: boolean;
  message: string;
}

interface ApiResponse {
  data: CnpjData | CpfData;
  metadata?: {
    cacheHit: boolean;
    consultedAt: string;
    usage: {
      current: number;
      limit: number;
      remaining: number;
      percentageUsed: number;
    };
  };
}

export function UnifiedSearch() {
  const [inputValue, setInputValue] = useState('');
  const [docType, setDocType] = useState<'CPF' | 'CNPJ' | 'UNKNOWN'>('UNKNOWN');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanValue = (val: string) => val.replace(/\D/g, '');

  const formatInput = (value: string) => {
    const digits = cleanValue(value);
    
    if (digits.length <= 11) {
      // CPF format: 000.000.000-00
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    } else {
      // CNPJ format: 00.000.000/0001-00
      const limited = digits.slice(0, 14);
      if (limited.length <= 2) return limited;
      if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
      if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
      if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
      return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
    }
  };

  useEffect(() => {
    const digits = cleanValue(inputValue);
    if (digits.length === 11) {
      setDocType('CPF');
    } else if (digits.length === 14) {
      setDocType('CNPJ');
    } else {
      setDocType('UNKNOWN');
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setInputValue(formatted);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanValue(inputValue);

    if (!digits) {
      setError('Digite um CPF ou CNPJ');
      return;
    }

    if (digits.length !== 11 && digits.length !== 14) {
      setError('Documento inválido. Digite 11 dígitos para CPF ou 14 para CNPJ.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const type = digits.length === 11 ? 'cpf' : 'cnpj';

    try {
      const response = await fetch(`/api/v1/${type}/${digits}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Erro na consulta');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isCnpjData = (data: any): data is CnpjData => 'cnpj' in data;
  const isCpfData = (data: any): data is CpfData => 'cpf' in data;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {docType === 'CNPJ' ? (
              <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">CNPJ</span>
            ) : docType === 'CPF' ? (
              <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded">CPF</span>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Digite CPF ou CNPJ para consultar"
            className="w-full pl-16 pr-32 py-5 text-lg border-2 border-gray-100 rounded-2xl shadow-sm focus:border-blue-500 text-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Consultar'
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {isCnpjData(result.data) && result.metadata ? (
            /* CNPJ Result Card */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{result.data.name}</h3>
                    <p className="text-blue-100 font-mono tracking-wider">{result.data.cnpjFormatted}</p>
                  </div>
                  <div className={`self-start md:self-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 ${
                    result.data.status === 'active'
                      ? 'bg-green-500/20 border-green-400 text-white'
                      : 'bg-red-500/20 border-red-400 text-white'
                  }`}>
                    {result.data.status === 'active' ? '● Ativa' : '○ Inativa'}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dados da Empresa</h4>
                      <div className="space-y-4">
                        <div className="group">
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Razão Social</span>
                          <p className="text-gray-900 font-semibold">{result.data.name}</p>
                        </div>
                        <div className="group">
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Atividade Principal</span>
                          <p className="text-gray-900 font-semibold">{result.data.mainActivity}</p>
                        </div>
                        {result.data.foundedAt && (
                          <div className="group">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Data de Abertura</span>
                            <p className="text-gray-900 font-semibold">
                              {new Date(result.data.foundedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Localização</h4>
                      <div className="space-y-4">
                        <div className="group">
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Endereço Completo</span>
                          <p className="text-gray-900 font-semibold leading-relaxed">
                            {result.data.address.street}<br />
                            {result.data.address.city} - {result.data.address.state}<br />
                            CEP: {result.data.address.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Consultada às {new Date(result.metadata.consultedAt).toLocaleTimeString('pt-BR')}
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    {result.metadata.cacheHit ? (
                      <span className="text-green-600 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Dados em Cache
                      </span>
                    ) : (
                      <span className="text-blue-600 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Tempo Real
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isCpfData(result.data) ? (
            /* CPF Result Card */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className={`px-8 py-6 text-white ${result.data.isValid ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-red-600'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Validação de CPF</h3>
                    <p className="text-purple-100 font-mono tracking-wider">{result.data.cpfFormatted}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    {result.data.isValid ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`mt-1 p-2 rounded-lg ${result.data.isSmartValid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {result.data.isSmartValid ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{result.data.isValid ? 'CPF Válido' : 'CPF Inválido'}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{result.data.message}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Algoritmo</span>
                      <span className="text-green-600 font-bold text-sm">✓ Verificado</span>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Heurística</span>
                      <span className={`${result.data.isSmartValid ? 'text-green-600' : 'text-yellow-600'} font-bold text-sm`}>
                        {result.data.isSmartValid ? '✓ Confiável' : '⚠ Suspeito'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Demo Docs */}
      <div className="mt-12 text-center">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Exemplos Rápidos</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setInputValue(formatInput('11222333000181'))}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all hover:shadow-sm"
          >
            CNPJ Exemplo
          </button>
          <button
            onClick={() => setInputValue(formatInput('11444777000161'))}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all hover:shadow-sm"
          >
            Empresa Teste
          </button>
          <button
            onClick={() => setInputValue(formatInput('12345678909'))}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all hover:shadow-sm"
          >
            CPF Exemplo
          </button>
        </div>
      </div>
    </div>
  );
}
