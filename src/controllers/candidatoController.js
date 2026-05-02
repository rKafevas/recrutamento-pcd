const CandidatoService = require('../services/candidatoService');

class CandidatoController {
  async atualizarLaudo(req, res, next) {
    try {
      // 1. Verificação básica se o arquivo foi interceptado pelo Multer
      if (!req.file) {
        const error = new Error('Nenhum arquivo de laudo foi enviado.');
        error.status = 400;
        throw error;
      }

      // 2. Pegamos o caminho do arquivo e o ID do usuário (vindo do Token JWT)
      const urlLaudo = req.file.path; 
      const usuarioId = req.usuarioId;

      // 3. Chamamos o Service para atualizar a coluna 'laudo_medico_url'
      const perfilAtualizado = await CandidatoService.salvarCaminhoLaudo(usuarioId, urlLaudo);

      return res.status(200).json({
        mensagem: "Laudo médico enviado e vinculado ao perfil com sucesso!",
        arquivo: req.file.filename,
        dados: perfilAtualizado
      });

    } catch (err) {
      next(err); // Envia para o seu Error Handler Global
    }
  }

  // Futuramente, você pode adicionar aqui o 'atualizarPerfil' ou 'verMeuPerfil'
}

module.exports = new CandidatoController();