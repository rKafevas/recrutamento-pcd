const InscricaoRepository = require('../repositories/inscricaoRepository');
const CandidatoRepository = require('../repositories/candidatoRepository');
const LogRepository = require('../repositories/logRepository');

class InscricaoService {
  async seCandidatar(usuarioId, vagaId) {
    const candidato = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!candidato) {
      const error = new Error('Perfil de candidato não encontrado.');
      error.status = 404;
      throw error;
    }

    const jaInscrito = await InscricaoRepository.buscarInscricaoEspecifica(candidato.id, vagaId);
    if (jaInscrito) {
      const error = new Error('Você já está inscrito nesta vaga.');
      error.status = 409;
      throw error;
    }

    const inscricao = await InscricaoRepository.criar(candidato.id, vagaId);
    await LogRepository.registrar(usuarioId, `Candidatura realizada na vaga ID ${vagaId}`);
    return inscricao;
  }

  async verMinhasInscricoes(usuarioId) {
    const candidato = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!candidato) return [];
    const lista = await InscricaoRepository.listarPorCandidato(candidato.id);
    return lista || [];
  }

  async listarInscritosPorVaga(vagaId) {
    const inscritos = await InscricaoRepository.listarPorVaga(vagaId);
    if (!inscritos) {
      const error = new Error('Vaga não encontrada ou sem inscritos.');
      error.status = 404;
      throw error;
    }
    return inscritos;
  }

  async alterarStatus(id, novoStatus) {
    const statusPermitidos = ['Pendente', 'Aprovado', 'Reprovado', 'Entrevista'];
    if (!statusPermitidos.includes(novoStatus)) {
      const error = new Error(`Status inválido. Escolha entre: ${statusPermitidos.join(', ')}`);
      error.status = 400;
      throw error;
    }
    const atualizada = await InscricaoRepository.atualizarStatus(id, novoStatus);
    if (!atualizada) { const e = new Error('Inscrição não encontrada.'); e.status = 404; throw e; }
    await LogRepository.registrar(null, `Status da inscrição ID ${id} alterado para "${novoStatus}"`);
    return atualizada;
  }
}

module.exports = new InscricaoService();
