const db = require('../database');

class VagaRepository {
  async criarVaga(rhId, dados) {
    const query = `
      INSERT INTO vagas 
        (empresa_id, titulo, descricao, requisitos, beneficios, modelo_trabalho,
         localizacao, salario, tipo_deficiencia_foco, acessibilidade_local,
         tecnologias_assistivas, status, data_criacao)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Aberta', NOW())
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      rhId,
      dados.titulo,
      dados.descricao,
      dados.requisitos,
      dados.beneficios || null,
      dados.modelo_trabalho,
      dados.localizacao,
      dados.salario || null,
      dados.tipo_deficiencia_foco,
      dados.acessibilidade_local || null,
      dados.tecnologias_assistivas || null
    ]);
    return rows[0];
  }

  async listarComFiltro({ deficiencia, modelo, busca, pagina = 1, limite = 10 }) {
    const offset = (pagina - 1) * limite;
    let conditions = ["v.status = 'Aberta'"];
    const params = [];
    if (deficiencia && deficiencia !== 'Todas') { params.push(deficiencia); conditions.push(`(v.tipo_deficiencia_foco = $${params.length} OR v.tipo_deficiencia_foco = 'Qualquer')`); }
    if (modelo) { params.push(modelo); conditions.push(`v.modelo_trabalho = $${params.length}`); }
    if (busca) { params.push(`%${busca}%`); conditions.push(`(v.titulo ILIKE $${params.length} OR v.descricao ILIKE $${params.length})`); }
    const where = conditions.join(' AND ');
    const { rows: vagas } = await db.query(`
      SELECT v.*, e.nome_fantasia as nome_empresa FROM vagas v
      LEFT JOIN empresas e ON v.empresa_id = e.id
      WHERE ${where} ORDER BY v.data_criacao DESC LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limite, offset]);
    const { rows: cnt } = await db.query(`SELECT COUNT(*) as total FROM vagas v WHERE ${where}`, params);
    const total = parseInt(cnt[0].total);
    return { vagas, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async buscarEmpresaPorUsuarioId(usuarioId) {
    const { rows } = await db.query('SELECT * FROM empresas WHERE usuario_id = $1', [usuarioId]);
    return rows[0];
  }

  async listarPorRh(rhId) {
    const query = `
      SELECT v.*, e.nome_fantasia as nome_empresa
      FROM vagas v
      JOIN empresas e ON v.empresa_id = e.id
      WHERE e.usuario_id = $1
      ORDER BY v.data_criacao DESC
    `;
    const { rows } = await db.query(query, [rhId]);
    return rows;
  }

  async listarTodas(pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    const { rows: vagas } = await db.query(`
      SELECT v.*, e.nome_fantasia as nome_empresa
      FROM vagas v LEFT JOIN empresas e ON v.empresa_id = e.id
      WHERE v.status = 'Aberta'
      ORDER BY v.data_criacao DESC LIMIT $1 OFFSET $2
    `, [limite, offset]);
    const { rows: cnt } = await db.query(`SELECT COUNT(*) as total FROM vagas WHERE status = 'Aberta'`);
    const total = parseInt(cnt[0].total);
    return { vagas, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async listarPorTipoDeficiencia(tipo) {
    const query = `
      SELECT v.*, u.email as contato_rh
      FROM vagas v
      LEFT JOIN usuarios u ON v.empresa_id = u.id
      WHERE (v.tipo_deficiencia_foco = $1 OR v.tipo_deficiencia_foco = 'Qualquer')
        AND v.status = 'Aberta'
      ORDER BY v.data_criacao DESC
    `;
    const { rows } = await db.query(query, [tipo]);
    return rows;
  }
  async buscarPorId(id) {
    const { rows } = await db.query('SELECT * FROM vagas WHERE id = $1', [id]);
    return rows[0];
  }

  async atualizarVaga(id, dados) {
    const query = `
      UPDATE vagas SET
        titulo = COALESCE($1, titulo),
        descricao = COALESCE($2, descricao),
        requisitos = COALESCE($3, requisitos),
        beneficios = COALESCE($4, beneficios),
        modelo_trabalho = COALESCE($5, modelo_trabalho),
        localizacao = COALESCE($6, localizacao),
        salario = COALESCE($7, salario),
        tipo_deficiencia_foco = COALESCE($8, tipo_deficiencia_foco),
        acessibilidade_local = COALESCE($9, acessibilidade_local),
        tecnologias_assistivas = COALESCE($10, tecnologias_assistivas)
      WHERE id = $11
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      dados.titulo, dados.descricao, dados.requisitos, dados.beneficios,
      dados.modelo_trabalho, dados.localizacao, dados.salario,
      dados.tipo_deficiencia_foco, dados.acessibilidade_local,
      dados.tecnologias_assistivas, id
    ]);
    return rows[0];
  }

  async atualizarStatus(id, status) {
    const { rows } = await db.query(
      'UPDATE vagas SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  }
}

module.exports = new VagaRepository();
