const UsuarioRepository = require('../repositories/usuarioRepository');
const LogRepository = require('../repositories/logRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, senha) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    if (!usuario) { throw new Error('Usuário não encontrado'); }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) { throw new Error('Senha incorreta'); }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'inclui_secret_key',
      { expiresIn: '1d' }
    );

    await LogRepository.registrar(usuario.id, `Login realizado (${usuario.tipo})`);

    return {
      usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      token
    };
  }
}

module.exports = new AuthService();
