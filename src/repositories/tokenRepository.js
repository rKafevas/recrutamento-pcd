const db = require('../database');
const crypto = require('crypto');

class TokenRepository {
  gerarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async criar(usuarioId, tipo) {
    const token = this.gerarCodigo();
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await db.query(
      'INSERT INTO tokens_email (usuario_id, token, tipo, expira_em) VALUES ($1, $2, $3, $4)',
      [usuarioId, token, tipo, expira]
    );
    return token;
  }

  async validar(usuarioId, token, tipo) {
    const { rows } = await db.query(`
      SELECT * FROM tokens_email
      WHERE usuario_id = $1 AND token = $2 AND tipo = $3
        AND usado = FALSE AND expira_em > NOW()
      ORDER BY criado_em DESC LIMIT 1
    `, [usuarioId, token, tipo]);
    return rows[0];
  }

  async marcarUsado(id) {
    await db.query('UPDATE tokens_email SET usado = TRUE WHERE id = $1', [id]);
  }

  async buscarUsuarioPorEmail(email) {
    const { rows } = await db.query(`
      SELECT u.id, u.email, c.nome_completo
      FROM usuarios u
      LEFT JOIN candidatos c ON c.usuario_id = u.id
      WHERE u.email = $1
    `, [email]);
    return rows[0];
  }
}

module.exports = new TokenRepository();
