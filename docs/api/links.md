# Encurtador de Links

Nossa API de links permite criar URLs curtas e rastreáveis para facilitar o compartilhamento.

## Criar Link Curto

Cria uma nova URL encurtada.

**Endpoint:** `POST /links`

### Request Body
```json
{
  "url": "https://sua-url-longa-e-complexa.com/parametro?id=123",
  "alias": "meu-link" (opcional)
}
```

### Exemplo de Resposta (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "shortUrl": "https://primer.li/meu-link",
    "originalUrl": "https://sua-url-longa-e-complexa.com/parametro?id=123",
    "createdAt": "2026-03-29T14:30:00Z"
  }
}
```

---

## Gerar Link Aleatório

Gera um link curto com código aleatório rapidamente.

**Endpoint:** `GET /links/generate`

### Parâmetros de Query
*   `url`: A URL de destino (obrigatório).

### Exemplo de Requisição
```bash
GET /api/v1/links/generate?url=https://google.com
```

---

## Estatísticas de Acesso

Obtém dados de cliques e origem de um link encurtado.

**Endpoint:** `GET /links/[id]/stats`

### Exemplo de Resposta (200 OK)
```json
{
  "data": {
    "totalClicks": 150,
    "lastClick": "2026-03-29T15:00:00Z",
    "browsers": {
      "chrome": 100,
      "firefox": 50
    }
  }
}
```
