const MensagemRepository = require('../repositories/mensagemRepository');

class MensagemController {
  async buscarDadosInscricao(req, res, next) {
    try {
      const dados = await MensagemRepository.buscarDadosInscricao(req.params.inscricao_id);
      if (!dados) { const e = new Error('Inscrição não encontrada.'); e.status = 404; throw e; }
      return res.json(dados);
    } catch(err) { next(err); }
  }

  async listarPorInscricao(req, res, next) {
    try {
      const { inscricao_id } = req.params;
      const msgs = await MensagemRepository.listarPorInscricao(inscricao_id);
      await MensagemRepository.marcarComoLidas(inscricao_id, req.usuarioId);
      return res.json(msgs);
    } catch(err) { next(err); }
  }

  async listarConversas(req, res, next) {
    try {
      const conversas = await MensagemRepository.conversasDoUsuario(req.usuarioId);
      return res.json(conversas);
    } catch(err) { next(err); }
  }
}

module.exports = new MensagemController();
