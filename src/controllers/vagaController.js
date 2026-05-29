const VagaService = require('../services/vagaService');
const CandidatoRepository = require('../repositories/candidatoRepository');
const VagaRepository = require('../repositories/vagaRepository');
const { rankearCandidatos } = require('../services/compatibilidadeService');

class VagaController {
  // Alterado de 'cadastrar' para 'criar' para bater com o padrão das suas rotas
  async criar(req, res, next) {
    try {
      // 1. O Joi já validou o req.body antes de chegar aqui.
      // 2. O authMiddleware já colocou o ID do usuário logado (RH) no req.usuarioId.
      const rh_id = req.usuarioId;
      const dadosVaga = req.body;

      const vaga = await VagaService.anunciarVaga(rh_id, dadosVaga);
      
      return res.status(201).json({
        mensagem: "Vaga cadastrada com sucesso!",
        vaga
      });
    } catch (err) {
      // Manda para o Error Handler Global do server.js
      next(err);
    }
  }

  async listar(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const resultado = await VagaService.listarVagas(pagina, limite);
      return res.json(resultado);
    } catch (err) { next(err); }
  }

  async buscarPorId(req, res, next) {
    try {
      const vaga = await VagaService.buscarPorId(req.params.id);
      if (!vaga) { const e = new Error('Vaga não encontrada.'); e.status = 404; throw e; }
      return res.json(vaga);
    } catch(err) { next(err); }
  }

  async listarRecomendadas(req, res, next) {
    try {
      const vagas = await VagaService.recomendarVagasParaCandidato(req.usuarioId);
      return res.json(vagas);
    } catch(err) { next(err); }
  }

  async listarComFiltro(req, res, next) {
    try {
      const { deficiencia, modelo, busca } = req.query;
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const resultado = await VagaService.listarComFiltro({ deficiencia, modelo, busca, pagina, limite });
      return res.json(resultado);
    } catch(err) { next(err); }
  }

  async listarMinhas(req, res, next) {
    try {
      const vagas = await VagaService.listarVagasDoRh(req.usuarioId);
      return res.json(vagas);
    } catch(err) { next(err); }
  }

  async editar(req, res, next) {
    try {
      const { id } = req.params;
      const rh_id = req.usuarioId;
      const vaga = await VagaService.editarVaga(id, rh_id, req.body);
      return res.json({ mensagem: 'Vaga atualizada com sucesso!', vaga });
    } catch(err) { next(err); }
  }

  async encerrar(req, res, next) {
    try {
      const { id } = req.params;
      const rh_id = req.usuarioId;
      const vaga = await VagaService.encerrarVaga(id, rh_id);
      return res.json({ mensagem: 'Vaga encerrada com sucesso!', vaga });
    } catch(err) { next(err); }
  }

  async compatibilidade(req, res, next) {
    try {
      const vaga = await VagaRepository.buscarPorId(req.params.id);
      if (!vaga) { const e = new Error('Vaga não encontrada.'); e.status = 404; throw e; }

      const empresa = await VagaRepository.buscarEmpresaPorUsuarioId(req.usuarioId);
      if (!empresa || empresa.id !== vaga.empresa_id) {
        const e = new Error('Acesso negado.'); e.status = 403; throw e;
      }

      const candidatos = await CandidatoRepository.listarTodos();
      const ranking = rankearCandidatos(candidatos, vaga);
      return res.json({ vaga: { id: vaga.id, titulo: vaga.titulo }, total: ranking.length, candidatos: ranking });
    } catch(err) { next(err); }
  }
}

module.exports = new VagaController();