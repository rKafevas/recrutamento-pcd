const db = require('../database');

class UsuarioRepository {
  // 1. Cria a conta de acesso (Login)
  // Troquei 'perfil' por 'tipo' para evitar confusão com o perfil de candidato
  async criarUsuario(email, senha, tipo = 'Candidato') {
    const query = `
      INSERT INTO usuarios (email, senha, tipo)
      VALUES ($1, $2, $3)
      RETURNING id, email, tipo
    `;
    const { rows } = await db.query(query, [email, senha, tipo]);
    return rows[0];
  }

  // 2. Cria os detalhes do Candidato PcD
  async criarCandidato(usuarioId, nomeCompleto, tipoDeficiencia, necessidadesAcessibilidade) {
    const query = `
      INSERT INTO candidatos (usuario_id, nome_completo, tipo_deficiencia, necessidades_acessibilidade)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      usuarioId, 
      nomeCompleto, 
      tipoDeficiencia, 
      necessidadesAcessibilidade
    ]);
    return rows[0];
  }

  // 3. MÉTODO ESSENCIAL PARA O LOGIN:
  // Sem este método, o seu AuthService não consegue achar o usuário para validar a senha
  async buscarPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }
}

module.exports = new UsuarioRepository();