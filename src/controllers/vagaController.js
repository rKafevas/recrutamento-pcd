const VagaService = require('../services/vagaService');

class VagaController {
  async cadastrar(req, res) {
    try {
      const vaga = await VagaService.anunciarVaga(req.body);
      return res.status(201).json(vaga);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar vaga' });
    }
  }

  async listar(req, res) {
    try {
      const vagas = await VagaService.listarVagas();
      return res.json(vagas);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar vagas' });
    }
  }
  
  async listarRecomendadas(req, res) {
    try {
      // Em vez de req.query, usamos o ID que o authMiddleware extraiu do Token
      const usuarioId = req.usuarioId; 
    
      // O Service agora recebe o ID do usuário e faz o trabalho pesado
      const vagas = await VagaService.recomendarVagasParaCandidato(usuarioId);
    
      return res.json(vagas);
    } catch (err) {
      console.error("ERRO RECOMENDAÇÕES:", err);
      return res.status(500).json({ error: 'Erro ao filtrar vagas recomendadas' });
  }
}
}

module.exports = new VagaController();