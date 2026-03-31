/**
 * Testes para validação de CPF
 * Execute com: npx ts-node lib/cpf.test.ts
 */

import {
  cleanCpf,
  isValidCpfFormat,
  isValidCpfChecksum,
  isValidCpf,
  isValidCpfSmart,
  isBlacklistedCpf,
  isLikelyFakeCpf,
  formatCpf,
  parseCpf,
  generateValidCpf,
} from './cpf';

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

console.log('\n🧪 CPF Validation Tests\n');

// cleanCpf
test('cleanCpf: Remove máscara e caracteres', () => {
  assertEqual(cleanCpf('123.456.789-09'), '12345678909');
  assertEqual(cleanCpf('12345678909'), '12345678909');
});

// isValidCpfFormat
test('isValidCpfFormat: Válido com e sem máscara', () => {
  assertTrue(isValidCpfFormat('123.456.789-09'));
  assertTrue(isValidCpfFormat('12345678909'));
});

test('isValidCpfFormat: Inválido formatos ruins', () => {
  assertFalse(isValidCpfFormat('123.456.789-0')); // falta dígito
  assertFalse(isValidCpfFormat('1234567a909'));
  assertFalse(isValidCpfFormat('12.345.6789-09')); // formato mascarado incorreto
});

// isValidCpfChecksum
test('isValidCpfChecksum: CPF válido', () => {
  assertTrue(isValidCpfChecksum('93541134780'));
  assertTrue(isValidCpfChecksum('935.411.347-80'));
});

test('isValidCpfChecksum: CPF inválido', () => {
  assertFalse(isValidCpfChecksum('93541134781'));
  assertFalse(isValidCpfChecksum('00000000000'));
});

// isValidCpf
test('isValidCpf: aceita CPF válido', () => {
  assertTrue(isValidCpf('93541134780'));
});

test('isValidCpf: rejeita CPF inválido checksum/seq repetido', () => {
  assertFalse(isValidCpf('111.111.111-11'));
  assertFalse(isValidCpf('93541134781'));
});

// semantic functions
test('isBlacklistedCpf: detecta CPFs conhecidos', () => {
  assertTrue(isBlacklistedCpf('123.456.789-09'));
  assertTrue(isBlacklistedCpf('11111111111'));
});

test('isLikelyFakeCpf: heurísticas', () => {
  assertTrue(isLikelyFakeCpf('12345678909'));
  assertTrue(isLikelyFakeCpf('98765432100'));
  assertFalse(isLikelyFakeCpf('93541134780'));
});

// isValidCpfSmart
test('isValidCpfSmart: clasifica corretamente', () => {
  assertTrue(isValidCpfSmart('93541134780'));
  assertFalse(isValidCpfSmart('12345678909'));
  assertFalse(isValidCpfSmart('93541134781')); // checksum inválido
});

// formatCpf
test('formatCpf: formata corretamente', () => {
  assertEqual(formatCpf('93541134780'), '935.411.347-80');
});

// parseCpf
test('parseCpf: retorna objeto certo CPF válido', () => {
  const result = parseCpf('93541134780');
  assertEqual(result.cpf, '93541134780');
  assertEqual(result.formatted, '935.411.347-80');
  assertTrue(result.isValid);
  assertTrue(result.isSmartValid);
});

test('parseCpf: retorna erro para CPF inválido', () => {
  const result = parseCpf('111.111.111-11');
  assertFalse(result.isValid);
  assertFalse(result.isSmartValid);
  assertTrue(result.error !== undefined);
});

// generateValidCpf
test('generateValidCpf: gera CPF válido', () => {
  const cpf = generateValidCpf();
  assertTrue(cpf.length === 11);
  assertTrue(isValidCpf(cpf));
  assertTrue(isValidCpfSmart(cpf));
});

console.log('\n✨ Tests completed\n');
