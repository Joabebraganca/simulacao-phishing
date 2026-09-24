// =============================================================================
// Parser de CSV de destinatarios — usado na importacao do painel (Fase 1).
//
// Aceita as colunas nome, email, setor. Detecta virgula OU ponto-e-virgula
// (Excel PT-BR costuma exportar com ";"). Se houver cabecalho, mapeia pelas
// colunas; se nao, assume a ordem nome,email,setor. Lida com campos entre aspas.
//
// So o e-mail e obrigatorio. Linhas sem "@" sao ignoradas, e e-mails repetidos
// dentro do mesmo arquivo sao deduplicados (o banco tambem tem unique por
// campanha+email como rede de seguranca).
// =============================================================================

export interface LinhaDestinatario {
  nome: string | null;
  email: string;
  setor: string | null;
}

function detectarDelimitador(linha: string): string {
  const pv = (linha.match(/;/g) ?? []).length;
  const vg = (linha.match(/,/g) ?? []).length;
  return pv > vg ? ";" : ",";
}

// Divide uma linha respeitando aspas duplas ("a,b" vira um campo so).
function dividir(linha: string, delim: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (dentroAspas) {
      if (ch === '"') {
        if (linha[i + 1] === '"') {
          atual += '"'; // aspas escapadas ("")
          i++;
        } else {
          dentroAspas = false;
        }
      } else {
        atual += ch;
      }
    } else if (ch === '"') {
      dentroAspas = true;
    } else if (ch === delim) {
      campos.push(atual);
      atual = "";
    } else {
      atual += ch;
    }
  }
  campos.push(atual);
  return campos;
}

export function parseCsvDestinatarios(texto: string): LinhaDestinatario[] {
  const linhas = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (linhas.length === 0) return [];

  const delim = detectarDelimitador(linhas[0]);
  const cabecalho = dividir(linhas[0], delim).map((c) => c.trim().toLowerCase());
  const temCabecalho =
    cabecalho.includes("email") || cabecalho.includes("e-mail");

  // Com cabecalho: mapeia pelas colunas nomeadas.
  const idxEmail = temCabecalho
    ? cabecalho.findIndex((c) => c === "email" || c === "e-mail")
    : -1;
  const idxNome = temCabecalho
    ? cabecalho.findIndex((c) => c === "nome" || c === "name")
    : -1;
  const idxSetor = temCabecalho
    ? cabecalho.findIndex(
        (c) => c === "setor" || c === "departamento" || c === "setor/departamento",
      )
    : -1;

  const inicio = temCabecalho ? 1 : 0;
  const resultado: LinhaDestinatario[] = [];
  const vistos = new Set<string>();

  for (let i = inicio; i < linhas.length; i++) {
    const cols = dividir(linhas[i], delim).map((c) => c.trim());

    let email: string;
    let nome: string | null;
    let setor: string | null;

    if (temCabecalho) {
      email = (idxEmail >= 0 ? cols[idxEmail] ?? "" : "").toLowerCase();
      nome = idxNome >= 0 ? cols[idxNome] || null : null;
      setor = idxSetor >= 0 ? cols[idxSetor] || null : null;
    } else {
      // Sem cabecalho: o e-mail e o campo que contem "@" (assim funciona tanto
      // "nome,email,setor" quanto uma coluna unica so de e-mails). Nome e setor
      // sao os demais campos, na ordem em que aparecem.
      const idx = cols.findIndex((c) => c.includes("@"));
      if (idx === -1) continue;
      email = cols[idx].toLowerCase();
      const resto = cols.filter((_, j) => j !== idx && cols[j] !== "");
      nome = resto[0] || null;
      setor = resto[1] || null;
    }

    // E-mail e o unico campo obrigatorio; sem "@" nao entra.
    if (!email || !email.includes("@")) continue;
    if (vistos.has(email)) continue;
    vistos.add(email);

    resultado.push({ nome, email, setor });
  }

  return resultado;
}
