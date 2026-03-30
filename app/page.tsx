'use client';

import { CnpjSearch } from '@/components/CnpjSearch';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PrimerAPI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Recursos
              </a>
              <a href="#api" className="text-gray-600 hover:text-gray-900 transition-colors">
                API
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Preços
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Consulta CNPJ
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              Instantânea
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Acesse dados oficiais de empresas brasileiras em segundos.
            Validação automática, cache inteligente e API simples para integrar.
          </p>

          {/* CNPJ Search Component */}
          <div className="max-w-2xl mx-auto">
            <CnpjSearch />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher PrimerAPI?
            </h2>
            <p className="text-xl text-gray-600">
              Tecnologia avançada para consultas rápidas e confiáveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rápido</h3>
              <p className="text-gray-600">
                Respostas em menos de 1 segundo com cache inteligente de 7 dias
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confiável</h3>
              <p className="text-gray-600">
                Dados oficiais da Receita Federal com validação automática
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Simples</h3>
              <p className="text-gray-600">
                API RESTful fácil de integrar com documentação completa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              API Simples e Poderosa
            </h2>
            <p className="text-xl text-gray-600">
              Integre em minutos com nossa API REST
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm font-mono">
              GET /api/cnpj/11222333000181
            </div>
            <div className="p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "data": {
    "cnpj": "11222333000181",
    "cnpjFormatted": "11.222.333/0001-81",
    "name": "Company Name LTDA",
    "status": "active",
    "foundedAt": "2020-01-15",
    "mainActivity": "Software development",
    "address": {
      "street": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01000-000"
    }
  },
  "metadata": {
    "cacheHit": false,
    "consultedAt": "2026-03-29T14:30:00.000Z",
    "usage": {
      "current": 1,
      "limit": 100,
      "remaining": 99,
      "percentageUsed": 1
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos Flexíveis
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e escale conforme seu negócio cresce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">R$ 0</div>
              <p className="text-gray-600 mb-6">Por mês</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100 consultas/mês
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cache inteligente
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  API REST
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Começar Grátis
              </button>
            </div>

            <div className="bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 rounded-bl-lg text-sm font-semibold">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="text-4xl font-bold mb-2">R$ 29,90</div>
              <p className="text-blue-100 mb-6">Por mês</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5.000 consultas/mês
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cache inteligente
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  API REST + Webhooks
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Começar Agora
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">R$ 79,90</div>
              <p className="text-gray-600 mb-6">Por mês</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  50.000 consultas/mês
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cache inteligente
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Fale Conosco
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold">PrimerAPI</span>
              </div>
              <p className="text-gray-400">
                API de consulta CNPJ rápida e confiável para empresas brasileiras.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status da API</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2026 PrimerAPI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
