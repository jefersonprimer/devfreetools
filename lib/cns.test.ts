/**
 * Testes para validação e geração de CNS
 * Execute com: npx ts-node lib/cns.test.ts
 */

import {
  cleanCns,
  detectCnsType,
  formatCns,
  isValidCns,
  isValidCnsDefinitivo,
  isValidCnsProvisorio,
  parseCns,
  generateCns,
  generateCnsDefinitivoFromCpf,
  generateRandomCnsDefinitivo,
  generateRandomCnsProvisorio,
} from './cns';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${error}`);
  }
}

function assertEqual(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value: unknown) {
  if (!value) {
    throw new Error(`Expected true, got ${value}`);
  }
}

function assertFalse(value: unknown) {
  if (value) {
    throw new Error(`Expected false, got ${value}`);
  }
}

console.log('\n🧪 CNS Validation Tests\n');

test('cleanCns: remove máscara e espaços', () => {
  assertEqual(cleanCns('123 4567 8901 234-5'), '123456789012345');
});

test('formatCns: formata corretamente', () => {
  assertEqual(formatCns('123456789012345'), '123 4567 8901 234-5');
});

test('detectCnsType: reconhece tipos por prefixo', () => {
  assertEqual(detectCnsType('1'.padEnd(15, '0')), 'definitivo');
  assertEqual(detectCnsType('2'.padEnd(15, '0')), 'definitivo');
  assertEqual(detectCnsType('7'.padEnd(15, '0')), 'provisorio');
  assertEqual(detectCnsType('8'.padEnd(15, '0')), 'provisorio');
  assertEqual(detectCnsType('9'.padEnd(15, '0')), 'provisorio');
  assertEqual(detectCnsType('3'.padEnd(15, '0')), 'desconhecido');
});

test('generateRandomCnsDefinitivo: gera CNS definitivo válido', () => {
  const cns = generateRandomCnsDefinitivo();
  assertEqual(cns.length, 15);
  assertTrue(isValidCnsDefinitivo(cns));
  assertEqual(detectCnsType(cns), 'definitivo');
});

test('generateRandomCnsProvisorio: gera CNS provisório válido', () => {
  const cns = generateRandomCnsProvisorio();
  assertEqual(cns.length, 15);
  assertTrue(isValidCnsProvisorio(cns));
  assertEqual(detectCnsType(cns), 'provisorio');
});

test('generateCns with CPF: gera definitivo atrelado ao CPF', () => {
  const cpf = '93541134780';
  const cns = generateCnsDefinitivoFromCpf(cpf);
  assertEqual(cns.length, 15);
  assertTrue(isValidCnsDefinitivo(cns));
  const parsed = parseCns(cns);
  assertTrue(parsed.hasCpf);
  assertEqual(parsed.cpf, '93541134780');
});

test('generateCns: determinismo com seed', () => {
  const a = generateCns({ type: 'definitivo', seed: 'foo' });
  const b = generateCns({ type: 'definitivo', seed: 'foo' });
  assertEqual(a.cns, b.cns);

  const c = generateCns({ type: 'provisorio', seed: 'bar' });
  const d = generateCns({ type: 'provisorio', seed: 'bar' });
  assertEqual(c.cns, d.cns);
});

test('parseCns: rejeita CNS inválido', () => {
  const result = parseCns('123456789012345');
  assertFalse(result.isValid);
});

test('isValidCns: aceita gerados', () => {
  const def = generateRandomCnsDefinitivo();
  const prov = generateRandomCnsProvisorio();
  assertTrue(isValidCns(def));
  assertTrue(isValidCns(prov));
});

console.log('\n✨ Tests completed\n');

