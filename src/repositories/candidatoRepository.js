const db = require('../database');

class CandidatoRepository {

  async atualizarColunaLaudo(usuarioId, url) {
    const query = `
      UPDATE candidatos 
      SET laudo_medico_url = $1 
      WHERE usuario_id = $2 
      RETURNING *
    `;
    const { rows } = await db.query(query, [url, usuarioId]);
    return rows[0];
  }

  async buscarPorUsuarioId(usuarioId) {
    const query = 'SELECT * FROM candidatos WHERE usuario_id = $1';
    const { rows } = await db.query(query, [usuarioId]);
    return rows[0];
  }

  async buscarPerfil(usuarioId) {
    const { rows } = await db.query(`
      SELECT c.*, u.email 
      FROM candidatos c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.usuario_id = $1
    `, [usuarioId]);

    return rows[0];
  }

  async atualizarCurriculo(usuarioId, urlCurriculo, nomeCompleto, sobre, telefone) {
    const query = `
      UPDATE candidatos 
      SET curriculo_url = $1,
          nome_completo = COALESCE($2, nome_completo),
          sobre = COALESCE($3, sobre),
          telefone = COALESCE($4, telefone)
      WHERE usuario_id = $5
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      urlCurriculo,
      nomeCompleto || null,
      sobre || null,
      telefone || null,
      usuarioId
    ]);

    return rows[0];
  }

  async atualizarInfos(usuarioId, nomeCompleto, sobre, telefone, formacao, experiencias, habilidades) {
    const query = `
      UPDATE candidatos
      SET nome_completo = COALESCE($1, nome_completo),
          sobre = COALESCE($2, sobre),
          telefone = COALESCE($3, telefone),
          formacao = COALESCE($4, formacao),
          experiencias = COALESCE($5, experiencias),
          habilidades = COALESCE($6, habilidades)
      WHERE usuario_id = $7
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nomeCompleto || null,
      sobre || null,
      telefone || null,
      formacao || null,
      experiencias || null,
      habilidades || null,
      usuarioId
    ]);

    return rows[0];
  }

  async removerCurriculo(usuarioId) {
    const { rows } = await db.query(
      `UPDATE candidatos 
       SET curriculo_url = NULL 
       WHERE usuario_id = $1 
       RETURNING *`,
      [usuarioId]
    );

    return rows[0];
  }

  async removerLaudo(usuarioId) {
    const { rows } = await db.query(
      `UPDATE candidatos 
       SET laudo_medico_url = NULL 
       WHERE usuario_id = $1 
       RETURNING *`,
      [usuarioId]
    );

    return rows[0];
  }

  async atualizarFoto(usuarioId, fotoUrl) {
    const { rows } = await db.query(
      `UPDATE candidatos 
       SET foto_url = $1 
       WHERE usuario_id = $2 
       RETURNING *`,
      [fotoUrl, usuarioId]
    );

    return rows[0];
  }

  async removerFoto(usuarioId) {
    const { rows } = await db.query(
      `UPDATE candidatos
       SET foto_url = NULL
       WHERE usuario_id = $1
       RETURNING *`,
      [usuarioId]
    );

    return rows[0];
  }

  async buscarParaAlertaDeVaga(tipoDeficienciaFoco) {
    const query = tipoDeficienciaFoco === 'Qualquer'
      ? `SELECT u.id AS usuario_id FROM candidatos c JOIN usuarios u ON c.usuario_id = u.id WHERE c.tipo_deficiencia IS NOT NULL`
      : `SELECT u.id AS usuario_id FROM candidatos c JOIN usuarios u ON c.usuario_id = u.id WHERE c.tipo_deficiencia = $1`;
    const params = tipoDeficienciaFoco === 'Qualquer' ? [] : [tipoDeficienciaFoco];
    const { rows } = await db.query(query, params);
    return rows;
  }

  async listarTodos() {
    const { rows } = await db.query(`
      SELECT c.id, c.usuario_id, c.nome_completo, c.tipo_deficiencia,
             c.habilidades, c.sobre, c.formacao, c.experiencias,
             c.foto_url, c.curriculo_url, c.laudo_medico_url, u.email
      FROM candidatos c
      JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.nome_completo ASC
    `);
    return rows;
  }
}

module.exports = new CandidatoRepository();