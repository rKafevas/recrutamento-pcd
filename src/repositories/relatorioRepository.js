const db = require('../database');

class RelatorioRepository {
  async relatorioCotas(empresaId) {
    const { rows } = await db.query(`
      SELECT
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status != 'Reprovado') AS total_candidatos,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Aprovado') AS total_contratados,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Entrevista') AS em_entrevista,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Pendente') AS pendentes,
        COUNT(DISTINCT v.id) AS total_vagas,
        COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Aberta') AS vagas_abertas,
        COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Encerrada') AS vagas_encerradas
      FROM vagas v
      LEFT JOIN inscricoes i ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
    `, [empresaId]);
    return rows[0];
  }

  async contatadosPorDeficiencia(empresaId) {
    const { rows } = await db.query(`
      SELECT c.tipo_deficiencia, COUNT(*) AS total
      FROM inscricoes i
      JOIN candidatos c ON i.candidato_id = c.id
      JOIN vagas v ON i.vaga_id = v.id
      WHERE v.empresa_id = $1 AND i.status = 'Aprovado'
      GROUP BY c.tipo_deficiencia
      ORDER BY total DESC
    `, [empresaId]);
    return rows;
  }

  async vagasComInscritos(empresaId) {
    const { rows } = await db.query(`
      SELECT v.titulo, v.status, v.tipo_deficiencia_foco,
        COUNT(i.id) AS total_inscritos,
        COUNT(i.id) FILTER (WHERE i.status = 'Aprovado') AS aprovados
      FROM vagas v
      LEFT JOIN inscricoes i ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
      GROUP BY v.id
      ORDER BY v.data_criacao DESC
    `, [empresaId]);
    return rows;
  }
  async buscarCandidatos({ busca, deficiencia, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    let conditions = ['1=1'];
    const params = [];
    if (busca) { params.push(`%${busca}%`); conditions.push(`(c.nome_completo ILIKE $${params.length} OR u.email ILIKE $${params.length})`); }
    if (deficiencia) { params.push(deficiencia); conditions.push(`c.tipo_deficiencia = $${params.length}`); }

    const whereClause = conditions.join(' AND ');

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) AS total FROM candidatos c JOIN usuarios u ON c.usuario_id = u.id WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countRows[0].total);

    params.push(parseInt(limit), offset);
    const { rows } = await db.query(`
      SELECT c.id, c.usuario_id, c.nome_completo, c.tipo_deficiencia, c.sobre, c.habilidades, c.foto_url, c.curriculo_url, c.laudo_medico_url, u.email
      FROM candidatos c JOIN usuarios u ON c.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY c.nome_completo ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return { dados: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }
}

module.exports = new RelatorioRepository();
