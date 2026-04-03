# API de CNPJ

A API de CNPJ permite validar, consultar dados cadastrais reais da Receita Federal e gerar CNPJs válidos para fins de teste.

## Consultar CNPJ

Retorna informações detalhadas de um CNPJ ativo ou inativo.

**Endpoint:** `GET /cnpj/[cnpj]`

### Parâmetros de URL
*   `cnpj`: O número do CNPJ (com ou sem máscara).

### Exemplo de Requisição
```bash
GET /api/v1/cnpj/11222333000181
```

### Exemplo de Resposta (200 OK)
```json
{
  "data": {
    "cnpj": "11222333000181",
    "name": "EMPRESA EXEMPLO LTDA",
    "status": "active",
    "foundedAt": "2020-01-15",
    "address": {
      "city": "São Paulo",
      "state": "SP"
    }
  },
  "metadata": {
    "cacheHit": false,
    "usage": {
      "remaining": 99
    }
  }
}
```

---

## Gerar CNPJ

Gera um ou mais números de CNPJ válidos (com checksum correto) para uso em testes.

**Endpoint:** `GET /cnpj/generate`

### Parâmetros de Query
*   `count` (opcional): Quantidade de CNPJs a gerar (máximo 10). Padrão: 1.
*   `masked` (opcional): `true` para retornar com máscara (ex: `00.000.000/0001-91`).

### Exemplo de Requisição
```bash
GET /api/v1/cnpj/generate?count=2&masked=true
```

### Exemplo de Resposta (200 OK)
```json
{
  "success": true,
  "data": [
    "12.345.678/0001-90",
    "98.765.432/0001-21"
  ]
}
```
