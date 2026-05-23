const db = require('../database');

class CandidatoRepository {
  /**
   * Atualiza o caminho do laudo médico no perfil do candidato.
   * Vinculamos pelo usuario_id, que é a chave estrangeira vinda da tabela usuarios.
   */
  async atualizarColunaLaudo(usuarioId, url) {
    const query = `
      UPDATE candidatos 
      SET laudo_medico_url = $1 
      WHERE usuario_id = $2 
      RETURNING *
    `;
    
    // Executa a query usando o pool de conexão do banco
    const { rows } = await db.query(query, [url, usuarioId]);
    return rows[0];
  }

  /**
   * Busca os dados específicos do perfil do candidato.
   */
  async buscarPorUsuarioId(usuarioId) {
    const query = 'SELECT * FROM candidatos WHERE usuario_id = $1';
    const { rows } = await db.query(query, [usuarioId]);
    return rows[0];
  }
  async atualizarCurriculo(usuarioId, urlCurriculo, nomeCompleto, sobre) {
    const query = `
      UPDATE candidatos 
      SET curriculo_url = $1,
          nome_completo = COALESCE($2, nome_completo),
          necessidades_acessibilidade = COALESCE($3, necessidades_acessibilidade)
      WHERE usuario_id = $4
      RETURNING *
    `;
    const { rows } = await db.query(query, [urlCurriculo, nomeCompleto || null, sobre || null, usuarioId]);
    return rows[0];
  }
}

module.exports = new CandidatoRepository();