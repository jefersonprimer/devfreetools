# API de CEP

A API de CEP permite consultar endereços a partir de um CEP válido e gerar endereços aleatórios reais para fins de teste. Os dados são obtidos em tempo real através da [ViaCEP](https://viacep.com.br/).

## Consultar CEP

Retorna o endereço completo associado a um CEP.

**Endpoint:** `GET /cep/[cep]`

### Parâmetros de URL
*   `cep`: O número do CEP com 8 dígitos (com ou sem máscara). Exemplos: `01001000`, `01001-000`.

### Exemplo de Requisição
```bash
GET /api/v1/cep/01001000
```

### Exemplo de Resposta (200 OK)
```json
{
  "success": true,
  "data": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "complemento": "lado ímpar",
    "unidade": "",
    "bairro": "Sé",
    "localidade": "São Paulo",
    "uf": "SP",
    "estado": "São Paulo",
    "regiao": "Sudeste",
    "ibge": "3550308",
    "gia": "1004",
    "ddd": "11",
    "siafi": "7107"
  }
}
```

### Erros

| Status | Erro             | Descrição                                  |
|--------|------------------|--------------------------------------------|
| 400    | Invalid CEP      | O CEP informado não contém 8 dígitos.      |
| 404    | CEP not found    | Nenhum endereço foi encontrado para o CEP. |
| 500    | Internal server error | Falha ao consultar o serviço ViaCEP.  |

### Exemplo de Resposta de Erro (400)
```json
{
  "error": "Invalid CEP",
  "message": "CEP must contain exactly 8 digits."
}
```

---

## Gerar Endereços Aleatórios

Gera endereços brasileiros reais e aleatórios consultando CEPs gerados randomicamente na ViaCEP.

**Endpoint:** `GET /generate/address`

### Parâmetros de Query
*   `count` (opcional): Quantidade de endereços a gerar (1–50). Padrão: `1`.
*   `seed` (opcional): Seed numérica para geração determinística dos CEPs. Útil para reproduzir os mesmos resultados.
*   `uf` (opcional): Filtrar por estado (sigla UF, ex: `SP`, `RJ`, `MG`).
*   `cidade` (opcional): Filtrar por cidade (ex: `São Paulo`, `Rio de Janeiro`).

### Exemplo de Requisição
```bash
GET /api/v1/generate/address?count=2&uf=SP
```

### Exemplo de Resposta (200 OK)
```json
{
  "success": true,
  "countRequested": 2,
  "countReturned": 2,
  "filters": {
    "uf": "SP",
    "cidade": null
  },
  "data": [
    {
      "cep": "01001-000",
      "logradouro": "Praça da Sé",
      "complemento": "lado ímpar",
      "unidade": "",
      "bairro": "Sé",
      "localidade": "São Paulo",
      "uf": "SP",
      "estado": "São Paulo",
      "regiao": "Sudeste",
      "ibge": "3550308",
      "gia": "1004",
      "ddd": "11",
      "siafi": "7107"
    },
    {
      "cep": "04538-132",
      "logradouro": "Avenida Brigadeiro Faria Lima",
      "complemento": "",
      "unidade": "",
      "bairro": "Itaim Bibi",
      "localidade": "São Paulo",
      "uf": "SP",
      "estado": "São Paulo",
      "regiao": "Sudeste",
      "ibge": "3550308",
      "gia": "1004",
      "ddd": "11",
      "siafi": "7107"
    }
  ],
  "warning": null
}
```

### Campos da Resposta

| Campo            | Tipo     | Descrição                                                              |
|------------------|----------|------------------------------------------------------------------------|
| `cep`            | string   | CEP formatado (XXXXX-XXX).                                             |
| `logradouro`     | string   | Nome da rua, avenida, praça, etc.                                      |
| `complemento`    | string   | Complemento do endereço (pode estar vazio).                            |
| `unidade`        | string   | Unidade do endereço (pode estar vazio).                                |
| `bairro`         | string   | Nome do bairro.                                                        |
| `localidade`     | string   | Nome da cidade.                                                        |
| `uf`             | string   | Sigla do estado (2 caracteres).                                        |
| `estado`         | string   | Nome completo do estado.                                               |
| `regiao`         | string   | Região geográfica (Sudeste, Sul, etc).                                 |
| `ibge`           | string   | Código IBGE do município.                                              |
| `gia`            | string   | Código GIA (apenas para SP, pode estar vazio).                         |
| `ddd`            | string   | Código DDD da localidade.                                              |
| `siafi`          | string   | Código SIAFI do município.                                             |

### Observações

*   O `count` é limitado a **50** endereços por requisição.
*   A geração de endereços depende de CEPs aleatórios que existam na base da ViaCEP. Ao usar filtros (`uf`, `cidade`), pode ser que nem todos os endereços solicitados sejam encontrados. Nesse caso, o campo `warning` retornará uma mensagem e `countReturned` será menor que `countRequested`.
*   O parâmetro `seed` permite reproduzir exatamente os mesmos resultados em chamadas subsequentes.

### Erros

| Status | Erro                  | Descrição                                |
|--------|-----------------------|------------------------------------------|
| 500    | Internal server error | Falha ao gerar endereços via ViaCEP.     |
