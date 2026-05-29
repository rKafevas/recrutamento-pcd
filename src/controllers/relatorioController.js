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

      const L = 50, R = 545, W = R - L;
      const orange = '#f47c20', gray = '#6b7a99', dark = '#1a2744';

      // Render a single table cell at explicit coordinates — avoids continued:true bugs
      function cell(text, x, y, w, opts = {}) {
        doc.fontSize(opts.size || 10)
           .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(opts.color || dark)
           .text(String(text), x, y, { width: w, align: opts.align || 'left', lineBreak: false });
      }

      // ── Cabeçalho ──────────────────────────────────────────────────────────
      doc.rect(L, 40, W, 56).fill('#f5f7fc');
      doc.fontSize(18).font('Helvetica-Bold').fillColor(dark)
         .text('Inclui+', L + 12, 50, { continued: true })
         .fillColor(orange).text('  ·  Relatório de D&I', { continued: false });
      doc.fontSize(10).font('Helvetica').fillColor(gray)
         .text(`Lei nº 8.213/91  |  Empresa: ${empresa.nome_fantasia}  |  Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
               L + 12, 70, { lineBreak: false });
      doc.y = 110;

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
        const col = i % 3, rowIdx = Math.floor(i / 3);
        const x = L + col * (boxW + 9), y = startY + rowIdx * (boxH + 8);
        doc.rect(x, y, boxW, boxH).lineWidth(1).strokeColor('rgba(26,39,68,0.1)').fillAndStroke('#fff', 'rgba(26,39,68,0.1)');
        doc.fontSize(20).font('Helvetica-Bold').fillColor(b.color || dark)
           .text(String(b.value), x + 10, y + 7, { width: boxW - 20, lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor(gray)
           .text(b.label, x + 10, y + 30, { width: boxW - 20, lineBreak: false });
      });
      doc.y = startY + 2 * (boxH + 8) + 14;

      // ── Lei 8.213/91 ────────────────────────────────────────────────────────
      const leiY = doc.y;
      doc.rect(L, leiY, W, 30).fill('#fff7ed');
      doc.fontSize(9).font('Helvetica-Bold').fillColor(orange)
         .text('Lei de Cotas (Art. 93):', L + 10, leiY + 9, { continued: true })
         .font('Helvetica').fillColor(dark)
         .text('  100–200 func.: 2% | 201–500: 3% | 501–1.000: 4% | Acima de 1.001: 5%', { lineBreak: false });
      doc.y = leiY + 42;

      // ── Inscrições por tipo de deficiência ─────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor(dark).text('Inscrições por tipo de deficiência', L, doc.y);
      doc.y += 6;

      // Column layout — all coords stay within L=50 … R=545
      // tipo:50–170  bar:175–285  con:290–374  ent:379–453  ana:458–545
      const DC = {
        tipo: { x: L,       w: 120 },
        bar:  { x: L + 125, w: 110 },
        con:  { x: L + 240, w: 84,  align: 'right' },
        ent:  { x: L + 329, w: 74,  align: 'right' },
        ana:  { x: L + 408, w: 87,  align: 'right' },
      };

      let curY = doc.y;
      doc.rect(L, curY - 2, W, 16).fill('rgba(26,39,68,0.03)');
      cell('Tipo',        DC.tipo.x, curY, DC.tipo.w, { bold: true, color: gray, size: 9 });
      cell('Inscrições',  DC.bar.x,  curY, DC.bar.w,  { bold: true, color: gray, size: 9 });
      cell('Contratados', DC.con.x,  curY, DC.con.w,  { bold: true, color: gray, size: 9, align: 'right' });
      cell('Entrevista',  DC.ent.x,  curY, DC.ent.w,  { bold: true, color: gray, size: 9, align: 'right' });
      cell('Em análise',  DC.ana.x,  curY, DC.ana.w,  { bold: true, color: gray, size: 9, align: 'right' });
      curY += 14;
      doc.moveTo(L, curY).lineTo(R, curY).lineWidth(0.5).strokeColor('rgba(26,39,68,0.15)').stroke();
      curY += 4;

      if (porDeficiencia.length) {
        const maxIns = Math.max(...porDeficiencia.map(p => Number(p.total_inscricoes) || 0), 1);

        porDeficiencia.forEach(p => {
          const ins = Number(p.total_inscricoes) || 0;
          const con = Number(p.contratados) || 0;
          const ent = Number(p.em_entrevista) || 0;
          const ana = Number(p.em_analise) || 0;

          // Bars (within bar column)
          doc.rect(DC.bar.x, curY + 3, DC.bar.w, 8).fill('#f0f4ff');
          const bIns = Math.round((ins / maxIns) * DC.bar.w);
          if (bIns > 0) doc.rect(DC.bar.x, curY + 3, bIns, 8).fill('#93c5fd');
          const bCon = Math.round((con / maxIns) * DC.bar.w);
          if (bCon > 0) doc.rect(DC.bar.x, curY + 3, bCon, 8).fill('#4ade80');

          cell(p.tipo_deficiencia, DC.tipo.x, curY, DC.tipo.w);
          cell(con, DC.con.x, curY, DC.con.w, { bold: true, color: '#16a34a', align: 'right' });
          cell(ent, DC.ent.x, curY, DC.ent.w, { color: gray, align: 'right' });
          cell(ana, DC.ana.x, curY, DC.ana.w, { color: gray, align: 'right' });

          curY += 19;
          doc.moveTo(L, curY).lineTo(R, curY).lineWidth(0.3).strokeColor('rgba(26,39,68,0.08)').stroke();
          curY += 3;
        });

        // Legenda
        curY += 4;
        doc.rect(L, curY + 1, 10, 8).fill('#93c5fd');
        cell('Inscrições totais', L + 14, curY, 100, { color: gray, size: 8 });
        doc.rect(L + 115, curY + 1, 10, 8).fill('#4ade80');
        cell('Contratados', L + 129, curY, 80, { color: gray, size: 8 });
        curY += 18;
      } else {
        cell('Nenhuma inscrição registrada.', L, curY, W, { color: gray });
        curY += 18;
      }

      doc.y = curY + 14;

      // ── Vagas ───────────────────────────────────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor(dark).text('Vagas e inscrições', L, doc.y);
      doc.y += 6;

      // titulo:50–204  foco:209–313  status:318–382  inscritos:387–456  aprovados:461–545
      const VC = {
        titulo:    { x: L,       w: 154 },
        foco:      { x: L + 159, w: 104 },
        status:    { x: L + 268, w: 64 },
        inscritos: { x: L + 337, w: 69,  align: 'right' },
        aprovados: { x: L + 411, w: 84,  align: 'right' },
      };

      curY = doc.y;
      doc.rect(L, curY - 2, W, 16).fill('rgba(26,39,68,0.03)');
      cell('Título',    VC.titulo.x,    curY, VC.titulo.w,    { bold: true, color: gray, size: 9 });
      cell('Foco',      VC.foco.x,      curY, VC.foco.w,      { bold: true, color: gray, size: 9 });
      cell('Status',    VC.status.x,    curY, VC.status.w,    { bold: true, color: gray, size: 9 });
      cell('Inscritos', VC.inscritos.x, curY, VC.inscritos.w, { bold: true, color: gray, size: 9, align: 'right' });
      cell('Aprovados', VC.aprovados.x, curY, VC.aprovados.w, { bold: true, color: gray, size: 9, align: 'right' });
      curY += 14;
      doc.moveTo(L, curY).lineTo(R, curY).lineWidth(0.5).strokeColor('rgba(26,39,68,0.15)').stroke();
      curY += 4;

      vagas.forEach(v => {
        const statusColor = v.status === 'Aberta' ? '#16a34a' : gray;
        cell(v.titulo,                             VC.titulo.x,    curY, VC.titulo.w,    { bold: true });
        cell(v.tipo_deficiencia_foco || 'Qualquer',VC.foco.x,      curY, VC.foco.w,      { color: gray });
        cell(v.status,                             VC.status.x,    curY, VC.status.w,    { color: statusColor });
        cell(v.total_inscritos,                    VC.inscritos.x, curY, VC.inscritos.w, { align: 'right' });
        cell(v.aprovados,                          VC.aprovados.x, curY, VC.aprovados.w, { align: 'right' });

        curY += 19;
        doc.moveTo(L, curY).lineTo(R, curY).lineWidth(0.3).strokeColor('rgba(26,39,68,0.08)').stroke();
        curY += 3;
      });

      doc.y = curY + 16;

      // ── Rodapé ──────────────────────────────────────────────────────────────
      doc.fontSize(8).fillColor(gray).text(
        `Relatório gerado pela plataforma Inclui+ em ${new Date().toLocaleString('pt-BR')}`,
        L, doc.y, { align: 'center', width: W }
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
