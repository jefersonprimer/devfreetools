/**
 * CPF validation utilities
 * Valida formato, dígitos verificadores e heurísticas de prováveis falsos
 */

const BLACKLISTED_CPFS = new Set([
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12345678909',
  '01234567890',
  '98765432100',
  '99999999999',
]);

const CPF_MASK_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function isValidCpfFormat(cpf: string): boolean {
  const clean = cleanCpf(cpf);

  if (clean.length !== 11 || !/^\d{11}$/.test(clean)) {
    return false;
  }

  // Caso haja máscara, exige formato consistente para não aceitar misto
  if (cpf.includes('.') || cpf.includes('-')) {
    if (!CPF_MASK_PATTERN.test(cpf)) {
      return false;
    }
  }

  // Rejeita sequências iguais como parte da validação básica
  if (/^(\d)\1{10}$/.test(clean)) {
    return false;
  }

  return true;
}

function calculateCpfDigit(base: string, factor: number): number {
  let total = 0;
  for (let i = 0; i < base.length; i++) {
    total += parseInt(base[i], 10) * (factor - i);
  }

  const rest = total % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidCpfChecksum(cpf: string): boolean {
  const clean = cleanCpf(cpf);

  if (clean.length !== 11 || !/^\d{11}$/.test(clean)) {
    return false;
  }

  const firstNine = clean.slice(0, 9);
  const firstDigit = calculateCpfDigit(firstNine, 10);
  const secondDigit = calculateCpfDigit(firstNine + firstDigit, 11);

  return firstDigit === Number(clean[9]) && secondDigit === Number(clean[10]);
}

export function isBlacklistedCpf(cpf: string): boolean {
  const clean = cleanCpf(cpf);
  return BLACKLISTED_CPFS.has(clean);
}

export function isLikelyFakeCpf(cpf: string): boolean {
  const clean = cleanCpf(cpf);
  const prefix9 = clean.slice(0, 9);

  // Identificar sequências numéricas óbvias (ascendente / descendente)
  if (prefix9 === '123456789' || prefix9 === '987654321') {
    return true;
  }

  // Se muitos dígitos são iguais, pode ser falso
  const uniqueDigits = new Set(clean).size;
  if (uniqueDigits <= 3) {
    return true;
  }

  // Se contém padrão consecutivo curtos como 1234, 4321 repetidos em vários pontos
  const consecutive = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654'];
  if (consecutive.some((seq) => prefix9.includes(seq))) {
    return true;
  }

  return false;
}

export function isValidCpf(cpf: string): boolean {
  if (!isValidCpfFormat(cpf)) {
    return false;
  }

  if (!isValidCpfChecksum(cpf)) {
    return false;
  }

  return true;
}

export function isValidCpfSmart(cpf: string): boolean {
  if (!isValidCpf(cpf)) {
    return false;
  }

  if (isBlacklistedCpf(cpf)) {
    return false;
  }

  if (isLikelyFakeCpf(cpf)) {
    return false;
  }

  return true;
}

export function formatCpf(cpf: string): string {
  const clean = cleanCpf(cpf);
  if (clean.length !== 11) {
    return cpf;
  }
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

export function parseCpf(cpf: string): {
  cpf: string;
  formatted: string;
  isValid: boolean;
  isSmartValid: boolean;
  error?: string;
} {
  const clean = cleanCpf(cpf);

  if (!isValidCpfFormat(cpf)) {
    return {
      cpf: clean,
      formatted: cpf,
      isValid: false,
      isSmartValid: false,
      error: 'Invalid CPF format. Must be 11 digits, optionally masked as xxx.xxx.xxx-xx.',
    };
  }

  const isValid = isValidCpf(cpf);
  const isSmart = isValidCpfSmart(cpf);

  if (!isValid) {
    return {
      cpf: clean,
      formatted: formatCpf(clean),
      isValid: false,
      isSmartValid: false,
      error: 'Invalid CPF checksum or structure.',
    };
  }

  if (!isSmart) {
    return {
      cpf: clean,
      formatted: formatCpf(clean),
      isValid: true,
      isSmartValid: false,
      error: 'CPF appears suspicious based on known blacklists or heuristics.',
    };
  }

  return {
    cpf: clean,
    formatted: formatCpf(clean),
    isValid: true,
    isSmartValid: true,
  };
}

export function generateValidCpf(): string {
  let base = '';
  do {
    base = '';
    for (let i = 0; i < 9; i++) {
      base += Math.floor(Math.random() * 10).toString();
    }
  } while (/^(\d)\1{8}$/.test(base) || BLACKLISTED_CPFS.has(base + '00'));

  const firstDigit = calculateCpfDigit(base, 10);
  const secondDigit = calculateCpfDigit(base + firstDigit.toString(), 11);

  return `${base}${firstDigit}${secondDigit}`;
}
