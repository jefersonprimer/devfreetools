'use client';

import { UnifiedSearch } from '@/components/UnifiedSearch';
import { UnifiedGenerator } from '@/components/UnifiedGenerator';
import { Header } from '@/components/Header';

export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* News Feature Banner */}
      <div className="w-full bg-[#DC5A5A] text-[#0f0f10] py-2 text-center text-sm sm:text-xs font-medium tracking-widest z-50 relative">
        <span><strong>Nova Feature</strong>: Base64 Encoder/ Decoder</span>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl sm:text-6xl font-black text-foreground mb-8 tracking-tighter leading-tight">
            Tudo que um Dev precisa em
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
              Um Só Lugar
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Consulta de CNPJ, geração de documentos e encurtador de links.
            Acelere seu desenvolvimento com nossas ferramentas gratuitas.
          </p>

          {/* Unified Search Component */}
          <div className="max-w-3xl mx-auto">
            <UnifiedSearch />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UnifiedGenerator />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
              Infraestrutura de Confiança
            </h2>
            <p className="text-lg text-muted-foreground">
              Tecnologia de ponta para garantir a melhor experiência de consulta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group p-8 rounded-3xl hover:bg-muted/50 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">Links Inteligentes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Encurte URLs e acompanhe cliques em tempo real com nosso encurtador integrado.
              </p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-muted/50 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">Validação de Documentos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Heurísticas avançadas para validar CPFs e consultar dados reais de CNPJ em segundos.
              </p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-muted/50 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">Developer-First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Webhooks, documentação OpenAPI e SDKs para as principais linguagens de programação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight">
                Uma API, <br />
                <span className="text-blue-400">Infinitas Possibilidades</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Integre nosso endpoint unificado e esqueça a complexidade de lidar com múltiplos provedores de dados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="/docs" className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Explorar Documentação
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <ul className="space-y-4">
                {['JSON Nativo', 'Suporte a CORS', 'Versionamento Semântico'].map((item) => (
                  <li key={item} className="flex items-center text-gray-300 font-medium">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-2 border border-white/5 shadow-2xl">
              <div className="bg-slate-900 rounded-2xl overflow-hidden">
                <div className="flex items-center space-x-2 px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="text-[10px] font-bold text-gray-500 ml-2 uppercase tracking-widest">Request Example</span>
                </div>
                <div className="p-6">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code className="text-blue-400">GET</code> <code className="text-gray-300">/api/cnpj/11222333000181</code>
                    <div className="mt-4 text-gray-500">
                      {`{
  "data": {
    "cnpj": "11222333000181",
    "status": "active",
    "name": "PRIMER TECH LTDA",
    ...
  }
}`}
                    </div>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
              Planos Flexíveis
            </h2>
            <p className="text-lg text-muted-foreground">
              Comece grátis e escale conforme seu negócio cresce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">Free</h3>
              <div className="text-4xl font-black text-foreground mb-2">R$ 0</div>
              <p className="text-muted-foreground mb-6 font-medium">Por mês</p>
              <ul className="text-left space-y-4 mb-8">
                {['100 consultas/mês', 'Cache inteligente', 'API REST'].map((item) => (
                  <li key={item} className="flex items-center text-sm font-semibold text-muted-foreground">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-bold hover:bg-secondary/80 transition-colors">
                Começar Grátis
              </button>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 text-center relative shadow-2xl scale-105 z-10 border border-blue-500/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Basic</h3>
              <div className="text-4xl font-black mb-2">R$ 29,90</div>
              <p className="text-gray-400 mb-6 font-medium">Por mês</p>
              <ul className="text-left space-y-4 mb-8">
                {['5.000 consultas/mês', 'Cache inteligente', 'API REST + Webhooks'].map((item) => (
                  <li key={item} className="flex items-center text-sm font-semibold text-gray-300">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Começar Agora
              </button>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">Pro</h3>
              <div className="text-4xl font-black text-foreground mb-2">R$ 79,90</div>
              <p className="text-muted-foreground mb-6 font-medium">Por mês</p>
              <ul className="text-left space-y-4 mb-8">
                {['50.000 consultas/mês', 'Cache inteligente', 'Suporte prioritário'].map((item) => (
                  <li key={item} className="flex items-center text-sm font-semibold text-muted-foreground">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-xl font-bold hover:bg-secondary/80 transition-colors">
                Fale Conosco
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6 group cursor-default">
                <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <span className="text-background font-black text-sm tracking-tighter">DFT</span>
                </div>
                <span className="text-xl font-bold text-foreground tracking-tight">Devfreetools</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed font-medium">
                Infraestrutura de dados para empresas modernas. Valide identidades e consulte dados corporativos com a melhor API do mercado.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">Produto</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground">
                <li><a href="/docs" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="/docs" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              PrimerLabs &copy; 2026. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">X</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="https://github.com/jefersonprimer/devfreetools" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
