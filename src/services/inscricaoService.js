const InscricaoRepository = require('../repositories/inscricaoRepository');
const db = require('../database'); // Para fazer a busca rápida do candidato_id

class InscricaoService {
  async seCandidatar(usuarioId, vagaId) {
    // 1. TRADUÇÃO: O Token nos dá o usuarioId, mas a inscrição precisa do candidatoId
    const queryCandidato = 'SELECT id FROM candidatos WHERE usuario_id = $1';
    const resultCandidato = await db.query(queryCandidato, [usuarioId]);

    if (resultCandidato.rows.length === 0) {
      throw new Error('Perfil de candidato não encontrado para este usuário.');
    }
    const candidatoId = resultCandidato.rows[0].id;

    // 2. REGRA DE NEGÓCIO: Não permitir duas inscrições na mesma vaga
    const jaInscrito = await InscricaoRepository.buscarInscricaoEspecifica(candidatoId, vagaId);
    if (jaInscrito) {
      throw new Error('Você já está inscrito nesta vaga.');
    }

    // 3. EXECUÇÃO: Cria a inscrição via Repository
    return await InscricaoRepository.criar(candidatoId, vagaId);
  }

  async verMinhasInscricoes(usuarioId) {
    // Primeiro descobrimos quem é o candidato
    const queryCandidato = 'SELECT id FROM candidatos WHERE usuario_id = $1';
    const resultCandidato = await db.query(queryCandidato, [usuarioId]);

    if (resultCandidato.rows.length === 0) return [];
    
    const candidatoId = resultCandidato.rows[0].id;
    return await InscricaoRepository.listarPorCandidato(candidatoId);
  }

  async verInscritosNaVaga(vagaId) {
    return await InscricaoRepository.listarPorVaga(vagaId);
  }

  async alterarStatusInscricao(id, novoStatus) {
    const statusPermitidos = ['Pendente', 'Aprovado', 'Reprovado', 'Entrevista'];
  
    if (!statusPermitidos.includes(novoStatus)) {
      throw new Error('Status inválido. Escolha entre: ' + statusPermitidos.join(', '));
    }
    
    return await InscricaoRepository.atualizarStatus(id, novoStatus);
  }
}

module.exports = new InscricaoService();