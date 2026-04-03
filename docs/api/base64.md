# API Base64

A API Base64 permite codificar e decodificar textos usando o algoritmo Base64, com suporte completo a UTF-8 e à variante base64url (comum em JWTs).

## Encode (Codificar)

Codifica um texto para Base64 com suporte correto a caracteres UTF-8 (incluindo acentos e emojis).

**Endpoint:** `POST /base64/encode`

**Método alternativo:** `GET /base64/encode?input=texto&variant=standard`

### Parâmetros do Body (POST)

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `input` | string | Sim | Texto a ser codificado |
| `variant` | string | Não | Variante: `standard` (padrão) ou `base64url` |

### Variantes

- **standard**: Base64 tradicional com `+`, `/` e padding `=`
- **base64url**: Variante URL-safe usada em JWTs, substitui `+` por `-`, `/` por `_` e remove o padding

### Exemplo de Requisição (POST)

```bash
curl -X POST https://devfreetools.vercel.app/api/v1/base64/encode \
  -H "Content-Type: application/json" \
  -d '{"input": "Olá, mundo! 🎉", "variant": "standard"}'
```

### Exemplo de Resposta (200 OK)

```json
{
  "success": true,
  "data": {
    "input": "Olá, mundo! 🎉",
    "output": "T2zDoSwgbXVuZG8hIPCfjok=",
    "variant": "standard",
    "inputLength": 15,
    "outputLength": 24
  },
  "message": "Successfully encoded to standard Base64"
}
```

---

## Decode (Decodificar)

Decodifica uma string Base64 para texto, com detecção automática de variantes.

**Endpoint:** `POST /base64/decode`

**Método alternativo:** `GET /base64/decode?input=T2zDoQ==&variant=auto`

### Parâmetros do Body (POST)

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `input` | string | Sim | String Base64 a ser decodificada |
| `variant` | string | Não | Variante: `auto` (padrão), `standard` ou `base64url` |

### Modos de Decodificação

- **auto**: Tenta detectar automaticamente entre standard e base64url
- **standard**: Decodifica como Base64 tradicional
- **base64url**: Decodifica como base64url (JWT)

### Exemplo de Requisição (POST)

```bash
curl -X POST https://devfreetools.vercel.app/api/v1/base64/decode \
  -H "Content-Type: application/json" \
  -d '{"input": "T2zDoSwgbXVuZG8hIPCfjok=", "variant": "standard"}'
```

### Exemplo de Resposta (200 OK)

```json
{
  "success": true,
  "data": {
    "input": "T2zDoSwgbXVuZG8hIPCfjok=",
    "output": "Olá, mundo! 🎉",
    "variant": "standard",
    "inputLength": 24,
    "outputLength": 15
  },
  "message": "Successfully decoded from Base64"
}
```

---

## Erros

### Exemplo de Erro (400 Bad Request)

```json
{
  "success": false,
  "error": "Decoding failed",
  "message": "Invalid Base64 string"
}
```

### Causas Comuns de Erro

- String Base64 malformada
- Caracteres inválidos na string
- Padding incorreto (comprimento não é múltiplo de 4)

---

## Casos de Uso

### Decodificar parte de um JWT

```bash
# Header de um JWT (exemplo)
curl -X POST https://devfreetools.vercel.app/api/v1/base64/decode \
  -H "Content-Type: application/json" \
  -d '{"input": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "variant": "base64url"}'
```

### Codificar payload para API

```bash
curl -X POST https://devfreetools.vercel.app/api/v1/base64/encode \
  -H "Content-Type: application/json" \
  -d '{"input": "{"user_id": 123, "action": "test"}", "variant": "standard"}'
```

---

## Limitações

- Tamanho máximo do input: 1MB
- Apenas suporte a texto (strings), não a arquivos binários diretamente
- Rate limiting aplicado para requisições públicas
