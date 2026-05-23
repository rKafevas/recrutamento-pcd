const UsuarioService = require('../services/usuarioService');

class UsuarioController {
  async registrar(req, res, next) { // Adicionamos 'next' para o erro global
    try {
      // 1. O Joi já validou os dados no middleware da rota, 
      // então aqui apenas recebemos o que está pronto para o banco.
      const { 
        nome_completo, 
        email, 
        senha, 
        tipo_deficiencia, 
        necessidades_acessibilidade 
      } = req.body;

      // 2. ENVIO PARA O SERVICE
      // O Service deve ser responsável por:
      // - Verificar se o e-mail existe
      // - Criptografar a senha (Bcrypt)
      // - Fazer o INSERT
      const resultado = await UsuarioService.registrarCandidato({
        nome_completo,
        email,
        senha,
        tipo_deficiencia,
        necessidades_acessibilidade
      });

      // 3. Resposta de sucesso
      return res.status(201).json(resultado);

    } catch (err) {
      // 4. Se o e-mail já existir ou der erro no banco, o Service lança o erro
      // e o 'next(err)' manda direto para o Error Handler Global no server.js
      next(err); 
    }
  }
  async registrarRH(req, res, next) {
    try {
      const { nome_completo, email, senha, nome_fantasia, cnpj } = req.body;
      const resultado = await UsuarioService.registrarRH({ nome_completo, email, senha, nome_fantasia, cnpj });
      return res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }
  async deletarConta(req, res, next) {
    try {
      await UsuarioService.deletarConta(req.usuarioId);
      return res.json({ mensagem: 'Conta excluída com sucesso. Seus dados foram removidos.' });
    } catch(err) { next(err); }
  }
}

module.exports = new UsuarioController();