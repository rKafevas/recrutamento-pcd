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

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-cotas-${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Inclui+', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Relatório de Cotas — Lei nº 8.213/91', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666').text(`Empresa: ${empresa.nome_fantasia}`, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.fillColor('#000');
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Resumo
      doc.fontSize(14).font('Helvetica-Bold').text('Resumo');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      const r = resumo;
      doc.text(`Total de candidatos: ${r.total_candidatos || 0}`);
      doc.text(`Contratados PcD: ${r.total_contratados || 0}`);
      doc.text(`Em entrevista: ${r.em_entrevista || 0}`);
      doc.text(`Pendentes: ${r.pendentes || 0}`);
      doc.text(`Vagas abertas: ${r.vagas_abertas || 0}`);
      doc.text(`Vagas encerradas: ${r.vagas_encerradas || 0}`);
      doc.moveDown();

      // Por deficiência
      doc.fontSize(14).font('Helvetica-Bold').text('Contratados por tipo de deficiência');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      if (porDeficiencia.length) {
        porDeficiencia.forEach(p => doc.text(`${p.tipo_deficiencia || 'Não informado'}: ${p.total}`));
      } else { doc.text('Nenhum contratado registrado.'); }
      doc.moveDown();

      // Vagas
      doc.fontSize(14).font('Helvetica-Bold').text('Vagas e inscrições');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      vagas.forEach(v => {
        doc.font('Helvetica-Bold').text(v.titulo, { continued: false });
        doc.font('Helvetica').text(`Status: ${v.status} | Foco: ${v.tipo_deficiencia_foco || 'Qualquer'} | Inscritos: ${v.total_inscritos} | Aprovados: ${v.aprovados}`);
        doc.moveDown(0.3);
      });

      doc.end();
    } catch(err) { next(err); }
  }

  async buscarCandidatos(req, res, next) {
    try {
      const { busca, deficiencia } = req.query;
      const dados = await RelatorioRepository.buscarCandidatos({ busca, deficiencia });
      return res.json(dados);
    } catch(err) { next(err); }
  }
}

module.exports = new RelatorioController();
