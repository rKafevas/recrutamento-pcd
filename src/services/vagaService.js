const VagaRepository = require('../repositories/vagaRepository');
const db = require('../database');

class VagaService {
  // Agora recebemos o rh_id real que o controller extraiu do token JWT
  async anunciarVaga(rh_id, dados) {
    try {
      // No futuro, você pode buscar a qual empresa esse rh_id pertence.
      // Por hora, passamos o rh_id para o repository registrar quem criou a vaga.
      return await VagaRepository.criarVaga(
        rh_id, 
        dados.titulo, 
        dados.descricao, 
        dados.requisitos,
        dados.localizacao,
        dados.salario,
        dados.tipo_deficiencia_foco
      );
    } catch (err) {
      console.error("Erro no Service ao criar vaga:", err);
      throw new Error("Não foi possível publicar a vaga. Tente novamente mais tarde.");
    }
  }

  async listarVagas() {
    return await VagaRepository.listarTodas();
  }

  async recomendarVagasParaCandidato(usuarioId) {
    // 1. Usa o repositório especializado para buscar o perfil
    const perfil = await CandidatoRepository.buscarPorUsuarioId(usuarioId);

    if (!perfil) {
      const error = new Error('Perfil de candidato não encontrado.');
      error.status = 404;
      throw error;
    }

    // 2. Filtro inteligente usando a deficiência do perfil
    return await VagaRepository.listarPorTipoDeficiencia(perfil.tipo_deficiencia);
  }
}

module.exports = new VagaService();