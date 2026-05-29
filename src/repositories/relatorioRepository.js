const db = require('../database');

class RelatorioRepository {
  async relatorioCotas(empresaId) {
    const { rows } = await db.query(`
      SELECT
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status != 'Reprovado') AS total_candidatos,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Aprovado')   AS total_contratados,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Entrevista') AS em_entrevista,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Em análise') AS em_analise,
        COUNT(DISTINCT i.candidato_id) FILTER (WHERE i.status = 'Pendente')   AS pendentes,
        COUNT(i.id)                                                            AS total_inscricoes,
        COUNT(DISTINCT v.id)                                                   AS total_vagas,
        COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Aberta')               AS vagas_abertas,
        COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Encerrada')            AS vagas_encerradas,
        ROUND(
          CASE WHEN COUNT(i.id) > 0
            THEN COUNT(i.id) FILTER (WHERE i.status = 'Aprovado')::NUMERIC / COUNT(i.id) * 100
            ELSE 0
          END, 1
        ) AS taxa_contratacao
      FROM vagas v
      LEFT JOIN inscricoes i ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
    `, [empresaId]);
    return rows[0];
  }

  async contatadosPorDeficiencia(empresaId) {
    const { rows } = await db.query(`
      SELECT
        COALESCE(c.tipo_deficiencia, 'Não informado') AS tipo_deficiencia,
        COUNT(*)                                                               AS total_inscricoes,
        COUNT(*) FILTER (WHERE i.status = 'Aprovado')                        AS contratados,
        COUNT(*) FILTER (WHERE i.status = 'Entrevista')                      AS em_entrevista,
        COUNT(*) FILTER (WHERE i.status = 'Em análise')                      AS em_analise,
        COUNT(*) FILTER (WHERE i.status = 'Pendente')                        AS pendentes,
        COUNT(*) FILTER (WHERE i.status = 'Reprovado')                       AS reprovados
      FROM inscricoes i
      JOIN candidatos c ON i.candidato_id = c.id
      JOIN vagas v ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
      GROUP BY c.tipo_deficiencia
      ORDER BY total_inscricoes DESC
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
  async metricas(empresaId) {
    const { rows: [resumo] } = await db.query(`
      SELECT
        COUNT(i.id) AS total_inscricoes,
        COUNT(i.id) FILTER (WHERE i.status = 'Pendente')    AS pendentes,
        COUNT(i.id) FILTER (WHERE i.status = 'Em análise')  AS em_analise,
        COUNT(i.id) FILTER (WHERE i.status = 'Entrevista')  AS entrevistas,
        COUNT(i.id) FILTER (WHERE i.status = 'Aprovado')    AS aprovados,
        COUNT(i.id) FILTER (WHERE i.status = 'Reprovado')   AS reprovados,
        ROUND(
          CASE WHEN COUNT(i.id) > 0
            THEN COUNT(i.id) FILTER (WHERE i.status = 'Aprovado')::NUMERIC / COUNT(i.id) * 100
            ELSE 0 END, 1
        ) AS taxa_conversao,
        ROUND(
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (i.data_atualizacao_status - i.data_inscricao)) / 86400.0
            ) FILTER (WHERE i.status = 'Aprovado'),
            0
          )::NUMERIC, 1
        ) AS tempo_medio_dias
      FROM inscricoes i
      JOIN vagas v ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
    `, [empresaId]);

    const { rows: porMes } = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', i.data_inscricao), 'Mon/YY') AS mes,
        DATE_TRUNC('month', i.data_inscricao) AS mes_data,
        COUNT(*) AS total
      FROM inscricoes i
      JOIN vagas v ON i.vaga_id = v.id
      WHERE v.empresa_id = $1
        AND i.data_inscricao >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', i.data_inscricao)
      ORDER BY mes_data ASC
    `, [empresaId]);

    const { rows: [vagas] } = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Aberta')    AS abertas,
        COUNT(*) FILTER (WHERE status = 'Encerrada') AS encerradas
      FROM vagas WHERE empresa_id = $1
    `, [empresaId]);

    return { ...resumo, porMes, vagas };
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
