const STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'os', 'as', 'em', 'com',
  'para', 'por', 'que', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'ser', 'ter',
  'ou', 'ao', 'aos', 'se', 'etc', 'the', 'and', 'or', 'in', 'of', 'to',
]);

function normalizar(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extrairKeywords(texto) {
  return normalizar(texto)
    .split(' ')
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
}

function calcularScore(candidato, vaga) {
  let score = 0;

  // 1. Tipo de deficiência (40 pts)
  const foco = vaga.tipo_deficiencia_foco;
  if (!foco || foco === 'Qualquer') {
    score += 40;
  } else if (candidato.tipo_deficiencia === foco) {
    score += 40;
  } else {
    score += 10;
  }

  // 2. Correspondência de palavras-chave (50 pts)
  const vagaKeywords = extrairKeywords(
    `${vaga.titulo} ${vaga.descricao} ${vaga.requisitos}`
  );
  if (vagaKeywords.length > 0) {
    const candidatoTexto = normalizar(
      `${candidato.habilidades || ''} ${candidato.sobre || ''} ${candidato.formacao || ''} ${candidato.experiencias || ''}`
    );
    const hits = vagaKeywords.filter(w => candidatoTexto.includes(w)).length;
    // ratio >= 0.33 → pontuação máxima (generoso para apresentações)
    score += Math.min(50, Math.round((hits / vagaKeywords.length) * 150));
  }

  // 3. Completude do perfil (10 pts)
  if (candidato.curriculo_url) score += 5;
  if (candidato.laudo_medico_url) score += 3;
  if (candidato.foto_url) score += 2;

  return Math.min(100, score);
}

function nivel(score) {
  if (score >= 70) return 'Alto';
  if (score >= 40) return 'Médio';
  return 'Baixo';
}

function rankearCandidatos(candidatos, vaga) {
  return candidatos
    .map(c => ({ ...c, score: calcularScore(c, vaga), nivel: nivel(calcularScore(c, vaga)) }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { rankearCandidatos };
