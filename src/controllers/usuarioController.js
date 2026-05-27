const UsuarioService = require('../services/usuarioService');

class UsuarioController {
async registrar(req, res, next) {
    try {
      const { 
        nome_completo, email, senha, tipo_deficiencia, necessidades_acessibilidade 
      } = req.body;

      const resultado = await UsuarioService.registrarCandidato({
        nome_completo, email, senha, tipo_deficiencia, necessidades_acessibilidade
      });

      return res.status(201).json(resultado);

    } catch (err) {
      // 1. Loga o erro no servidor para você saber o que aconteceu
      console.error("Erro no registro:", err);

      // 2. Tenta usar o next(err) para o tratamento global
      // Mas se o servidor não responder, a linha abaixo garante que o front-end 
      // saia do estado (pending) e receba uma mensagem de erro.
      if (!res.headersSent) {
        return res.status(500).json({ 
          mensagem: "Erro ao processar o registro. Tente novamente mais tarde." 
        });
      }
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