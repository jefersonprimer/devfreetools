# API de CPF

A API de CPF permite validar a estrutura de um CPF e gerar números válidos para fins de teste.

> **Nota:** Por motivos de privacidade e conformidade com a LGPD, esta API **não** consulta dados pessoais vinculados ao CPF (como nome ou data de nascimento). Ela apenas valida a integridade matemática do documento.

## Validar CPF

Verifica se um CPF é matematicamente válido e aplica heurísticas para detectar sequências suspeitas.

**Endpoint:** `GET /cpf/[cpf]`

### Parâmetros de URL
*   `cpf`: O número do CPF (com ou sem máscara).

### Exemplo de Requisição
```bash
GET /api/v1/cpf/123.456.789-00
```

### Exemplo de Resposta (200 OK)
```json
{
  "data": {
    "cpf": "12345678900",
    "isValid": true,
    "message": "CPF válido e não detectado como suspeito."
  }
}
```

---

## Gerar CPF

Gera números de CPF válidos para uso em desenvolvimento.

**Endpoint:** `GET /cpf/generate`

### Parâmetros de Query
*   `count` (opcional): Quantidade de CPFs a gerar (máximo 10). Padrão: 1.
*   `masked` (opcional): `true` para retornar com máscara.

### Exemplo de Requisição
```bash
GET /api/v1/cpf/generate?count=1&masked=true
```

### Exemplo de Resposta (200 OK)
```json
{
  "success": true,
  "data": ["444.555.666-77"]
}
```
