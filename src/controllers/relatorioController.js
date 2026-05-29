const RelatorioRepository = require('../repositories/relatorioRepository');
const VagaRepository = require('../repositories/vagaRepository');
const PDFDocument = require('pdfkit');

class RelatorioController {
  async relatorioCotas(req, res, next) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(req.usuarioId);
      if (!empresa) { const e = new Error('Empresa não encontrada.'); e.status = 404; throw e; }
      const resumo = await RelatorioRepository.relatorioCotas(empresa.id);
      const porDeficiencia = await RelatorioRepository.contatadosPorDeficiencia(empresa.id);
      const vagas = await RelatorioRepository.vagasComInscritos(empresa.id);
      return res.json({ resumo, porDeficiencia, vagas });
    } catch(err) { next(err); }
  }

  async exportarPDF(req, res, next) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(req.usuarioId);
      if (!empresa) { const e = new Error('Empresa não encontrada.'); e.status = 404; throw e; }
      const resumo = await RelatorioRepository.relatorioCotas(empresa.id);
      const porDeficiencia = await RelatorioRepository.contatadosPorDeficiencia(empresa.id);
      const vagas = await RelatorioRepository.vagasComInscritos(empresa.id);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-di-${Date.now()}.pdf`);
      doc.pipe(res);

      const LEFT = 50, RIGHT = 545, W = RIGHT - LEFT;
      const orange = '#f47c20', gray = '#6b7a99', dark = '#1a2744';

      // ── Cabeçalho ──────────────────────────────────────────────────────────
      doc.rect(LEFT, 40, W, 56).fill('#f5f7fc');
      doc.fontSize(18).font('Helvetica-Bold').fillColor(dark)
         .text('Inclui+', LEFT + 12, 50, { continued: true })
         .fillColor(orange).text('  ·  Relatório de D&I', { continued: false });
      doc.fontSize(10).font('Helvetica').fillColor(gray)
         .text(`Lei nº 8.213/91  |  Empresa: ${empresa.nome_fantasia}  |  Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
               LEFT + 12, 72);
      doc.fillColor(dark).moveDown(2.5);

      // ── Resumo em grid 2×3 ─────────────────────────────────────────────────
      const r = resumo;
      const taxa = Number(r.taxa_contratacao) || 0;
      const statBoxes = [
        { label: 'Total de inscrições', value: r.total_inscricoes || 0 },
        { label: 'Contratados PcD',     value: r.total_contratados || 0, color: '#16a34a' },
        { label: 'Em entrevista',        value: r.em_entrevista || 0,   color: '#2563eb' },
        { label: 'Em análise',           value: r.em_analise || 0,      color: '#d97706' },
        { label: 'Vagas abertas',        value: r.vagas_abertas || 0 },
        { label: 'Taxa de contratação',  value: taxa + '%',              color: taxa >= 3 ? '#16a34a' : orange },
      ];
      const boxW = Math.floor(W / 3) - 6, boxH = 48;
      const startY = doc.y;
      statBoxes.forEach((b, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = LEFT + col * (boxW + 9), y = startY + row * (boxH + 8);
        doc.rect(x, y, boxW, boxH).lineWidth(1).strokeColor('rgba(26,39,68,0.1)').fillAndStroke('#fff', 'rgba(26,39,68,0.1)');
        doc.fontSize(20).font('Helvetica-Bold').fillColor(b.color || dark)
           .text(String(b.value), x + 10, y + 7, { width: boxW - 20 });
        doc.fontSize(9).font('Helvetica').fillColor(gray)
           .text(b.label, x + 10, y + 30, { width: boxW - 20 });
      });
      doc.y = startY + 2 * (boxH + 8) + 16;

      // ── Lei 8.213/91 ────────────────────────────────────────────────────────
      doc.rect(LEFT, doc.y, W, 36).fill('#fff7ed');
      doc.fontSize(9).font('Helvetica-Bold').fillColor(orange)
         .text('Lei de Cotas (Art. 93):', LEFT + 10, doc.y + 4, { continued: true })
         .font('Helvetica').fillColor(dark)
         .text('  100–200 func.: 2% | 201–500: 3% | 501–1.000: 4% | Acima de 1.001: 5%');
      doc.moveDown(2.2);

      // ── Inscrições por tipo de deficiência ─────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor(dark).text('Inscrições por tipo de deficiência');
      doc.moveDown(0.4);

      const maxIns = Math.max(...porDeficiencia.map(p => Number(p.total_inscricoes) || 0), 1);
      const barAreaW = W - 180;

      if (porDeficiencia.length) {
        // Cabeçalho da tabela
        doc.fontSize(9).font('Helvetica-Bold').fillColor(gray);
        doc.text('Tipo', LEFT, doc.y, { width: 100, continued: true });
        doc.text('Inscrições', LEFT + 100, doc.y - doc.currentLineHeight(), { width: 60, align: 'right', continued: true });
        doc.text('Contratados', LEFT + 165, doc.y - doc.currentLineHeight(), { width: 70, align: 'right', continued: true });
        doc.text('Entrevista', LEFT + 240, doc.y - doc.currentLineHeight(), { width: 60, align: 'right', continued: false });
        doc.moveDown(0.3);
        doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).lineWidth(0.5).strokeColor('rgba(26,39,68,0.15)').stroke();
        doc.moveDown(0.3);

        porDeficiencia.forEach(p => {
          const ins = Number(p.total_inscricoes) || 0;
          const con = Number(p.contratados) || 0;
          const ent = Number(p.em_entrevista) || 0;
          const rowY = doc.y;

          // Barra de fundo
          doc.rect(LEFT + 300, rowY + 2, barAreaW - 100, 10).fill('#f0f4ff');
          // Barra de inscrições (azul claro)
          const bIns = Math.round((ins / maxIns) * (barAreaW - 100));
          doc.rect(LEFT + 300, rowY + 2, bIns, 10).fill('#93c5fd');
          // Barra de contratados (verde)
          if (con > 0) {
            const bCon = Math.round((con / maxIns) * (barAreaW - 100));
            doc.rect(LEFT + 300, rowY + 2, bCon, 10).fill('#4ade80');
          }

          doc.fontSize(10).font('Helvetica').fillColor(dark)
             .text(p.tipo_deficiencia, LEFT, rowY, { width: 100, continued: true });
          doc.text(String(ins), LEFT + 100, rowY, { width: 60, align: 'right', continued: true });
          doc.text(String(con), LEFT + 165, rowY, { width: 70, align: 'right', continued: true });
          doc.text(String(ent), LEFT + 240, rowY, { width: 60, align: 'right', continued: false });
          doc.moveDown(0.15);
          doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).lineWidth(0.3).strokeColor('rgba(26,39,68,0.08)').stroke();
          doc.moveDown(0.4);
        });

        // Legenda
        doc.moveDown(0.3);
        doc.rect(LEFT, doc.y, 12, 8).fill('#93c5fd');
        doc.fontSize(8).font('Helvetica').fillColor(gray).text(' Inscrições totais', LEFT + 15, doc.y - 6, { continued: true });
        doc.rect(LEFT + 100, doc.y - 2, 12, 8).fill('#4ade80');
        doc.text('  Contratados', LEFT + 115, doc.y - 6, { continued: false });
        doc.moveDown(1.2);
      } else {
        doc.fontSize(10).font('Helvetica').fillColor(gray).text('Nenhuma inscrição registrada.');
        doc.moveDown();
      }

      // ── Vagas ───────────────────────────────────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor(dark).text('Vagas e inscrições');
      doc.moveDown(0.4);

      // Cabeçalho
      doc.fontSize(9).font('Helvetica-Bold').fillColor(gray);
      ['Título', 'Foco', 'Status', 'Inscritos', 'Aprovados'].forEach((h, i) => {
        const xs = [LEFT, LEFT+200, LEFT+310, LEFT+380, LEFT+450];
        doc.text(h, xs[i], doc.y, { width: i < 4 ? 100 : 60, continued: i < 4, align: i >= 3 ? 'right' : 'left' });
      });
      doc.moveDown(0.3);
      doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).lineWidth(0.5).strokeColor('rgba(26,39,68,0.15)').stroke();
      doc.moveDown(0.3);

      vagas.forEach(v => {
        const statusColor = v.status === 'Aberta' ? '#16a34a' : gray;
        const rowY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').fillColor(dark)
           .text(v.titulo, LEFT, rowY, { width: 195, continued: true });
        doc.font('Helvetica').fillColor(gray)
           .text(v.tipo_deficiencia_foco || 'Qualquer', LEFT + 200, rowY, { width: 100, continued: true });
        doc.fillColor(statusColor)
           .text(v.status, LEFT + 310, rowY, { width: 65, continued: true });
        doc.fillColor(dark)
           .text(String(v.total_inscritos), LEFT + 380, rowY, { width: 65, align: 'right', continued: true })
           .text(String(v.aprovados), LEFT + 450, rowY, { width: 60, align: 'right', continued: false });
        doc.moveDown(0.15);
        doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).lineWidth(0.3).strokeColor('rgba(26,39,68,0.08)').stroke();
        doc.moveDown(0.4);
      });

      // ── Rodapé ──────────────────────────────────────────────────────────────
      doc.moveDown();
      doc.fontSize(8).fillColor(gray).text(
        `Relatório gerado pela plataforma Inclui+ em ${new Date().toLocaleString('pt-BR')}`,
        LEFT, doc.y, { align: 'center', width: W }
      );

      doc.end();
    } catch(err) { next(err); }
  }

  async exportarCSV(req, res, next) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(req.usuarioId);
      if (!empresa) { const e = new Error('Empresa não encontrada.'); e.status = 404; throw e; }
      const resumo = await RelatorioRepository.relatorioCotas(empresa.id);
      const porDeficiencia = await RelatorioRepository.contatadosPorDeficiencia(empresa.id);
      const vagas = await RelatorioRepository.vagasComInscritos(empresa.id);

      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const linha = cols => cols.map(esc).join(',');

      const linhas = [
        linha(['RELATÓRIO D&I — LEI Nº 8.213/91']),
        linha(['Empresa:', empresa.nome_fantasia]),
        linha(['Gerado em:', new Date().toLocaleString('pt-BR')]),
        '',
        linha(['RESUMO']),
        linha(['Total de inscrições', resumo.total_inscricoes ?? 0]),
        linha(['Candidatos ativos', resumo.total_candidatos ?? 0]),
        linha(['Contratados PcD', resumo.total_contratados ?? 0]),
        linha(['Em entrevista', resumo.em_entrevista ?? 0]),
        linha(['Em análise', resumo.em_analise ?? 0]),
        linha(['Pendentes', resumo.pendentes ?? 0]),
        linha(['Vagas abertas', resumo.vagas_abertas ?? 0]),
        linha(['Vagas encerradas', resumo.vagas_encerradas ?? 0]),
        linha(['Taxa de contratação', (resumo.taxa_contratacao ?? 0) + '%']),
        '',
        linha(['POR TIPO DE DEFICIÊNCIA']),
        linha(['Tipo', 'Inscrições', 'Contratados', 'Em Entrevista', 'Em Análise', 'Pendentes', 'Reprovados']),
        ...porDeficiencia.map(p => linha([
          p.tipo_deficiencia,
          p.total_inscricoes ?? 0,
          p.contratados ?? 0,
          p.em_entrevista ?? 0,
          p.em_analise ?? 0,
          p.pendentes ?? 0,
          p.reprovados ?? 0,
        ])),
        '',
        linha(['VAGAS']),
        linha(['Título', 'Status', 'Foco', 'Inscritos', 'Aprovados']),
        ...vagas.map(v => linha([
          v.titulo,
          v.status,
          v.tipo_deficiencia_foco || 'Qualquer',
          v.total_inscritos ?? 0,
          v.aprovados ?? 0,
        ])),
      ];

      // BOM para abertura correta no Excel
      const csv = '﻿' + linhas.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-di-${Date.now()}.csv`);
      return res.send(csv);
    } catch(err) { next(err); }
  }

  async metricas(req, res, next) {
    try {
      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(req.usuarioId);
      if (!empresa) { const e = new Error('Empresa não encontrada.'); e.status = 404; throw e; }
      const dados = await RelatorioRepository.metricas(empresa.id);
      return res.json(dados);
    } catch(err) { next(err); }
  }

  async buscarCandidatos(req, res, next) {
    try {
      const { busca, deficiencia, page, limit } = req.query;
      const resultado = await RelatorioRepository.buscarCandidatos({ busca, deficiencia, page, limit });
      return res.json(resultado);
    } catch(err) { next(err); }
  }
}

module.exports = new RelatorioController();
