/**
 * CNS (Cartão Nacional de Saúde) utilities
 * Implementa geração e validação para números definitivos (1/2) e provisórios (7/8/9).
 *
 * Baseado no algoritmo oficial do e-SUS:
 * - Definitivo (1/2): usa os 11 primeiros dígitos (PIS/CPF-like) e constrói pis + "000"/"001" + dv
 * - Provisório (7/8/9): 15 dígitos com soma ponderada por 15..1 múltiplo de 11
 */

import { cleanCpf, formatCpf, isValidCpf } from './cpf';

export type CnsType = 'definitivo' | 'provisorio' | 'desconhecido';

export type ParsedCns = {
  cns: string;
  formatted: string;
  type: CnsType;
  isValid: boolean;
  hasCpf: boolean;
  cpf?: string | null;
  cpfFormatted?: string | null;
  error?: string;
};

export function cleanCns(cns: string): string {
  return cns.replace(/\D/g, '');
}

export function formatCns(cns: string): string {
  const clean = cleanCns(cns);
  if (clean.length !== 15) {
    return cns;
  }

  // Formato comum: 000 0000 0000 000-0
  return `${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7, 11)} ${clean.slice(11, 14)}-${clean.slice(14)}`;
}

export function detectCnsType(cns: string): CnsType {
  const clean = cleanCns(cns);
  if (clean.length !== 15 || !/^\d{15}$/.test(clean)) {
    return 'desconhecido';
  }
  const first = clean[0];
  if (first === '1' || first === '2') return 'definitivo';
  if (first === '7' || first === '8' || first === '9') return 'provisorio';
  return 'desconhecido';
}

function weightedSum(digits: string, startWeight: number): number {
  let weight = startWeight;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10) * weight;
    weight -= 1;
  }
  return sum;
}

export function isValidCnsDefinitivo(cns: string): boolean {
  const clean = cleanCns(cns);
  if (clean.length !== 15 || !/^\d{15}$/.test(clean)) {
    return false;
  }
  if (clean[0] !== '1' && clean[0] !== '2') {
    return false;
  }

  const pis = clean.slice(0, 11);
  let sum = weightedSum(pis, 15); // pesos 15..5
  let remainder = sum % 11;
  let dv = 11 - remainder;
  if (dv === 11) dv = 0;

  let expected: string;
  if (dv === 10) {
    // Regra alternativa: soma + 2 e usa sufixo 001
    sum = weightedSum(pis, 15) + 2;
    remainder = sum % 11;
    dv = 11 - remainder;
    expected = `${pis}001${dv}`;
  } else {
    expected = `${pis}000${dv}`;
  }

  return clean === expected;
}

export function isValidCnsProvisorio(cns: string): boolean {
  const clean = cleanCns(cns);
  if (clean.length !== 15 || !/^\d{15}$/.test(clean)) {
    return false;
  }
  if (!['7', '8', '9'].includes(clean[0])) {
    return false;
  }

  const sum = weightedSum(clean, 15); // pesos 15..1
  return sum % 11 === 0;
}

export function isValidCns(cns: string): boolean {
  const type = detectCnsType(cns);
  if (type === 'definitivo') return isValidCnsDefinitivo(cns);
  if (type === 'provisorio') return isValidCnsProvisorio(cns);
  return false;
}

function tryExtractCpfFromDefinitive(cns: string): { cpf?: string | null; cpfFormatted?: string | null; hasCpf: boolean } {
  const clean = cleanCns(cns);
  if (clean.length !== 15 || (clean[0] !== '1' && clean[0] !== '2')) {
    return { hasCpf: false, cpf: null, cpfFormatted: null };
  }

  // Muitos cartões definitivos usam um identificador baseado em PIS/CPF-like com 11 dígitos.
  // Tentamos interpretar os 11 primeiros dígitos como CPF e validar.
  const candidateCpf = clean.slice(0, 11);
  if (isValidCpf(candidateCpf)) {
    const normalized = cleanCpf(candidateCpf);
    return {
      hasCpf: true,
      cpf: normalized,
      cpfFormatted: formatCpf(normalized),
    };
  }

  return { hasCpf: false, cpf: null, cpfFormatted: null };
}

export function parseCns(cns: string): ParsedCns {
  const clean = cleanCns(cns);

  if (!/^\d{15}$/.test(clean)) {
    return {
      cns: clean,
      formatted: cns,
      type: 'desconhecido',
      isValid: false,
      hasCpf: false,
      cpf: null,
      cpfFormatted: null,
      error: 'Formato inválido. O CNS deve conter exatamente 15 dígitos numéricos.',
    };
  }

  const type = detectCnsType(clean);
  let isValid = false;
  let error: string | undefined;

  if (type === 'definitivo') {
    isValid = isValidCnsDefinitivo(clean);
    if (!isValid) {
      error = 'CNS definitivo inválido (falha no dígito verificador).';
    }
  } else if (type === 'provisorio') {
    isValid = isValidCnsProvisorio(clean);
    if (!isValid) {
      error = 'CNS provisório inválido (falha na soma ponderada módulo 11).';
    }
  } else {
    error = 'Tipo de CNS desconhecido. Deve iniciar com 1, 2, 7, 8 ou 9.';
  }

  const { hasCpf, cpf, cpfFormatted } = type === 'definitivo' ? tryExtractCpfFromDefinitive(clean) : { hasCpf: false, cpf: null, cpfFormatted: null };

  return {
    cns: clean,
    formatted: formatCns(clean),
    type,
    isValid,
    hasCpf,
    cpf,
    cpfFormatted,
    error,
  };
}

// ----------------------------
// Geração de CNS
// ----------------------------

function hashStringToInt(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRandom(seed: string): () => number {
  let state = hashStringToInt(seed) || 1;
  return () => {
    // LCG simples para determinismo
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pickRandomDigit(randomFn: () => number): string {
  return Math.floor(randomFn() * 10).toString();
}

export type GenerateCnsOptions = {
  type?: CnsType | 'auto';
  cpf?: string;
  seed?: string;
};

export function generateCnsDefinitivoFromCpf(cpf: string): string {
  const cleanedCpf = cleanCpf(cpf);
  if (!isValidCpf(cleanedCpf)) {
    throw new Error('CPF inválido para geração de CNS definitivo.');
  }

  // Usa os 11 dígitos do CPF como base PIS, prefixando com 1 (cartão definitivo a partir de CPF)
  const pis = cleanedCpf;
  let sum = weightedSum(pis, 15);
  let remainder = sum % 11;
  let dv = 11 - remainder;
  if (dv === 11) dv = 0;

  if (dv === 10) {
    sum = weightedSum(pis, 15) + 2;
    remainder = sum % 11;
    dv = 11 - remainder;
    return `${pis}001${dv}`;
  }

  return `${pis}000${dv}`;
}

export function generateRandomCnsDefinitivo(seed?: string): string {
  const random = seed ? createSeededRandom(seed) : Math.random;

  // Gera 11 dígitos baseando-se em um identificador tipo PIS/CPF-like.
  let pis = '';
  pis += random() < 0.5 ? '1' : '2'; // tipo definitivo
  for (let i = 1; i < 11; i++) {
    pis += pickRandomDigit(random);
  }

  let sum = weightedSum(pis, 15);
  let remainder = sum % 11;
  let dv = 11 - remainder;
  if (dv === 11) dv = 0;

  if (dv === 10) {
    sum = weightedSum(pis, 15) + 2;
    remainder = sum % 11;
    dv = 11 - remainder;
    return `${pis}001${dv}`;
  }

  return `${pis}000${dv}`;
}

export function generateRandomCnsProvisorio(seed?: string): string {
  const random = seed ? createSeededRandom(seed) : Math.random;

  // Primeiro dígito: 7, 8 ou 9
  const firstOptions = ['7', '8', '9'];
  const first = firstOptions[Math.floor(random() * firstOptions.length)]!;

  let digits = first;
  for (let i = 1; i < 14; i++) {
    digits += pickRandomDigit(random);
  }

  // Calcular último dígito para que soma ponderada 15..1 seja múltiplo de 11
  const partialSum = weightedSum(digits, 15); // usa pesos 15..2 para 14 dígitos
  let lastDigit = 0;
  for (let d = 0; d <= 9; d++) {
    const total = partialSum + d * 1;
    if (total % 11 === 0) {
      lastDigit = d;
      break;
    }
  }

  return digits + lastDigit.toString();
}

export function generateCns(options: GenerateCnsOptions = {}): { cns: string; type: CnsType; hasCpf: boolean; cpf?: string | null; cpfFormatted?: string | null } {
  const { type = 'auto', cpf, seed } = options;

  if (cpf) {
    const cns = generateCnsDefinitivoFromCpf(cpf);
    const parsed = parseCns(cns);
    return {
      cns,
      type: parsed.type,
      hasCpf: parsed.hasCpf,
      cpf: parsed.cpf,
      cpfFormatted: parsed.cpfFormatted,
    };
  }

  let chosenType: CnsType;
  if (type === 'auto' || type === 'desconhecido') {
    chosenType = 'definitivo';
  } else {
    chosenType = type;
  }

  const perItemSeed = seed ? `${seed}:${chosenType}` : undefined;
  let cns: string;
  if (chosenType === 'definitivo') {
    cns = generateRandomCnsDefinitivo(perItemSeed);
  } else {
    cns = generateRandomCnsProvisorio(perItemSeed);
  }

  const parsed = parseCns(cns);
  return {
    cns,
    type: parsed.type,
    hasCpf: parsed.hasCpf,
    cpf: parsed.cpf,
    cpfFormatted: parsed.cpfFormatted,
  };
}

