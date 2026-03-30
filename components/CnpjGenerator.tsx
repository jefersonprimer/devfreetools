'use client';

import { useState } from 'react';
import { generateValidCnpj, formatCnpj } from '@/lib/cnpj';

export function CnpjGenerator() {
  const [cnpjs, setCnpjs] = useState<{ cnpj: string; formatted: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    const newCnpj = generateValidCnpj();
    setCnpjs([{ cnpj: newCnpj, formatted: formatCnpj(newCnpj) }, ...cnpjs].slice(0, 5));
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gerador de CNPJ</h3>
            <p className="text-gray-600">Gere CNPJs válidos para seus testes de integração.</p>
          </div>
          <button
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Gerar Novo CNPJ
          </button>
        </div>

        {cnpjs.length > 0 ? (
          <div className="space-y-3">
            {cnpjs.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-lg font-mono font-bold text-gray-800">{item.formatted}</span>
                  <span className="text-xs text-gray-500 font-mono">{item.cnpj}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(item.cnpj, index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                    copiedIndex === index
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500">Nenhum CNPJ gerado ainda.</p>
          </div>
        )}
      </div>
      <div className="bg-purple-50 px-6 py-3 border-t border-purple-100">
        <p className="text-sm text-purple-700 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Estes CNPJs são gerados algoritmicamente e passam na validação, mas não representam empresas reais.
        </p>
      </div>
    </div>
  );
}
