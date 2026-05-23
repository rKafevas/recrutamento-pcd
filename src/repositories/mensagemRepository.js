const db = require('../database');

class MensagemRepository {
  async buscarDadosInscricao(inscricaoId) {
    const { rows } = await db.query(`
      SELECT i.id, i.candidato_id, i.vaga_id,
        c.usuario_id as candidato_usuario_id,
        c.nome_completo as candidato_nome,
        v.titulo as vaga_titulo,
        e.usuario_id as rh_usuario_id
      FROM inscricoes i
      JOIN candidatos c ON i.candidato_id = c.id
      JOIN vagas v ON i.vaga_id = v.id
      JOIN empresas e ON v.empresa_id = e.id
      WHERE i.id = $1
    `, [inscricaoId]);
    return rows[0];
  }

  async salvar(remetenteId, destinatarioId, inscricaoId, conteudo) {
    const { rows } = await db.query(`
      INSERT INTO mensagens (remetente_id, destinatario_id, inscricao_id, conteudo)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [remetenteId, destinatarioId, inscricaoId, conteudo]);
    return rows[0];
  }

  async listarPorInscricao(inscricaoId) {
    const { rows } = await db.query(`
      SELECT m.*, u.email as remetente_email, u.tipo as remetente_tipo
      FROM mensagens m
      JOIN usuarios u ON m.remetente_id = u.id
      WHERE m.inscricao_id = $1
      ORDER BY m.criado_em ASC
    `, [inscricaoId]);
    return rows;
  }

  async marcarComoLidas(inscricaoId, usuarioId) {
    await db.query(`
      UPDATE mensagens SET lida = TRUE
      WHERE inscricao_id = $1 AND destinatario_id = $2
    `, [inscricaoId, usuarioId]);
  }

  async conversasDoUsuario(usuarioId) {
    const { rows } = await db.query(`
      SELECT DISTINCT ON (m.inscricao_id)
        m.inscricao_id, m.conteudo as ultima_mensagem, m.criado_em,
        i.vaga_id, v.titulo as vaga_titulo,
        c.nome_completo as candidato_nome,
        COUNT(m2.id) FILTER (WHERE m2.lida = FALSE AND m2.destinatario_id = $1) as nao_lidas
      FROM mensagens m
      JOIN inscricoes i ON m.inscricao_id = i.id
      JOIN vagas v ON i.vaga_id = v.id
      JOIN candidatos c ON i.candidato_id = c.id
      LEFT JOIN mensagens m2 ON m2.inscricao_id = m.inscricao_id
      WHERE m.remetente_id = $1 OR m.destinatario_id = $1
      GROUP BY m.inscricao_id, m.conteudo, m.criado_em, i.vaga_id, v.titulo, c.nome_completo
      ORDER BY m.inscricao_id, m.criado_em DESC
    `, [usuarioId]);
    return rows;
  }
}

module.exports = new MensagemRepository();
