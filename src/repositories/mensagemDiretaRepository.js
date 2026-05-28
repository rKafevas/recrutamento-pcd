const db = require('../database');

class MensagemDiretaRepository {
  async salvar(remetenteId, destinatarioId, candidatoUsuarioId, conteudo) {
    const { rows } = await db.query(`
      INSERT INTO mensagens_diretas (remetente_id, destinatario_id, candidato_usuario_id, conteudo)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [remetenteId, destinatarioId, candidatoUsuarioId, conteudo]);
    return rows[0];
  }

  async listarPorConversa(userId1, userId2) {
    const { rows } = await db.query(`
      SELECT m.*, u.email AS remetente_email
      FROM mensagens_diretas m
      JOIN usuarios u ON m.remetente_id = u.id
      WHERE (m.remetente_id = $1 AND m.destinatario_id = $2)
         OR (m.remetente_id = $2 AND m.destinatario_id = $1)
      ORDER BY m.criado_em ASC
    `, [userId1, userId2]);
    return rows;
  }

  async marcarComoLidas(remetenteId, destinatarioId) {
    await db.query(`
      UPDATE mensagens_diretas SET lida = TRUE
      WHERE remetente_id = $1 AND destinatario_id = $2 AND lida = FALSE
    `, [remetenteId, destinatarioId]);
  }

  async conversasDoUsuario(usuarioId) {
    const { rows } = await db.query(`
      WITH conv AS (
        SELECT
          CASE WHEN remetente_id = $1 THEN destinatario_id ELSE remetente_id END AS outro_usuario_id,
          candidato_usuario_id,
          conteudo,
          criado_em
        FROM mensagens_diretas
        WHERE remetente_id = $1 OR destinatario_id = $1
      )
      SELECT DISTINCT ON (outro_usuario_id)
        outro_usuario_id,
        c.id AS candidato_id,
        c.nome_completo AS candidato_nome,
        c.foto_url AS candidato_foto,
        COALESCE(e.nome_fantasia, u.email) AS outro_nome,
        conv.conteudo AS ultima_mensagem,
        conv.criado_em
      FROM conv
      LEFT JOIN candidatos c ON c.usuario_id = candidato_usuario_id
      LEFT JOIN usuarios u ON u.id = outro_usuario_id
      LEFT JOIN empresas e ON e.usuario_id = outro_usuario_id
      ORDER BY outro_usuario_id, conv.criado_em DESC
    `, [usuarioId]);

    const { rows: unread } = await db.query(`
      SELECT remetente_id, COUNT(*) AS nao_lidas
      FROM mensagens_diretas
      WHERE destinatario_id = $1 AND lida = FALSE
      GROUP BY remetente_id
    `, [usuarioId]);

    const unreadMap = {};
    unread.forEach(u => { unreadMap[u.remetente_id] = parseInt(u.nao_lidas); });

    return rows.map(r => ({ ...r, nao_lidas: unreadMap[r.outro_usuario_id] || 0 }));
  }
}

module.exports = new MensagemDiretaRepository();
