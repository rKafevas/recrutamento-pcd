const CandidatoRepository = require('../repositories/candidatoRepository');

class CandidatoService {
  async salvarCaminhoLaudo(usuarioId, caminhoArquivo) {
    // 1. O Service pode aplicar regras extras, como verificar se o arquivo é muito grande
    // ou se o usuário já tem um laudo e precisa deletar o antigo (opcional).

    const atualizado = await CandidatoRepository.atualizarColunaLaudo(usuarioId, caminhoArquivo);
    
    if (!atualizado) {
      const error = new Error('Perfil de candidato não encontrado para este usuário.');
      error.status = 404;
      throw error;
    }

    return atualizado;
  }
}

module.exports = new CandidatoService();