const db = require('../database');

class VagaRepository {

  async criarVaga(rhId, titulo, descricao, requisitos, localizacao, salario, deficienciaFoco) {
    const query = `
      INSERT INTO vagas 
      (empresa_id, titulo, descricao, requisitos, localizacao, salario, tipo_deficiencia_foco)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    // Passamos todos os novos parâmetros para a query
    const { rows } = await db.query(query, [
      rhId, 
      titulo, 
      descricao, 
      requisitos, 
      localizacao, 
      salario, 
      deficienciaFoco
    ]);
    return rows[0];
  }

  async listarTodas() {
    // Adicionamos um JOIN simples para trazer o nome da empresa/RH que postou
    const query = `
      SELECT v.*, u.email as contato_rh
      FROM vagas v
      LEFT JOIN usuarios u ON v.empresa_id = u.id
      ORDER BY v.data_publicacao DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async listarPorTipoDeficiencia(tipo) {
    const query = `
      SELECT v.*, u.email as contato_rh
      FROM vagas v
      LEFT JOIN usuarios u ON v.empresa_id = u.id
      WHERE v.tipo_deficiencia_foco = $1 
      OR v.tipo_deficiencia_foco = 'Qualquer'
      ORDER BY v.data_publicacao DESC
    `;
    // Agora a busca é exata pelo tipo de deficiência, garantindo o "match" correto
    const { rows } = await db.query(query, [tipo]);
    return rows;
  }
}

module.exports = new VagaRepository();