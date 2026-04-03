# API de Certidão de Nascimento

Gera dados sintéticos de certidões de nascimento para preenchimento de formulários de teste e validação de layouts.

**Endpoint:** `GET /certidao-nascimento/generate`

## Parâmetros de Query

*   `count` (opcional): Quantidade de certidões (máximo 10).
*   `format` (opcional): Formato dos dados.
    *   `text` (padrão): Retorna o número da certidão formatado.
    *   `json`: Retorna objeto completo (nome, pais, cartório, etc).
    *   `compact`: Retorna apenas os códigos essenciais.

## Exemplo de Requisição

```bash
GET /api/v1/certidao-nascimento/generate?format=json
```

## Exemplo de Resposta (JSON)

```json
{
  "success": true,
  "data": [
    {
      "numeroCertidao": "123456 01 55 2024 1 00123 456 0012345 67",
      "nomeRegistrado": "Fulano de Tal",
      "dataNascimento": "2024-03-29",
      "cidade": "São Paulo",
      "uf": "SP",
      "cartorio": "1º Ofício de Registro Civil",
      "mae": "Maria Silva",
      "pai": "José Silva"
    }
  ]
}
```

> **Aviso:** Os dados gerados são puramente aleatórios e não possuem validade jurídica ou registro real em cartório.
