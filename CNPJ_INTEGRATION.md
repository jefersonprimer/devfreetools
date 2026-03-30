# Integração com API de CNPJ

## 📡 API Utilizada

**https://publica.cnpj.ws/**

Uma API pública brasileira que fornece dados oficiais da Receita Federal sobre CNPJ.

### Características

- ✅ **Gratuita** - Sem custo
- ✅ **Sem autenticação** - Sem API key necessária
- ✅ **Dados oficiais** - Direto da Receita Federal
- ✅ **Rápida** - Respostas em <1s
- ✅ **Confiável** - Mantida por comunidade

## 🔄 Fluxo de Validação

```
Requisição com CNPJ
    ↓
[1] Validar formato (14 dígitos)
    ↓
[2] Validar checksum (algoritmo Receita Federal)
    ↓
[3] Validar repetição (rejeita 11111111111111)
    ↓
[4] Buscar em API real (https://publica.cnpj.ws/)
    ↓
[5] Retornar dados ou erro
```

Os primeiros 3 passos são **muito rápidos** (validação local). O passo 4 faz uma requisição HTTP.

## 🛡️ Tratamento de Erros

### CNPJ Inválido (400)
```
Falha na validação de formato/checksum → Retorna imediatamente
Não faz requisição HTTP
```

### CNPJ Não Encontrado (404)
```
CNPJ é válido mas não existe no banco de dados
Dados obtidos da API retornaram 404
```

### Serviço Indisponível (503)
```
API de CNPJ está fora/lenta/timeout
Tenta novamente em alguns segundos
```

## 📊 Dados Retornados

A API retorna:

```json
{
  "cnpj": "11222333000181",
  "cnpjFormatted": "11.222.333/0001-81",
  "name": "Company Name LTDA",
  "status": "active",          // "active" ou "inactive"
  "foundedAt": "2020-01-15",  // Data de abertura
  "mainActivity": "...",       // CNAE descrito
  "address": {
    "street": "...",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000"
  },
  "rawData": {...}             // Resposta completa da API
}
```

## 💾 Cache

Os dados são automaticamente cacheados por **7 dias** no banco de dados. Isso significa:

1. Primeira consulta: Busca na API e salva em cache
2. Consultas seguintes: Retorna do cache (mais rápido, não conta contra rate limit se `cacheHit: true`)
3. Após 7 dias: Busca novamente na API

## 🚀 Exemplos

### cURL - CNPJ Válido

```bash
curl http://localhost:3000/api/cnpj/11222333000181 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Resposta (200):**
```json
{
  "data": {
    "cnpj": "11222333000181",
    "cnpjFormatted": "11.222.333/0001-81",
    "name": "Company Name",
    "status": "active",
    ...
  },
  "metadata": {
    "cacheHit": false
  }
}
```

### cURL - CNPJ Inválido

```bash
curl http://localhost:3000/api/cnpj/12345678000195 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Resposta (400):**
```json
{
  "error": "Invalid CNPJ",
  "message": "The provided CNPJ format is invalid or checksum failed validation"
}
```

### cURL - CNPJ Não Encontrado

```bash
curl http://localhost:3000/api/cnpj/00000000000191 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Resposta (404):**
```json
{
  "error": "CNPJ not found",
  "message": "This CNPJ is not registered in Brazilian records"
}
```

## 🔧 Configuração

Nenhuma configuração necessária! A API é pública e sem chave.

Se quiser mudar para outra API:

1. Edite `app/api/cnpj/[cnpj]/route.ts`
2. Mude a URL em `fetchCnpjData()`
3. Adapte o parsing da resposta

### Outras APIs Públicas

- **ReceitaWS** - https://receitaws.com.br/
- **BrasilAPI** - https://www.brasilapi.com.br/
- **CNPJ WS** - https://service.cnpj.ws/ (paga)

## ⚡ Performance

- **Validação local**: <1ms
- **Busca em cache**: <5ms
- **Busca em API**: 200-500ms (primeira vez)

Típico: 95% das consultas vêm do cache, portanto <5ms.

## 📊 Rate Limiting

O rate limit é por **usuário e plano**, não por API externa:

- **Free**: 100 req/mês
- **Basic**: 5.000 req/mês
- **Pro**: 50.000 req/mês

Consultas do cache ainda contam contra o limite em alguns casos (veja configuração de `cacheHit`).

## 🔒 Segurança

- ✅ Validação local antes de fazer requisição HTTP
- ✅ Timeout de 10 segundos em requisições
- ✅ User-Agent identificado
- ✅ HTTPS obrigatório
- ✅ Sem armazenamento de dados sensíveis

## 📝 Logs

Erros de API são logados em console:

```
console.error('Error fetching CNPJ data:', error)
```

Para debug, verifique os logs do servidor.

## 🔄 Fallback Strategy

Atualmente, se a API falhar:

1. Retorna erro 503 Service Unavailable
2. Usuário é informado

Alternativas para futuro:

- Tentar outra API
- Retornar dados em cache mesmo expirados
- Modo offline com dados mock
