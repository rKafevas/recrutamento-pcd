const VagaRepository = require('../repositories/vagaRepository');
const CandidatoRepository = require('../repositories/candidatoRepository');
const NotificacaoRepository = require('../repositories/notificacaoRepository');

class VagaService {
  async anunciarVaga(rh_id, dados) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(rh_id);
      if (!empresa) {
        const e = new Error('Perfil de empresa não encontrado para este usuário.');
        e.status = 404; throw e;
      }
      const vaga = await VagaRepository.criarVaga(empresa.id, dados);

      // Notifica candidatos elegíveis em background (não bloqueia a resposta)
      try {
        const candidatos = await CandidatoRepository.buscarParaAlertaDeVaga(vaga.tipo_deficiencia_foco || 'Qualquer');
        await Promise.all(candidatos.map(c =>
          NotificacaoRepository.criar(
            c.usuario_id,
            `Nova vaga disponível: "${vaga.titulo}"`,
            `vagas.html`
          )
        ));
      } catch (e) {
        console.error('Erro ao enviar alertas de vaga:', e.message);
      }

      return vaga;
    } catch (err) {
      if (err.status) throw err;
      console.error("Erro ao criar vaga:", err);
      const e = new Error(err.message || "Não foi possível publicar a vaga.");
      e.status = 500;
      throw e;
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
