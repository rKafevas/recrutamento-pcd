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

  async buscarPorId(req, res, next) {
    try {
      const { rows } = await require('../database').query(`
        SELECT c.*, u.email FROM candidatos c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = $1
      `, [req.params.id]);
      return res.json(rows[0] || {});
    } catch(err) { next(err); }
  }

  async buscarPerfil(req, res, next) {
    try {
      const perfil = await CandidatoService.buscarPerfil(req.usuarioId);
      return res.json(perfil || {});
    } catch(err) { next(err); }
  }

  async atualizarCurriculo(req, res, next) {
    try {
      if (!req.file) { const e = new Error('Nenhum arquivo enviado.'); e.status = 400; throw e; }
      const { nome, sobre, telefone } = req.body;
      const perfil = await CandidatoService.salvarCurriculo(req.usuarioId, req.file.path, nome, sobre, telefone);
      return res.status(200).json({ mensagem: 'Currículo salvo com sucesso!', dados: perfil });
    } catch(err) { next(err); }
  }

  async atualizarInfos(req, res, next) {
    try {
      const { nome, sobre, telefone, formacao, experiencias, habilidades } = req.body;
      const perfil = await CandidatoService.atualizarInfos(req.usuarioId, nome, sobre, telefone, formacao, experiencias, habilidades);
      return res.status(200).json({ mensagem: 'Informações salvas!', dados: perfil });
    } catch(err) { next(err); }
  }

  async removerCurriculo(req, res, next) {
    try {
      const perfil = await CandidatoService.removerCurriculo(req.usuarioId);
      return res.json({ mensagem: 'Currículo removido.', dados: perfil });
    } catch(err) { next(err); }
  }
  async removerLaudo(req, res, next) {
    try {
      const perfil = await CandidatoService.removerLaudo(req.usuarioId);
      return res.json({ mensagem: 'Laudo removido.', dados: perfil });
    } catch(err) { next(err); }
  }
  async atualizarFoto(req, res, next) {
    try {
      if (!req.file) { const e = new Error('Nenhum arquivo enviado.'); e.status = 400; throw e; }
      const perfil = await CandidatoService.atualizarFoto(req.usuarioId, req.file.path);
      return res.json({ mensagem: 'Foto atualizada!', dados: perfil });
    } catch(err) { next(err); }
  }

  async removerFoto(req, res, next) {
    try {
      const perfil = await CandidatoService.removerFoto(req.usuarioId);
      return res.json({ mensagem: 'Foto removida.', dados: perfil });
    } catch(err) { next(err); }
  }
}

module.exports = new CandidatoController();