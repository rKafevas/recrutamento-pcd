const InscricaoService = require('../services/inscricaoService');
// 1. IMPORTAÇÃO FALTANTE: Precisamos do Repository para as rotas de listagem e patch
const InscricaoRepository = require('../repositories/inscricaoRepository');

class InscricaoController {
  
  // Realiza a inscrição usando o ID vindo do Token
  async inscrever(req, res) {
    try {
      const { vaga_id } = req.body;
      const usuario_id = req.usuarioId; 

      if (!vaga_id) {
        return res.status(400).json({ error: 'O ID da vaga é obrigatório.' });
      }

      const inscricao = await InscricaoService.seCandidatar(usuario_id, vaga_id);
      
      return res.status(201).json({
        mensagem: "Inscrição realizada com sucesso!",
        dados: inscricao
      });
    } catch (err) {
      console.error("ERRO NA INSCRIÇÃO:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // Lista as inscrições do usuário logado
  async listarMinhasInscricoes(req, res) {
    try {
      const usuario_id = req.usuarioId; 
      const lista = await InscricaoService.verMinhasInscricoes(usuario_id);
      return res.json(lista);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar suas inscrições' });
    }
  }

  // Rota de gestão (RH) - Listar todos os candidatos de uma vaga
  async listarPorVaga(req, res) {
    try {
      const { vaga_id } = req.params;

      // Agora o InscricaoRepository está definido!
      const inscritos = await InscricaoRepository.listarPorVaga(vaga_id);

      if (inscritos.length === 0) {
        return res.status(200).json({ mensagem: "Ainda não há inscritos para esta vaga." });
      }

      return res.json(inscritos);
    } catch (err) {
      console.error("Erro ao listar inscritos:", err);
      return res.status(500).json({ error: "Erro ao buscar lista de inscritos." });
    }
  } // <-- Chave de fechamento da função estava aqui

  // Atualizar o status (Aprovado, Reprovado, etc)
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params; 
      const { status } = req.body; 

      if (!status) {
        return res.status(400).json({ error: "O campo status é obrigatório." });
      }

      const inscricaoAtualizada = await InscricaoRepository.atualizarStatus(id, status);

      if (!inscricaoAtualizada) {
        return res.status(404).json({ error: "Inscrição não encontrada." });
      }

      return res.json({
        mensagem: "Status atualizado com sucesso!",
        inscricao: inscricaoAtualizada
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      return res.status(500).json({ error: "Erro interno ao atualizar status." });
    }
  }
}

module.exports = new InscricaoController();