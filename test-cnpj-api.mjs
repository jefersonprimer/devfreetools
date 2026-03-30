#!/usr/bin/env node

/**
 * Script para testar a API de CNPJ
 * Execute com: node test-cnpj-api.mjs
 * 
 * Requer: npm run dev rodando em outra aba
 */

const API_URL = 'http://localhost:3000/api';

// CNPJs de teste (válidos)
const TEST_CNPJS = {
  valid: [
    {
      cnpj: '11222333000181',
      formatted: '11.222.333/0001-81',
      name: 'Test CNPJ 1',
    },
    {
      cnpj: '11444777000161',
      formatted: '11.444.777/0001-61',
      name: 'Test CNPJ 2',
    },
  ],
  invalid: [
    {
      cnpj: '12345678000195',
      description: 'Invalid checksum',
    },
    {
      cnpj: '11111111111111',
      description: 'All repeated digits',
    },
    {
      cnpj: '123456',
      description: 'Too short',
    },
  ],
};

let apiKey = null;

async function log(title, data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(JSON.stringify(data, null, 2));
}

async function register() {
  console.log('\n🔐 Registrando novo usuário...');

  const response = await fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  }

  apiKey = data.apiKey;
  console.log(`✅ Usuário criado com sucesso`);
  console.log(`📝 API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(-8)}`);

  return data;
}

async function testValidCnpj(cnpj) {
  console.log(`\n🔍 Consultando CNPJ válido: ${cnpj.formatted}`);

  const response = await fetch(`${API_URL}/cnpj/${cnpj.cnpj}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`✅ Sucesso (${response.status})`);
    console.log(`   Nome: ${data.data.name}`);
    console.log(`   Status: ${data.data.status}`);
    console.log(`   Cache Hit: ${data.metadata.cacheHit}`);
    console.log(`   Uso: ${data.metadata.usage.current}/${data.metadata.usage.limit}`);
  } else {
    console.log(`❌ Erro (${response.status})`);
    console.log(`   ${data.error}: ${data.message}`);
  }

  return { response, data };
}

async function testInvalidCnpj(cnpj) {
  console.log(`\n❌ Consultando CNPJ inválido: ${cnpj.cnpj} (${cnpj.description})`);

  const response = await fetch(`${API_URL}/cnpj/${cnpj.cnpj}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();

  if (!response.ok) {
    console.log(`✅ Esperado: Erro (${response.status})`);
    console.log(`   ${data.error}: ${data.message}`);
  } else {
    console.log(`❌ Inesperado: Sucesso (${response.status})`);
  }

  return { response, data };
}

async function testUsage() {
  console.log(`\n📊 Obtendo estatísticas de uso...`);

  const response = await fetch(`${API_URL}/usage`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`✅ Sucesso`);
    console.log(`   Usuário: ${data.user.email}`);
    console.log(`   Plano: ${data.user.plan}`);
    console.log(`   Uso: ${data.usage.current}/${data.usage.limit}`);
    console.log(`   Cache Hit Rate: ${data.cacheStats.cacheHitRate.toFixed(2)}%`);
  } else {
    console.log(`❌ Erro (${response.status})`);
  }

  return { response, data };
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║      🧪 TESTE DE API DE CNPJ                          ║
║      ${new Date().toLocaleString('pt-BR')}                   
╚════════════════════════════════════════════════════════╝
  `);

  try {
    // 1. Registrar usuário
    const user = await register();

    // 2. Testar CNPJs válidos
    console.log(`\n\n📋 TESTANDO CNPJs VÁLIDOS`);
    for (const cnpj of TEST_CNPJS.valid) {
      await testValidCnpj(cnpj);
    }

    // 3. Testar CNPJs inválidos
    console.log(`\n\n⚠️  TESTANDO CNPJs INVÁLIDOS`);
    for (const cnpj of TEST_CNPJS.invalid) {
      await testInvalidCnpj(cnpj);
    }

    // 4. Obter uso
    await testUsage();

    // 5. Resumo
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`✨ TESTES COMPLETADOS COM SUCESSO`);
    console.log(`${'='.repeat(60)}`);

    console.log(`
📝 Próximos passos:
   1. Testar com dados reais de CNPJ
   2. Verificar cache funcionando
   3. Testar rate limiting
   4. Integrar com frontend
    `);
  } catch (error) {
    console.error(`\n❌ ERRO:`, error.message);
    process.exit(1);
  }
}

main();
