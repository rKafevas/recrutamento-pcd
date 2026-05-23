const VagaService = require('../services/vagaService');

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
      const vagas = await VagaService.listarVagas();
      return res.json(vagas);
    } catch (err) {
      next(err);
    }
  }
  
  async listarRecomendadas(req, res, next) {
    try {
      // Usamos o ID que o authMiddleware extraiu do Token JWT
      const usuarioId = req.usuarioId; 
    
      const vagas = await VagaService.recomendarVagasParaCandidato(usuarioId);
    
      return res.json(vagas);
    } catch (err) {
      next(err);
    }
  }
  async listarComFiltro(req, res, next) {
    try {
      const { deficiencia, modelo, busca } = req.query;
      const vagas = await VagaService.listarComFiltro({ deficiencia, modelo, busca });
      return res.json(vagas);
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
}

module.exports = new VagaController();