'use client';

import { useState } from 'react';

interface GeneratedDoc {
  type: 'CPF' | 'CNPJ';
  value: string;
  formatted: string;
}

export function UnifiedGenerator() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDoc | null>(null);
  const [copied, setCopied] = useState(false);

  const generateDoc = async (type: 'cpf' | 'cnpj') => {
    setLoading(true);
    setCopied(false);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900">Gerador de Documentos</h3>
            <p className="text-gray-500 text-sm">Gere documentos válidos para fins de teste e desenvolvimento.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => generateDoc('cpf')}
              disabled={loading}
              className="px-6 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-all flex items-center gap-2 border border-purple-100"
            >
              Gerar CPF
            </button>
            <button
              onClick={() => generateDoc('cnpj')}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-100"
            >
              Gerar CNPJ
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Gerando documento...</span>
            </div>
          </div>
        ) : generated ? (
          <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block ${
                  generated.type === 'CPF' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {generated.type} Válido
                </span>
                <div className="text-3xl font-mono font-bold text-gray-900 tracking-tighter">
                  {generated.formatted}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
                <button
                  onClick={() => generateDoc(generated.type.toLowerCase() as 'cpf' | 'cnpj')}
                  className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-gray-600 hover:border-gray-300 transition-all"
                  title="Gerar outro"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">Nenhum documento gerado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
