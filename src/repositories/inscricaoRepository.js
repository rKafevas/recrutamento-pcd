const db = require('../database');

class InscricaoRepository {
  async criar(candidatoId, vagaId) {
    const query = `
      INSERT INTO inscricoes (candidato_id, vaga_id, status)
      VALUES ($1, $2, 'Pendente')
      RETURNING *
    `;
    const { rows } = await db.query(query, [candidatoId, vagaId]);
    return rows[0];
  }

  // NOVO MÉTODO: Essencial para evitar duplicidade
  async buscarInscricaoEspecifica(candidatoId, vagaId) {
    const query = `
      SELECT * FROM inscricoes 
      WHERE candidato_id = $1 AND vaga_id = $2
    `;
    const { rows } = await db.query(query, [candidatoId, vagaId]);
    return rows[0]; // Retorna a inscrição se existir ou undefined se não
  }

  async listarPorCandidato(candidatoId) {
    const query = `
      SELECT 
        i.id AS inscricao_id, 
        i.status, 
        i.data_inscricao, 
        v.titulo AS vaga_titulo,
        v.status AS vaga_status,
        e.nome_fantasia AS empresa_nome
      FROM inscricoes i
      JOIN vagas v ON i.vaga_id = v.id
      JOIN empresas e ON v.empresa_id = e.id
      WHERE i.candidato_id = $1
      ORDER BY i.data_inscricao DESC
    `;
    const { rows } = await db.query(query, [candidatoId]);
    return rows;
  }

  async listarPorVaga(vaga_id) {
    const query = `
      SELECT
        i.id AS inscricao_id,
        i.data_inscricao,
        i.status,
        c.nome_completo,
        c.tipo_deficiencia,
        c.necessidades_acessibilidade,
        c.curriculo_url,
        c.laudo_medico_url,
        c.foto_url,
        u.id AS usuario_id,
        u.email
      FROM inscricoes i
      JOIN candidatos c ON i.candidato_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE i.vaga_id = $1
      ORDER BY i.data_inscricao DESC
  `;
    const { rows } = await db.query(query, [vaga_id]);
    return rows;
}

  async atualizarStatus(id, novoStatus) {
    const query = `
      UPDATE inscricoes
      SET status = $1, data_atualizacao_status = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [novoStatus, id]);
    return rows[0];
  }
}

module.exports = new InscricaoRepository();