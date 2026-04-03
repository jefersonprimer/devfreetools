export type CertidaoNascimentoData = {
  numeroCertidao: string;
  livro: string;
  folha: string;
  termo: string;
  dataRegistro: string; // pt-BR
  dataNascimento: string; // pt-BR
  cidade: string;
  uf: string;
  sexo: 'M' | 'F';
  nomeRegistrado: string;
  pai: string;
  mae: string;
  cartorio: string;
  oficial: string;
  codigoCertidao: string;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function padLeft(value: number, size: number): string {
  return value.toString().padStart(size, '0');
}

function randomInt(min: number, max: number): number {
  // inclusive min, exclusive max
  return Math.floor(min + Math.random() * (max - min));
}

function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatPtBrDate(date: Date): string {
  // Mantem output em ASCII (evita meses com acentos via toLocaleDateString)
  const dd = padLeft(date.getDate(), 2);
  const mm = padLeft(date.getMonth() + 1, 2);
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function generatePersonFullName(sexo: 'M' | 'F', lastNames: string[]): string {
  const maleFirstNames = [
    'Joao',
    'Pedro',
    'Lucas',
    'Gabriel',
    'Matheus',
    'Rafael',
    'Bruno',
    'Guilherme',
    'Thiago',
    'Daniel',
    'Felipe',
    'Eduardo',
    'Marcos',
    'Rodrigo',
  ];
  const femaleFirstNames = [
    'Maria',
    'Ana',
    'Beatriz',
    'Carolina',
    'Camila',
    'Fernanda',
    'Juliana',
    'Mariana',
    'Larissa',
    'Patricia',
    'Sofia',
    'Amanda',
    'Aline',
    'Renata',
  ];

  const firstName = sexo === 'M' ? pick(maleFirstNames) : pick(femaleFirstNames);
  const last1 = pick(lastNames);
  const last2 = Math.random() > 0.55 ? pick(lastNames) : '';
  return `${firstName} ${last1}${last2 ? ` ${last2}` : ''}`;
}

const UFS: Array<{ uf: string; cidades: string[] }> = [
  { uf: 'SP', cidades: ['Sao Paulo', 'Campinas', 'Santos', 'Ribeirao Preto', 'Guarulhos'] },
  { uf: 'RJ', cidades: ['Rio de Janeiro', 'Niteroi', 'Duque de Caxias', 'Petropolis'] },
  { uf: 'MG', cidades: ['Belo Horizonte', 'Uberlandia', 'Contagem', 'Betim', 'Juiz de Fora'] },
  { uf: 'PR', cidades: ['Curitiba', 'Londrina', 'Maringa', 'Cascavel'] },
  { uf: 'SC', cidades: ['Florianopolis', 'Joinville', 'Blumenau', 'Itajai'] },
  { uf: 'RS', cidades: ['Porto Alegre', 'Canoas', 'Pelotas', 'Santa Maria'] },
  { uf: 'BA', cidades: ['Salvador', 'Feira de Santana', 'Vitoria da Conquista'] },
  { uf: 'PE', cidades: ['Recife', 'Olinda', 'Jaboatao dos Guararapes'] },
  { uf: 'CE', cidades: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'] },
  { uf: 'DF', cidades: ['Brasilia'] },
];

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Pereira',
  'Lima',
  'Almeida',
  'Rocha',
  'Carvalho',
  'Ferreira',
  'Gomes',
  'Ribeiro',
  'Mendes',
  'Azevedo',
  'Barbosa',
  'Teixeira',
];

export function generateCertidaoNascimento(): CertidaoNascimentoData & { value: string; formatted: string } {
  const ufEntry = pick(UFS);
  const uf = ufEntry.uf;
  const cidade = pick(ufEntry.cidades);

  const sexo: 'M' | 'F' = Math.random() > 0.5 ? 'M' : 'F';
  const nomeRegistrado = generatePersonFullName(sexo, LAST_NAMES).toUpperCase();

  const pai = generatePersonFullName('M', LAST_NAMES).toUpperCase();
  const mae = generatePersonFullName('F', LAST_NAMES).toUpperCase();

  const cartorio = `CARTORIO DE REGISTRO CIVIL DAS PESSOAS NATURAIS DE ${cidade.toUpperCase()}`;
  const oficial = generatePersonFullName(Math.random() > 0.5 ? 'M' : 'F', LAST_NAMES).toUpperCase();

  const now = new Date();
  const startBirth = new Date(now.getTime() - 25 * 365 * 24 * 60 * 60 * 1000);
  const endBirth = new Date(now.getTime() - 1 * 365 * 24 * 60 * 60 * 1000);
  const dataNascimentoDate = randomDateBetween(startBirth, endBirth);
  const dataNascimento = formatPtBrDate(dataNascimentoDate);

  const dataRegistroDate = randomDateBetween(
    new Date(dataNascimentoDate.getTime() + 10 * 24 * 60 * 60 * 1000),
    new Date(dataNascimentoDate.getTime() + 6 * 365 * 24 * 60 * 60 * 1000)
  );
  const dataRegistro = formatPtBrDate(dataRegistroDate);

  const livro = padLeft(randomInt(1, 9999), 4);
  const folha = padLeft(randomInt(1, 9999), 4);
  const termo = padLeft(randomInt(1, 99999), 5);

  const numeroCertidao = `${livro}/${folha}/${termo}/${dataRegistroDate.getFullYear()}`;
  const codigoCertidao = `${padLeft(randomInt(0, 999999), 6)}-${padLeft(randomInt(0, 999999), 6)}`;

  const formatted = [
    'CERTIDAO DE NASCIMENTO',
    '',
    `NUMERO DA CERTIDAO: ${numeroCertidao}`,
    `LIVRO: ${livro}   FOLHA: ${folha}   TERMO: ${termo}`,
    `REGISTRADO EM: ${dataRegistro}`,
    '',
    `NASCIDO EM: ${dataNascimento}`,
    `LOCAL DE NASCIMENTO: ${cidade.toUpperCase()}/${uf}`,
    `SEXO: ${sexo === 'M' ? 'MASCULINO' : 'FEMININO'}`,
    '',
    `NOME: ${nomeRegistrado}`,
    '',
    'FILIACAO:',
    `PAI: ${pai}`,
    `MAE: ${mae}`,
    '',
    `CARTORIO: ${cartorio}`,
    `OFICIAL: ${oficial}`,
    `CODIGO DA CERTIDAO: ${codigoCertidao}`,
    '',
    'OBSERVACAO:',
    'Documento gerado automaticamente para fins de teste. Nao possui valor juridico.',
  ].join('\n');

  return {
    numeroCertidao,
    livro,
    folha,
    termo,
    dataRegistro,
    dataNascimento,
    cidade,
    uf,
    sexo,
    nomeRegistrado,
    pai,
    mae,
    cartorio,
    oficial,
    codigoCertidao,
    value: formatted,
    formatted,
  };
}

