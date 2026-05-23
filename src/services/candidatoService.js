const CandidatoRepository = require('../repositories/candidatoRepository');

class CandidatoService {
  async salvarCaminhoLaudo(usuarioId, url) {
    const perfil = await CandidatoRepository.atualizarColunaLaudo(usuarioId, url);
    if (!perfil) { const e = new Error('Perfil de candidato não encontrado.'); e.status = 404; throw e; }
    return perfil;
  }

  async salvarCurriculo(usuarioId, urlCurriculo, nome, sobre) {
    const perfil = await CandidatoRepository.atualizarCurriculo(usuarioId, urlCurriculo, nome, sobre);
    if (!perfil) { const e = new Error('Perfil de candidato não encontrado.'); e.status = 404; throw e; }
    return perfil;
  }
}

module.exports = new CandidatoService();
