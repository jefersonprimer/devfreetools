'use client';

import { useState } from 'react';

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
  rawData?: any;
}

interface ApiResponse {
  data: CnpjData;
  metadata: {
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

export function CnpjSearch() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCnpjInput = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');

    // Limita a 14 dígitos
    const limited = digits.slice(0, 14);

    // Aplica máscara
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpjInput(e.target.value);
    setCnpj(formatted);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cnpj) {
      setError('Digite um CNPJ');
      return;
    }

    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      setError('CNPJ deve ter 14 dígitos');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/cnpj/${cleanCnpj}`);
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={cnpj}
              onChange={handleInputChange}
              placeholder="Digite o CNPJ (ex: 11.222.333/0001-81)"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Consultar
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{result.data.name}</h3>
                <p className="text-green-100">{result.data.cnpjFormatted}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  result.data.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.data.status === 'active' ? 'Ativa' : 'Inativa'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">CNPJ:</span>
                    <p className="text-gray-900 font-mono">{result.data.cnpjFormatted}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Razão Social:</span>
                    <p className="text-gray-900">{result.data.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Atividade Principal:</span>
                    <p className="text-gray-900">{result.data.mainActivity}</p>
                  </div>
                  {result.data.foundedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Data de Abertura:</span>
                      <p className="text-gray-900">
                        {new Date(result.data.foundedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Logradouro:</span>
                    <p className="text-gray-900">{result.data.address.street}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Cidade:</span>
                    <p className="text-gray-900">{result.data.address.city} - {result.data.address.state}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">CEP:</span>
                    <p className="text-gray-900 font-mono">{result.data.address.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Consultada em {new Date(result.metadata.consultedAt).toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center">
                  {result.metadata.cacheHit ? (
                    <>
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cache hit
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Consulta em tempo real
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Uso: {result.metadata.usage.current}/{result.metadata.usage.limit} ({result.metadata.usage.percentageUsed.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo CNPJs */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Experimente com estes CNPJs de teste:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setCnpj('11222333000181')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            11.222.333/0001-81
          </button>
          <button
            onClick={() => setCnpj('11444777000161')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            11.444.777/0001-61
          </button>
          <button
            onClick={() => setCnpj('12345678000195')}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
          >
            Inválido (teste)
          </button>
        </div>
      </div>
    </div>
  );
}