const db = require('../database');

class UsuarioRepository {
  // 1. Cria a conta de acesso (Login)
  async criarUsuario(email, senha, tipo = 'Candidato') {
    const query = `
      INSERT INTO usuarios (email, senha, tipo)
      VALUES ($1, $2, $3)
      RETURNING id, email, tipo
    `;
    const { rows } = await db.query(query, [email, senha, tipo]);
    return rows[0];
  }

  // 2. Cria os detalhes do Candidato PcD (CORRIGIDO)
  async criarCandidato(usuarioId, nomeCompleto, tipoDeficiencia) {
    const query = `
      INSERT INTO candidatos (usuario_id, nome_completo, tipo_deficiencia)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      usuarioId,
      nomeCompleto,
      tipoDeficiencia || null
    ]);
    return rows[0];
  }

  // 3. Buscar usuário por email
  async buscarPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  // 4. Criar empresa (RH)
  async criarEmpresa(usuarioId, nomeFantasia, cnpj) {
    const query = `
      INSERT INTO empresas (usuario_id, nome_fantasia, cnpj)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await db.query(query, [usuarioId, nomeFantasia, cnpj]);
    return rows[0];
  }

  // 5. Deletar conta
  async deletarConta(usuarioId) {
    const { rows: candidatos } = await db.query(
      'SELECT id FROM candidatos WHERE usuario_id = $1',
      [usuarioId]
    );

    if (candidatos.length) {
      const candidatoId = candidatos[0].id;

      await db.query('DELETE FROM inscricoes WHERE candidato_id = $1', [candidatoId]);

      await db.query(`
        UPDATE candidatos 
        SET nome_completo = 'Usuário removido',
            tipo_deficiencia = NULL,
            laudo_medico_url = NULL,
            curriculo_url = NULL
        WHERE id = $1
      `, [candidatoId]);

      await db.query('DELETE FROM candidatos WHERE id = $1', [candidatoId]);
    }

    await db.query('DELETE FROM logs_sistema WHERE usuario_id = $1', [usuarioId]);
    await db.query('DELETE FROM usuarios WHERE id = $1', [usuarioId]);
  }
}

module.exports = new UsuarioRepository();