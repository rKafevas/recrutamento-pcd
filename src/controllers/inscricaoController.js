const InscricaoService = require('../services/inscricaoService');

class InscricaoController {
  
  async inscrever(req, res, next) {
    try {
      // O Joi já validou a existência do vaga_id no middleware
      const { vaga_id } = req.body;
      const usuario_id = req.usuarioId; 

      const inscricao = await InscricaoService.seCandidatar(usuario_id, vaga_id);
      
      return res.status(201).json({
        mensagem: "Inscrição realizada com sucesso!",
        dados: inscricao
      });
    } catch (err) {
      // Manda para o Error Handler Global do server.js
      next(err);
    }
  }

  async listarMinhasInscricoes(req, res, next) {
    try {
      const usuario_id = req.usuarioId; 
      const lista = await InscricaoService.verMinhasInscricoes(usuario_id);
      return res.json(lista);
    } catch (err) {
      next(err);
    }
  }

  // Rota de gestão (RH) - Listar todos os candidatos de uma vaga
  async listarPorVaga(req, res, next) {
    try {
      const { vaga_id } = req.params;

      // Movido para o Service para manter a arquitetura limpa
      const inscritos = await InscricaoService.listarInscritosPorVaga(vaga_id);

      return res.json(inscritos);
    } catch (err) {
      next(err);
    }
  }

  async cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuarioId;
      const removida = await InscricaoService.cancelarInscricao(usuario_id, id);
      return res.json({ mensagem: 'Candidatura cancelada com sucesso.', dados: removida });
    } catch (err) {
      next(err);
    }
  }

  // Atualizar o status (Aprovado, Reprovado, etc)
  async atualizarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, motivo_reprovacao, data_entrevista, link_entrevista } = req.body;

      const inscricaoAtualizada = await InscricaoService.alterarStatus(id, status, motivo_reprovacao || null, data_entrevista || null, link_entrevista || null);

      return res.json({
        mensagem: "Status atualizado com sucesso!",
        inscricao: inscricaoAtualizada
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InscricaoController();