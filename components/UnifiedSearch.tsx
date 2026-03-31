'use client';

import { useState, useEffect } from 'react';

interface Partner {
  name: string;
  role: string;
  entryDate: string | null;
  ageRange: string;
  country: string;
}

interface CnpjData {
  cnpj: string;
  cnpjFormatted: string;
  name: string;
  tradeName?: string | null;
  status: string;
  foundedAt?: string | null;
  mainActivity: string;
  mainActivityCode?: string | null;
  legalNature?: string | null;
  capitalSocial?: string | null;
  companySize?: string | null;
  address: {
    street: string;
    complement?: string | null;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact?: {
    phones: string[];
    email: string | null;
  };
  partners?: Partner[];
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

  const formatCep = (cep: string) => {
    if (!cep || cep.length !== 8) return cep;
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl md:text-2xl font-bold leading-tight break-words">{result.data.name}</h3>
                    {result.data.tradeName && (
                      <p className="text-blue-200 text-sm mt-1">
                        <span className="text-blue-300 text-xs font-semibold uppercase">Nome Fantasia:</span> {result.data.tradeName}
                      </p>
                    )}
                    <p className="text-blue-100 font-mono tracking-wider mt-2">{result.data.cnpjFormatted}</p>
                  </div>
                  <div className={`self-start shrink-0 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 ${
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
                  {/* Dados da Empresa */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Dados da Empresa
                      </h4>
                      <div className="space-y-4">
                        <div className="group">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Atividade Principal</span>
                          <p className="text-gray-900 font-semibold text-sm mt-0.5">
                            {result.data.mainActivityCode && (
                              <span className="text-blue-600 font-mono text-xs mr-2 bg-blue-50 px-1.5 py-0.5 rounded">{result.data.mainActivityCode}</span>
                            )}
                            {result.data.mainActivity}
                          </p>
                        </div>
                        {result.data.foundedAt && (
                          <div className="group">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Abertura</span>
                            <p className="text-gray-900 font-semibold text-sm mt-0.5">{formatDate(result.data.foundedAt)}</p>
                          </div>
                        )}
                        {result.data.legalNature && (
                          <div className="group">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Natureza Jurídica</span>
                            <p className="text-gray-900 font-semibold text-sm mt-0.5">{result.data.legalNature}</p>
                          </div>
                        )}
                        <div className="flex gap-4">
                          {result.data.capitalSocial && (
                            <div className="group flex-1">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capital Social</span>
                              <p className="text-gray-900 font-semibold text-sm mt-0.5">{formatCurrency(result.data.capitalSocial)}</p>
                            </div>
                          )}
                          {result.data.companySize && (
                            <div className="group flex-1">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Porte</span>
                              <p className="text-gray-900 font-semibold text-sm mt-0.5">{result.data.companySize}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Localização e Contato */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Localização
                      </h4>
                      <div className="space-y-2">
                        {result.data.address.street && (
                          <p className="text-gray-900 font-semibold text-sm">{result.data.address.street}</p>
                        )}
                        {result.data.address.complement && (
                          <p className="text-gray-600 text-sm">{result.data.address.complement}</p>
                        )}
                        {result.data.address.neighborhood && (
                          <p className="text-gray-600 text-sm">{result.data.address.neighborhood}</p>
                        )}
                        <p className="text-gray-900 font-semibold text-sm">
                          {result.data.address.city}{result.data.address.state ? ` - ${result.data.address.state}` : ''}
                        </p>
                        {result.data.address.zipCode && (
                          <p className="text-gray-500 text-sm font-mono">CEP: {formatCep(result.data.address.zipCode)}</p>
                        )}
                      </div>
                    </div>

                    {/* Contato */}
                    {result.data.contact && (result.data.contact.phones.length > 0 || result.data.contact.email) && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Contato
                        </h4>
                        <div className="space-y-2">
                          {result.data.contact.phones.map((phone, i) => (
                            <p key={i} className="text-gray-900 font-semibold text-sm flex items-center">
                              <span className="text-gray-400 text-xs mr-2">📞</span> {phone}
                            </p>
                          ))}
                          {result.data.contact.email && (
                            <p className="text-gray-900 font-semibold text-sm flex items-center">
                              <span className="text-gray-400 text-xs mr-2">✉️</span>
                              <a href={`mailto:${result.data.contact.email}`} className="text-blue-600 hover:underline">
                                {result.data.contact.email}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sócios */}
                {result.data.partners && result.data.partners.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Quadro Societário ({result.data.partners.length})
                    </h4>
                    <div className="space-y-3">
                      {result.data.partners.map((partner, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{partner.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-900 font-semibold text-sm truncate">{partner.name}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {partner.role && (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{partner.role.trim()}</span>
                              )}
                              {partner.entryDate && (
                                <span className="text-xs text-gray-400">Desde {formatDate(partner.entryDate)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata footer */}
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
