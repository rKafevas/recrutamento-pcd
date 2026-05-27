const VagaRepository = require('../repositories/vagaRepository');
const CandidatoRepository = require('../repositories/candidatoRepository');

class VagaService {
  async anunciarVaga(rh_id, dados) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(rh_id);
      if (!empresa) {
        const e = new Error('Perfil de empresa não encontrado para este usuário.');
        e.status = 404; throw e;
      }
      return await VagaRepository.criarVaga(empresa.id, dados);
    } catch (err) {
      if (err.status) throw err;
      console.error("Erro no Service ao criar vaga:", err);
      throw new Error("Não foi possível publicar a vaga. Tente novamente mais tarde.");
    }
  }

  async buscarPorId(id) {
    return await VagaRepository.buscarPorId(id);
  }

  async listarComFiltro({ deficiencia, modelo, busca, pagina, limite }) {
    return await VagaRepository.listarComFiltro({ deficiencia, modelo, busca, pagina, limite });
  }

  async listarVagasDoRh(rhId) {
    return await VagaRepository.listarPorRh(rhId);
  }

  async listarVagas(pagina, limite) {
    return await VagaRepository.listarTodas(pagina, limite);
  }

  async recomendarVagasParaCandidato(usuarioId) {
    const perfil = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!perfil) {
      const error = new Error('Perfil de candidato não encontrado.');
      error.status = 404;
      throw error;
    }
    return await VagaRepository.listarPorTipoDeficiencia(perfil.tipo_deficiencia);
  }
  async editarVaga(id, rh_id, dados) {
    const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(rh_id);
    const vaga = await VagaRepository.buscarPorId(id);
    if (!vaga) { const e = new Error('Vaga não encontrada.'); e.status = 404; throw e; }
    if (!empresa || vaga.empresa_id !== empresa.id) { const e = new Error('Sem permissão para editar esta vaga.'); e.status = 403; throw e; }
    return await VagaRepository.atualizarVaga(id, dados);
  }

  async encerrarVaga(id, rh_id) {
    const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(rh_id);
    const vaga = await VagaRepository.buscarPorId(id);
    if (!vaga) { const e = new Error('Vaga não encontrada.'); e.status = 404; throw e; }
    if (!empresa || vaga.empresa_id !== empresa.id) { const e = new Error('Sem permissão para encerrar esta vaga.'); e.status = 403; throw e; }
    return await VagaRepository.atualizarStatus(id, 'Encerrada');
  }
}

module.exports = new VagaService();
