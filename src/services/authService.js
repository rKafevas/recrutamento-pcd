const UsuarioRepository = require('../repositories/usuarioRepository');
const LogRepository = require('../repositories/logRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, senha) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    if (!usuario) { const e = new Error('Usuário não encontrado'); e.status = 401; throw e; }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) { const e = new Error('Senha incorreta'); e.status = 401; throw e; }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
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
