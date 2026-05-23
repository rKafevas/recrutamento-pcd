const RelatorioRepository = require('../repositories/relatorioRepository');
const VagaRepository = require('../repositories/vagaRepository');

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
}

module.exports = new RelatorioController();
