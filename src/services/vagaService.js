const VagaRepository = require('../repositories/vagaRepository');
const db = require('../database');

class VagaService {
  async anunciarVaga(dados) {
    // Por enquanto, vamos usar um empresa_id fixo (1) até criarmos o cadastro de empresas
    const empresaId = 1; 
    return await VagaRepository.criarVaga(
      empresaId, 
      dados.titulo, 
      dados.descricao, 
      dados.tipo_deficiencia_foco
    );
  }

  async listarVagas() {
    return await VagaRepository.listarTodas();
  }

  async recomendarVagasParaCandidato(usuarioId) {
    // 1. Busca a deficiência no perfil do candidato logado
    const queryPerfil = 'SELECT tipo_deficiencia FROM candidatos WHERE usuario_id = $1';
    const resPerfil = await db.query(queryPerfil, [usuarioId]);

    if (resPerfil.rows.length === 0) {
      throw new Error('Perfil de candidato não encontrado.');
    }

    const deficiencia = resPerfil.rows[0].tipo_deficiencia;

    // 2. Chama o repository passando a deficiência encontrada
    // Usamos o VagaRepository para manter a organização
    return await VagaRepository.listarPorTipoDeficiencia(deficiencia);
  }

}

module.exports = new VagaService();