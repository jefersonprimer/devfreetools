/**
 * CNPJ validation utilities
 * Valida formato, dígitos verificadores e se o CNPJ é válido
 */

/**
 * Remover caracteres especiais do CNPJ
 */
export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Validar formato do CNPJ (14 dígitos)
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const clean = cleanCnpj(cnpj);
  return clean.length === 14 && /^\d+$/.test(clean);
}

/**
 * Calcular o primeiro dígito verificador
 */
function calculateFirstDigit(cnpj: string): number {
  let sum = 0;
  let multiplier = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  const remainder = sum % 11;
  const result = remainder < 2 ? 0 : 11 - remainder;
  return result;
}

/**
 * Calcular o segundo dígito verificador
 */
function calculateSecondDigit(cnpj: string): number {
  let sum = 0;
  let multiplier = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  const remainder = sum % 11;
  const result = remainder < 2 ? 0 : 11 - remainder;
  return result;
}

/**
 * Validar dígitos verificadores do CNPJ
 * Algoritmo oficial da Receita Federal
 */
export function isValidCnpjChecksum(cnpj: string): boolean {
  const clean = cleanCnpj(cnpj);

  if (!isValidCnpjFormat(clean)) {
    return false;
  }

  // CNPJ com todos os dígitos iguais é inválido
  if (/^(\d)\1{13}$/.test(clean)) {
    return false;
  }

  const firstDigit = calculateFirstDigit(clean);
  const secondDigit = calculateSecondDigit(clean);

  return (
    parseInt(clean[12]) === firstDigit &&
    parseInt(clean[13]) === secondDigit
  );
}

/**
 * Validação completa de CNPJ
 * Verifica formato e dígitos verificadores
 */
export function isValidCnpj(cnpj: string): boolean {
  return isValidCnpjFormat(cnpj) && isValidCnpjChecksum(cnpj);
}

/**
 * Formatar CNPJ para exibição
 * Entrada: 12345678000195
 * Saída: 12.345.678/0001-95
 */
export function formatCnpj(cnpj: string): string {
  const clean = cleanCnpj(cnpj);

  if (!isValidCnpjFormat(clean)) {
    return cnpj;
  }

  return `${clean.substring(0, 2)}.${clean.substring(2, 5)}.${clean.substring(
    5,
    8
  )}/${clean.substring(8, 12)}-${clean.substring(12)}`;
}

/**
 * Extrair informações do CNPJ
 */
export function parseCnpj(cnpj: string): {
  cnpj: string;
  formatted: string;
  branch: string;
  sequence: string;
  isValid: boolean;
  error?: string;
} {
  const clean = cleanCnpj(cnpj);

  if (!isValidCnpjFormat(clean)) {
    return {
      cnpj: clean,
      formatted: cnpj,
      branch: '',
      sequence: '',
      isValid: false,
      error: 'Invalid CNPJ format. Must have 14 digits.',
    };
  }

  if (!isValidCnpjChecksum(clean)) {
    return {
      cnpj: clean,
      formatted: formatCnpj(clean),
      branch: clean.substring(8, 12),
      sequence: clean.substring(12),
      isValid: false,
      error: 'Invalid CNPJ checksum.',
    };
  }

  return {
    cnpj: clean,
    formatted: formatCnpj(clean),
    branch: clean.substring(8, 12), // Filial
    sequence: clean.substring(12), // Dígitos verificadores
    isValid: true,
  };
}

/**
 * Gerar um CNPJ válido aleatório para testes
 * Gera 12 dígitos aleatórios e calcula os dígitos verificadores
 */
export function generateValidCnpj(): string {
  let base: string;

  do {
    // Gerar 12 dígitos aleatórios
    base = '';
    for (let i = 0; i < 12; i++) {
      base += Math.floor(Math.random() * 10).toString();
    }
  } while (/^(\d)\1{11}$/.test(base)); // Evitar sequências repetidas

  // Calcular primeiro dígito verificador
  const firstDigit = calculateFirstDigit(base);

  // Adicionar primeiro dígito e calcular segundo
  const withFirstDigit = base + firstDigit.toString();
  const secondDigit = calculateSecondDigit(withFirstDigit);

  // Retornar CNPJ completo
  return base + firstDigit.toString() + secondDigit.toString();
}
