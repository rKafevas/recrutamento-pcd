const InscricaoRepository = require('../repositories/inscricaoRepository');

class InscricaoService {
  async seCandidatar(usuarioId, vagaId) {
    // 1. REGRA DE NEGÓCIO: Verificar se o candidato já está inscrito
    // Delegamos a verificação de duplicidade para o repository de forma limpa
    const jaInscrito = await InscricaoRepository.verificarDuplicidade(usuarioId, vagaId);
    
    if (jaInscrito) {
      const error = new Error('Você já está inscrito nesta vaga.');
      error.status = 409; // Conflict
      throw error;
    }

    // 2. EXECUÇÃO: O Repository agora cuida de descobrir o candidato_id internamente
    return await InscricaoRepository.criar(usuario_id, vaga_id);
  }

  async verMinhasInscricoes(usuarioId) {
    const lista = await InscricaoRepository.listarPorCandidato(usuarioId);
    
    if (!lista || lista.length === 0) {
      return [];
    }
    
    return lista;
  }

  async listarInscritosPorVaga(vagaId) {
    const inscritos = await InscricaoRepository.listarPorVaga(vagaId);
    
    if (!inscritos) {
      const error = new Error('Vaga não encontrada ou sem inscritos.');
      error.status = 404;
      throw error;
    }
    
    return inscritos;
  }

  async alterarStatus(id, novoStatus) {
    const statusPermitidos = ['Pendente', 'Aprovado', 'Reprovado', 'Entrevista'];
  
    if (!statusPermitidos.includes(novoStatus)) {
      const error = new Error(`Status inválido. Escolha entre: ${statusPermitidos.join(', ')}`);
      error.status = 400; // Bad Request
      throw error;
    }
    
    const atualizada = await InscricaoRepository.atualizarStatus(id, novoStatus);
    
    if (!atualizada) {
      const error = new Error('Inscrição não encontrada para atualização.');
      error.status = 404;
      throw error;
    }

    return atualizada;
  }
}

module.exports = new InscricaoService();