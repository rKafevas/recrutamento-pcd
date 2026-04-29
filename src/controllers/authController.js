const AuthService = require('../services/authService');

class AuthController {
  async login(req, res, next) { // <-- Adicionamos o 'next'
    try {
      // 1. Desestruturação direta do corpo (O Joi já validou isso no routes.js)
      const { email, senha } = req.body;

      // 2. Chama o serviço de autenticação
      const dados = await AuthService.login(email, senha);

      // 3. Retorna os dados (Token e informações do usuário)
      return res.json(dados);
      
    } catch (err) {
      // 4. Passa o erro para o Middleware Global no server.js
      // Se o erro for "Senha incorreta", ele mantém o status 401
      // Se o banco cair, o global trata como 500
      next(err); 
    }
  }
}

module.exports = new AuthController();