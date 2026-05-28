const MensagemDiretaRepository = require('../repositories/mensagemDiretaRepository');

class MensagemDiretaController {
  async listarConversas(req, res, next) {
    try {
      const conversas = await MensagemDiretaRepository.conversasDoUsuario(req.usuarioId);
      res.json(conversas);
    } catch(err) { next(err); }
  }

  async listarPorConversa(req, res, next) {
    try {
      const outroId = parseInt(req.params.outro_usuario_id);
      const msgs = await MensagemDiretaRepository.listarPorConversa(req.usuarioId, outroId);
      await MensagemDiretaRepository.marcarComoLidas(outroId, req.usuarioId);
      res.json(msgs);
    } catch(err) { next(err); }
  }
}

module.exports = new MensagemDiretaController();
