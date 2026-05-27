const db = require('../database');

class NotificacaoRepository {
  async criar(usuarioId, mensagem, link = null) {
    try {
      await db.query(
        'INSERT INTO notificacoes (usuario_id, mensagem, link) VALUES ($1, $2, $3)',
        [usuarioId, mensagem, link]
      );
    } catch(e) { console.error('Erro ao criar notificação:', e.message); }
  }

  async listarNaoLidas(usuarioId) {
    const { rows } = await db.query(
      'SELECT * FROM notificacoes WHERE usuario_id = $1 AND lida = FALSE ORDER BY criado_em DESC',
      [usuarioId]
    );
    return rows;
  }

  async marcarTodasComoLidas(usuarioId) {
    await db.query(
      'UPDATE notificacoes SET lida = TRUE WHERE usuario_id = $1',
      [usuarioId]
    );
  }

  async contarNaoLidas(usuarioId) {
    const { rows } = await db.query(
      'SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = $1 AND lida = FALSE',
      [usuarioId]
    );
    return parseInt(rows[0].total);
  }
}

module.exports = new NotificacaoRepository();
