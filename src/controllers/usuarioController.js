const UsuarioService = require('../services/usuarioService');

class UsuarioController {

  async registrar(req, res, next) {
    try {
      const {
        nome_completo,
        email,
        senha,
        tipo_deficiencia,
        necessidades_acessibilidade
      } = req.body;

      const resultado = await UsuarioService.registrarCandidato({
        nome_completo,
        email,
        senha,
        tipo_deficiencia,
        necessidades_acessibilidade
      });

      return res.status(201).json(resultado);

    } catch (err) {
      // 🔥 MOSTRA O ERRO REAL
      console.error("🔥 ERRO REAL NO REGISTRO:", err);

      return res.status(500).json({
        mensagem: "Erro interno no servidor",
        erro: err.message
      });
    }
  }

  async registrarRH(req, res, next) {
    try {
      const {
        nome_completo,
        email,
        senha,
        nome_fantasia,
        cnpj
      } = req.body;

      const resultado = await UsuarioService.registrarRH({
        nome_completo,
        email,
        senha,
        nome_fantasia,
        cnpj
      });

      return res.status(201).json(resultado);

    } catch (err) {
      console.error("🔥 ERRO RH:", err);
      next(err);
    }
  }

  async deletarConta(req, res, next) {
    try {
      await UsuarioService.deletarConta(req.usuarioId);

      return res.json({
        mensagem: 'Conta excluída com sucesso. Seus dados foram removidos.'
      });

    } catch (err) {
      console.error("🔥 ERRO DELETE CONTA:", err);
      next(err);
    }
  }
}

module.exports = new UsuarioController();