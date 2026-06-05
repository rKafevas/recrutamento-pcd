const InscricaoRepository = require('../repositories/inscricaoRepository');
const CandidatoRepository = require('../repositories/candidatoRepository');
const LogRepository = require('../repositories/logRepository');
const NotificacaoRepository = require('../repositories/notificacaoRepository');
const db = require('../database');

class InscricaoService {
  async seCandidatar(usuarioId, vagaId) {
    const candidato = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!candidato) {
      const error = new Error('Perfil de candidato não encontrado.');
      error.status = 404;
      throw error;
    }

    const jaInscrito = await InscricaoRepository.buscarInscricaoEspecifica(candidato.id, vagaId);
    if (jaInscrito) {
      const error = new Error('Você já está inscrito nesta vaga.');
      error.status = 409;
      throw error;
    }

    const inscricao = await InscricaoRepository.criar(candidato.id, vagaId);
    await LogRepository.registrar(usuarioId, `Candidatura realizada na vaga ID ${vagaId}`);
    return inscricao;
  }

  async verMinhasInscricoes(usuarioId) {
    const candidato = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!candidato) return [];
    const lista = await InscricaoRepository.listarPorCandidato(candidato.id);
    return lista || [];
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

  async cancelarInscricao(usuarioId, inscricaoId) {
    const candidato = await CandidatoRepository.buscarPorUsuarioId(usuarioId);
    if (!candidato) {
      const e = new Error('Perfil de candidato não encontrado.'); e.status = 404; throw e;
    }
    const removida = await InscricaoRepository.cancelar(inscricaoId, candidato.id);
    if (!removida) {
      const e = new Error('Candidatura não encontrada ou não pode ser cancelada. Só é possível cancelar candidaturas com status "Pendente".');
      e.status = 400; throw e;
    }
    await LogRepository.registrar(usuarioId, `Candidatura ID ${inscricaoId} cancelada pelo candidato`);
    return removida;
  }

  async alterarStatus(id, novoStatus, motivoReprovacao = null) {
    const statusPermitidos = ['Pendente', 'Em análise', 'Aprovado', 'Reprovado', 'Entrevista'];
    if (!statusPermitidos.includes(novoStatus)) {
      const error = new Error(`Status inválido. Escolha entre: ${statusPermitidos.join(', ')}`);
      error.status = 400;
      throw error;
    }
    if (novoStatus === 'Reprovado' && !motivoReprovacao) {
      const error = new Error('Informe o motivo da reprovação.');
      error.status = 400;
      throw error;
    }
    const motivo = novoStatus === 'Reprovado' ? motivoReprovacao : null;
    const atualizada = await InscricaoRepository.atualizarStatus(id, novoStatus, motivo);
    if (!atualizada) { const e = new Error('Inscrição não encontrada.'); e.status = 404; throw e; }
    await LogRepository.registrar(null, `Status da inscrição ID ${id} alterado para "${novoStatus}"`);

    // Notifica o candidato
    try {
      const { rows } = await db.query(`
        SELECT c.usuario_id, v.titulo FROM inscricoes i
        JOIN candidatos c ON i.candidato_id = c.id
        JOIN vagas v ON i.vaga_id = v.id
        WHERE i.id = $1`, [id]);
      if (rows[0]) {
        const msgs = {
          'Aprovado':   '🎉 Parabéns! Você foi aprovado(a)',
          'Reprovado':  '❌ Sua candidatura foi reprovada',
          'Entrevista': '📅 Entrevista agendada — aguarde contato da empresa',
          'Em análise': '🔍 Sua candidatura está sendo analisada',
          'Pendente':   '📩 Candidatura recebida com sucesso'
        };
        await NotificacaoRepository.criar(
          rows[0].usuario_id,
          `${msgs[novoStatus] || 'Status atualizado'} para a vaga "${rows[0].titulo}"`,
          'candidaturas.html'
        );
      }
    } catch(e) { console.error('Erro ao notificar candidato:', e.message); }

    return atualizada;
  }
}

module.exports = new InscricaoService();
