# API de CNS (Cartão Nacional de Saúde)

A API de CNS permite **gerar** e **validar** números de Cartão Nacional de Saúde, tanto **definitivos** (iniciando em 1 ou 2) quanto **provisórios** (iniciando em 7, 8 ou 9), com validação de estrutura e dígito verificador.

> **Importante:** assim como na API de CPF, esta API realiza **apenas validação matemática/estrutural**. Ela **não consulta** nenhuma base do SUS e **não garante** que o CNS exista de fato em cadastros oficiais.

---

## Validar CNS (unitário)

Valida um CNS único e tenta inferir o tipo (definitivo/provisório) e, quando possível, o CPF base.

**Endpoint:** `GET /cns/[cns]`

### Parâmetros de URL
- `cns`: Número do CNS (com ou sem máscara, 15 dígitos).

### Exemplo de Requisição

```bash
GET /api/v1/cns/123456789012345
```

### Exemplo de Resposta (200 OK)

```json
{
  "data": {
    "cns": "123456789012345",
    "cnsFormatted": "123 4567 8901 234-5",
    "type": "definitivo",
    "isValid": true,
    "hasCpf": true,
    "cpf": "93541134780",
    "cpfFormatted": "935.411.347-80",
    "message": "CNS definitivo válido (validação matemática/estrutural, não garante existência no SUS)."
  }
}
```

Caso inválido, a resposta terá `400 Bad Request` com um campo `error` e detalhe em `data`.

---

## Validação em lote (bulk)

Recebe um ou vários CNS via `POST` e retorna o resultado de validação para cada um.

**Endpoint:** `POST /cns/validate`

### Body (JSON)

```json
{
  "cns": ["123456789012345", "987654321098765"]
}
```

Também é possível enviar um único CNS como string:

```json
{
  "cns": "123456789012345"
}
```

### Exemplo de Resposta (bulk)

```json
{
  "success": true,
  "data": [
    {
      "cns": "123456789012345",
      "cnsFormatted": "123 4567 8901 234-5",
      "valid": true,
      "type": "definitivo",
      "hasCpf": true,
      "cpf": "93541134780",
      "cpfFormatted": "935.411.347-80"
    },
    {
      "cns": "987654321098765",
      "cnsFormatted": "987 6543 2109 876-5",
      "valid": false,
      "type": "provisorio",
      "hasCpf": false,
      "error": "CNS provisório inválido (falha na soma ponderada módulo 11)."
    }
  ]
}
```

---

## Gerar CNS

Gera números de CNS válidos para uso em desenvolvimento e testes.

**Endpoint:** `GET /cns/generate`

### Parâmetros de Query

- `count` (opcional): Quantidade de CNS a gerar (máximo 10). Padrão: `1`.
- `type` (opcional): Tipo desejado:
  - `auto` (padrão): atualmente gera cartões **definitivos** por padrão.
  - `definitivo`
  - `provisorio`
- `cpf` (opcional): Quando informado, gera sempre um CNS **definitivo** vinculado a esse CPF (se o CPF for válido).
- `seed` (opcional): Seed determinística. Mesmo seed + mesmos parâmetros → mesmos CNS.

### Exemplo de Requisição (definitivo aleatório)

```bash
GET /api/v1/cns/generate?count=2&type=definitivo
```

### Exemplo de Requisição (provisório com seed)

```bash
GET /api/v1/cns/generate?type=provisorio&seed=meu-seed
```

### Exemplo de Requisição (definitivo vinculado a CPF)

```bash
GET /api/v1/cns/generate?cpf=93541134780
```

### Exemplo de Resposta

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "cns": "123456789012345",
      "type": "definitivo",
      "hasCpf": true,
      "cpf": "93541134780",
      "cpfFormatted": "935.411.347-80"
    },
    {
      "cns": "789012345678901",
      "type": "provisorio",
      "hasCpf": false
    }
  ],
  "message": "Generated 2 valid CNSs for testing"
}
```

---

## Observações importantes

- A validação é puramente **estrutural** (tamanho, prefixo e dígito verificador).
- Não há consulta a bases oficiais do SUS.
- A extração de CPF é **heurística**: quando o CNS é definitivo e sua base de 11 dígitos passa na validação de CPF, o campo `hasCpf` vem como `true` e os campos `cpf` / `cpfFormatted` são preenchidos.

