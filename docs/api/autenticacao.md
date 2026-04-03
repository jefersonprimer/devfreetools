# Autenticação

A maioria dos endpoints da PrimerAPI requer autenticação via **API Key**. Você pode gerenciar suas chaves no painel do desenvolvedor após fazer login.

## Como Autenticar

Para autenticar suas requisições, envie sua chave de API no header `Authorization` seguindo o esquema `Bearer`:

```http
Authorization: Bearer SUA_API_KEY_AQUI
```

### Exemplo com cURL

```bash
curl -X GET "https://api.primer.com.br/api/v1/usage" \
     -H "Authorization: Bearer 3a7f9c2d8e4b1a6f..."
```

## Segurança

*   **Nunca compartilhe sua API Key** em ambientes públicos (como GitHub, fóruns ou no frontend do seu site).
*   Se sua chave for exposta, revogue-a imediatamente no painel e gere uma nova.
*   Utilize variáveis de ambiente para armazenar suas chaves com segurança.

## Limites de Uso (Rate Limit)

Os limites de uso dependem do seu plano atual:

| Plano | Limite Mensal | Burst Limit |
|-------|---------------|-------------|
| **Gratuito** | 100 req/mês | 10 req/min |
| **Pro** | 10.000 req/mês | 100 req/min |

Quando o limite é atingido, a API retornará o status `429 Too Many Requests`.
