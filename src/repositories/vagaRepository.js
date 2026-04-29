const db = require('../database');

class VagaRepository {

  async criarVaga(empresaId, titulo, descricao, deficienciaFoco) {
    const query = `
      INSERT INTO vagas (empresa_id, titulo, descricao, tipo_deficiencia_foco)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [empresaId, titulo, descricao, deficienciaFoco]);
    return rows[0];
  }

  async listarTodas() {
    const { rows } = await db.query('SELECT * FROM vagas ORDER BY data_publicacao DESC');
    return rows;
  }

  async buscarPorDeficiencia(tipo) {
  const query = `
    SELECT * FROM vagas 
    WHERE tipo_deficiencia_foco = $1 OR tipo_deficiencia_foco = 'Qualquer'
    ORDER BY data_publicacao DESC
  `;
  const { rows } = await db.query(query, [tipo]);
  return rows;
}
  async listarPorTipoDeficiencia(tipo) {
    const query = `
      SELECT v.*, e.nome_fantasia AS empresa_nome
      FROM vagas v
      JOIN empresas e ON v.empresa_id = e.id
      WHERE v.descricao ILIKE $1 
      OR v.titulo ILIKE $1
      ORDER BY v.data_publicacao DESC
    `;
    // O % ajuda a encontrar a palavra em qualquer parte do texto
    const { rows } = await db.query(query, [`%${tipo}%`]);
    return rows;
  }
}

  

module.exports = new VagaRepository();