const AuthService = require('../services/authService');
const TokenRepository = require('../repositories/tokenRepository');
const EmailService = require('../services/emailService');
const bcrypt = require('bcrypt');
const db = require('../database');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const dados = await AuthService.login(email, senha);
      return res.json(dados);
    } catch (err) { next(err); }
  }

  async solicitarRecuperacao(req, res, next) {
    try {
      const { email } = req.body;
      const usuario = await TokenRepository.buscarUsuarioPorEmail(email);
      // Sempre retorna sucesso para não revelar se e-mail existe
      if (!usuario) return res.json({ mensagem: 'Se este e-mail estiver cadastrado, você receberá um código.' });
      const token = await TokenRepository.criar(usuario.id, 'recuperacao');
      await EmailService.enviarRecuperacaoSenha(email, usuario.nome_completo || 'Usuário', token);
      return res.json({ mensagem: 'Código enviado para seu e-mail.', usuario_id: usuario.id });
    } catch(err) { next(err); }
  }

  async verificarCodigoRecuperacao(req, res, next) {
    try {
      const { usuario_id, token } = req.body;
      const registro = await TokenRepository.validar(usuario_id, token, 'recuperacao');
      if (!registro) { const e = new Error('Código inválido ou expirado.'); e.status = 400; throw e; }
      return res.json({ mensagem: 'Código válido.', token_id: registro.id });
    } catch(err) { next(err); }
  }

  async redefinirSenha(req, res, next) {
    try {
      const { usuario_id, token, nova_senha } = req.body;
      if (!nova_senha || nova_senha.length < 6) { const e = new Error('A senha deve ter no mínimo 6 caracteres.'); e.status = 400; throw e; }
      const registro = await TokenRepository.validar(usuario_id, token, 'recuperacao');
      if (!registro) { const e = new Error('Código inválido ou expirado.'); e.status = 400; throw e; }
      const hash = await bcrypt.hash(nova_senha, 10);
      await db.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hash, usuario_id]);
      await TokenRepository.marcarUsado(registro.id);
      return res.json({ mensagem: 'Senha redefinida com sucesso!' });
    } catch(err) { next(err); }
  }

  async confirmarEmail(req, res, next) {
    try {
      const { usuario_id, token } = req.body;
      const registro = await TokenRepository.validar(usuario_id, token, 'confirmacao');
      if (!registro) { const e = new Error('Código inválido ou expirado.'); e.status = 400; throw e; }
      await db.query('UPDATE usuarios SET email_confirmado = TRUE WHERE id = $1', [usuario_id]);
      await TokenRepository.marcarUsado(registro.id);
      return res.json({ mensagem: 'E-mail confirmado com sucesso!' });
    } catch(err) { next(err); }
  }
}

module.exports = new AuthController();
