const UsuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, senha) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    // 3. AGORA INCLUIMOS O TIPO NO TOKEN
    // Isso é o que o seu authMiddleware vai ler depois
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo // <-- ADICIONE ESTA LINHA
      },
      'process.env.JWT_SECRET', 
      { expiresIn: '1d' }
    );

    // Retornamos os dados incluindo o tipo para o Front-end saber quem logou
    return { 
      usuario: { 
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo // <-- ADICIONE ESTA LINHA TAMBÉM
      }, 
      token 
    };
  }
}

module.exports = new AuthService();