const CandidatoRepository = require('../repositories/candidatoRepository');

class CandidatoService {
  async salvarCaminhoLaudo(usuarioId, url) {
    const perfil = await CandidatoRepository.atualizarColunaLaudo(usuarioId, url);
    if (!perfil) { const e = new Error('Perfil de candidato não encontrado.'); e.status = 404; throw e; }
    return perfil;
  }

  async buscarPerfil(usuarioId) {
    return await CandidatoRepository.buscarPerfil(usuarioId);
  }

  async salvarCurriculo(usuarioId, urlCurriculo, nome, sobre, telefone) {
    const perfil = await CandidatoRepository.atualizarCurriculo(usuarioId, urlCurriculo, nome, sobre, telefone);
    if (!perfil) { const e = new Error('Perfil não encontrado.'); e.status = 404; throw e; }
    return perfil;
  }

  async atualizarInfos(usuarioId, nome, sobre, telefone, formacao, experiencias, habilidades) {
    return await CandidatoRepository.atualizarInfos(usuarioId, nome, sobre, telefone, formacao, experiencias, habilidades);
  }

  async removerCurriculo(usuarioId) {
    return await CandidatoRepository.removerCurriculo(usuarioId);
  }
  async removerLaudo(usuarioId) {
    return await CandidatoRepository.removerLaudo(usuarioId);
  }
  async atualizarFoto(usuarioId, fotoUrl) {
    return await CandidatoRepository.atualizarFoto(usuarioId, fotoUrl);
  }

  async removerFoto(usuarioId) {
    return await CandidatoRepository.removerFoto(usuarioId);
  }
}

module.exports = new CandidatoService();
