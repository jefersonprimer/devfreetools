# Introdução

Bem-vindo à documentação oficial da **PrimerAPI**. Nossa API oferece ferramentas gratuitas para desenvolvedores, incluindo consulta e geração de documentos (CNPJ, CPF, Certidões) e encurtamento de links.

## Base URL

Todas as requisições devem ser feitas para a seguinte URL base:

```bash
https://devfreetools.vercel.app/api/v1
```

*(Para ambiente de desenvolvimento, utilize `http://localhost:3000/api/v1`)*

## Formato de Resposta

Todas as respostas da API são retornadas no formato **JSON**.

### Exemplo de Sucesso (200 OK)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Exemplo de Erro (400 Bad Request)
```json
{
  "error": "Invalid Parameter",
  "message": "O parâmetro informado é inválido."
}
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `201` | Recurso criado com sucesso |
| `400` | Requisição inválida (parâmetros incorretos) |
| `401` | Não autorizado (chave de API ausente ou inválida) |
| `404` | Recurso não encontrado |
| `429` | Limite de requisições excedido |
| `500` | Erro interno do servidor |
