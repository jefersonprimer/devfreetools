/**
 * Testes para validação de CNPJ
 * Execute com: npx ts-node lib/cnpj.test.ts
 */

import {
  cleanCnpj,
  isValidCnpjFormat,
  isValidCnpjChecksum,
  isValidCnpj,
  formatCnpj,
  parseCnpj,
  generateValidCnpj,
} from './cnpj';

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

console.log('\n🧪 CNPJ Validation Tests\n');

// Clean CNPJ
test('cleanCnpj: Remove special characters', () => {
  assertEqual(cleanCnpj('12.345.678/0001-95'), '12345678000195');
  assertEqual(cleanCnpj('12345678000195'), '12345678000195');
  assertEqual(cleanCnpj('12-345-678-0001-95'), '12345678000195');
});

// Format CNPJ
test('formatCnpj: Format for display', () => {
  assertEqual(formatCnpj('12345678000195'), '12.345.678/0001-95');
  assertEqual(formatCnpj('12.345.678/0001-95'), '12.345.678/0001-95');
});

// Valid format
test('isValidCnpjFormat: Accept 14 digits', () => {
  assertTrue(isValidCnpjFormat('12345678000195'));
  assertTrue(isValidCnpjFormat('12.345.678/0001-95'));
});

test('isValidCnpjFormat: Reject invalid formats', () => {
  assertFalse(isValidCnpjFormat('123456'));
  assertFalse(isValidCnpjFormat('12345678000195123'));
  assertFalse(isValidCnpjFormat('1234567800019a'));
});

// Valid checksum (Real CNPJs for testing)
test('isValidCnpjChecksum: Accept valid checksum', () => {
  // CNPJ de teste: 11.222.333/0001-81
  assertTrue(isValidCnpjChecksum('11222333000181'));
  // CNPJ de teste: 11.444.777/0001-61
  assertTrue(isValidCnpjChecksum('11444777000161'));
});

test('isValidCnpjChecksum: Reject invalid checksum', () => {
  // CNPJ inválido conhecido
  assertFalse(isValidCnpjChecksum('11222333000182'));
  assertFalse(isValidCnpjChecksum('11222333000100'));
});

test('isValidCnpjChecksum: Reject repeated digits', () => {
  assertFalse(isValidCnpjChecksum('11111111111111'));
  assertFalse(isValidCnpjChecksum('00000000000000'));
  assertFalse(isValidCnpjChecksum('99999999999999'));
});

// Complete validation
test('isValidCnpj: Accept valid CNPJ', () => {
  assertTrue(isValidCnpj('11222333000181'));
  assertTrue(isValidCnpj('11.222.333/0001-81'));
  assertTrue(isValidCnpj('11444777000161'));
});

test('isValidCnpj: Reject invalid CNPJ', () => {
  assertFalse(isValidCnpj('11222333000182'));
  assertFalse(isValidCnpj('123456'));
  assertFalse(isValidCnpj('11111111111111'));
});

// Parse CNPJ
test('parseCnpj: Parse valid CNPJ', () => {
  const result = parseCnpj('11222333000181');
  assertEqual(result.cnpj, '11222333000181');
  assertEqual(result.formatted, '11.222.333/0001-81');
  assertTrue(result.isValid);
});

test('parseCnpj: Parse invalid CNPJ', () => {
  const result = parseCnpj('11222333000182');
  assertEqual(result.cnpj, '11222333000182');
  assertFalse(result.isValid);
  assertTrue(result.error !== undefined);
});

// Generate valid CNPJ
test('generateValidCnpj: Generate valid CNPJ', () => {
  const cnpj = generateValidCnpj();
  assertTrue(isValidCnpjFormat(cnpj));
  assertTrue(isValidCnpjChecksum(cnpj));
  assertTrue(isValidCnpj(cnpj));
  assertEqual(cnpj.length, 14);
});

test('generateValidCnpj: Generate multiple unique CNPJs', () => {
  const cnpjs = new Set();
  for (let i = 0; i < 10; i++) {
    const cnpj = generateValidCnpj();
    cnpjs.add(cnpj);
  }
  assertEqual(cnpjs.size, 10); // All should be unique
});

console.log('\n✨ Tests completed\n');
