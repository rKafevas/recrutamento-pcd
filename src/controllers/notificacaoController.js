const NotificacaoRepository = require('../repositories/notificacaoRepository');

class NotificacaoController {
  async listar(req, res, next) {
    try {
      const notifs = await NotificacaoRepository.listarNaoLidas(req.usuarioId);
      const total = await NotificacaoRepository.contarNaoLidas(req.usuarioId);
      return res.json({ notificacoes: notifs, total });
    } catch(err) { next(err); }
  }

  async marcarLidas(req, res, next) {
    try {
      await NotificacaoRepository.marcarTodasComoLidas(req.usuarioId);
      return res.json({ mensagem: 'Notificações marcadas como lidas.' });
    } catch(err) { next(err); }
  }
}

module.exports = new NotificacaoController();
