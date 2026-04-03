export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};

const VIACEP_BASE_URL = 'https://viacep.com.br/ws';
const CEP_PATTERN = /^\d{8}$/;

export function cleanCep(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCepFormat(value: string): boolean {
  return CEP_PATTERN.test(cleanCep(value));
}

function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// CEP ranges per Brazilian state (min inclusive, max inclusive)
const CEP_RANGES: Record<string, [number, number][]> = {
  SP: [[1000000, 19999999]],
  RJ: [[20000000, 28999999]],
  ES: [[29000000, 29999999]],
  MG: [[30000000, 39999999]],
  BA: [[40000000, 48999999]],
  SE: [[49000000, 49999999]],
  PE: [[50000000, 56999999]],
  AL: [[57000000, 57999999]],
  PB: [[58000000, 58999999]],
  RN: [[59000000, 59999999]],
  CE: [[60000000, 63999999]],
  PI: [[64000000, 64999999]],
  MA: [[65000000, 65999999]],
  PA: [[66000000, 68899999]],
  AP: [[68900000, 68999999]],
  AM: [[69000000, 69299999], [69400000, 69899999]],
  RR: [[69300000, 69399999]],
  AC: [[69900000, 69999999]],
  DF: [[70000000, 72799999], [73000000, 73699999]],
  GO: [[72800000, 72999999], [73700000, 76799999]],
  TO: [[77000000, 77999999]],
  MT: [[78000000, 78899999]],
  RO: [[76800000, 76999999]],
  MS: [[79000000, 79999999]],
  PR: [[80000000, 87999999]],
  SC: [[88000000, 89999999]],
  RS: [[90000000, 99999999]],
};

function randomCepFromRange(nextFloat: () => number, ranges: [number, number][]): string {
  // Pick a random range weighted by size
  const sizes = ranges.map(([min, max]) => max - min + 1);
  const total = sizes.reduce((a, b) => a + b, 0);
  let pick = Math.floor(nextFloat() * total);
  let rangeIndex = 0;
  for (let i = 0; i < sizes.length; i++) {
    pick -= sizes[i];
    if (pick < 0) {
      rangeIndex = i;
      break;
    }
  }
  const [min, max] = ranges[rangeIndex];
  const value = min + Math.floor(nextFloat() * (max - min + 1));
  return value.toString().padStart(8, '0');
}

function randomCepFromGenerator(nextFloat: () => number): string {
  const value = Math.floor(nextFloat() * 100000000);
  return value.toString().padStart(8, '0');
}

export async function lookupViaCep(cep: string): Promise<ViaCepAddress | null> {
  const clean = cleanCep(cep);
  if (!CEP_PATTERN.test(clean)) {
    return null;
  }

  const response = await fetch(`${VIACEP_BASE_URL}/${clean}/json/`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`ViaCEP request failed with status ${response.status}`);
  }

  const data = (await response.json()) as ViaCepAddress;
  if (data.erro) {
    return null;
  }

  return data;
}

/**
 * Search addresses using ViaCEP's search API.
 * Endpoint: GET /ws/{UF}/{Cidade}/{Logradouro}/json/
 * Returns up to 50 results from ViaCEP.
 */
async function searchViaCep(uf: string, cidade: string): Promise<ViaCepAddress[]> {
  // ViaCEP requires at least 3 characters for logradouro; use a common prefix
  const logradouros = ['Rua', 'Avenida', 'Praca', 'Travessa', 'Alameda'];
  const allResults: ViaCepAddress[] = [];

  for (const logradouro of logradouros) {
    try {
      const url = `${VIACEP_BASE_URL}/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (Array.isArray(data)) {
        allResults.push(...data);
      }

      // Stop early if we have enough variety
      if (allResults.length >= 100) break;
    } catch {
      continue;
    }
  }

  return allResults;
}

type GenerateOptions = {
  count: number;
  seed?: number;
  uf?: string;
  cidade?: string;
  maxAttemptsPerItem?: number;
};

export async function generateAddressesViaCep(options: GenerateOptions): Promise<ViaCepAddress[]> {
  const { count, seed, uf, cidade, maxAttemptsPerItem = 80 } = options;
  const rng = typeof seed === 'number' ? seededRandom(seed) : Math.random;
  const results: ViaCepAddress[] = [];

  const ufNormalized = uf?.trim().toUpperCase();
  const cidadeNormalized = cidade?.trim().toLowerCase();

  // Strategy 1: When both UF and cidade are provided, use ViaCEP search API
  if (ufNormalized && cidadeNormalized) {
    const searchResults = await searchViaCep(ufNormalized, cidade!.trim());

    if (searchResults.length > 0) {
      // Shuffle using our rng and pick `count` items
      const shuffled = [...searchResults];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    }
    // If search returned nothing, fall through to random generation
  }

  // Strategy 2: Use state-specific CEP ranges when UF is provided
  const ranges = ufNormalized ? CEP_RANGES[ufNormalized] : undefined;

  let totalAttempts = 0;
  const maxAttempts = Math.max(count, 1) * maxAttemptsPerItem;

  while (results.length < count && totalAttempts < maxAttempts) {
    totalAttempts += 1;

    const cep = ranges
      ? randomCepFromRange(rng, ranges)
      : randomCepFromGenerator(rng);

    const found = await lookupViaCep(cep);

    if (!found) {
      continue;
    }

    if (ufNormalized && found.uf.toUpperCase() !== ufNormalized) {
      continue;
    }

    if (cidadeNormalized && found.localidade.trim().toLowerCase() !== cidadeNormalized) {
      continue;
    }

    results.push(found);
  }

  return results;
}
