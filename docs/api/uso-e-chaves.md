# Uso e Estatísticas

Este endpoint permite acompanhar o consumo da sua cota mensal e estatísticas de performance.

**Endpoint:** `GET /usage`

## Resposta (200 OK)

```json
{
  "user": {
    "name": "João Silva",
    "plan": "free"
  },
  "usage": {
    "current": 45,
    "limit": 100,
    "remaining": 55,
    "percentageUsed": 45
  },
  "cacheStats": {
    "totalRequests": 45,
    "cacheHits": 12,
    "cacheHitRate": 26.6
  }
}
```

---

# Gerenciamento de Chaves

Você pode listar, criar e revogar chaves de API programaticamente.

## Listar Chaves
`GET /keys`

## Criar Nova Chave
`POST /keys`
*Body: `{ "name": "Produção" }`*

## Revogar Chave
`DELETE /keys/[id]`
