const db = require('../database');

class LogRepository {
  async registrar(usuarioId, acao) {
    try {
      await db.query(
        'INSERT INTO logs_sistema (usuario_id, acao) VALUES ($1, $2)',
        [usuarioId, acao]
      );
    } catch(e) {
      console.error('Erro ao registrar log:', e.message);
    }
  }

  async listarTodos() {
    const { rows } = await db.query(`
      SELECT l.*, u.email, u.tipo
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      ORDER BY l.data_hora DESC
      LIMIT 500
    `);
    return rows;
  }
}

module.exports = new LogRepository();
