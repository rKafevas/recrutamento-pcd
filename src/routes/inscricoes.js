const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { inscricaoSchema } = require('../validators/inscricaoValidator');
const InscricaoController = require('../controllers/inscricaoController');

router.post('/inscricoes', authMiddleware, authorize(['Candidato']), validate(inscricaoSchema), InscricaoController.inscrever);
router.get('/inscricoes/minhas', authMiddleware, authorize(['Candidato']), InscricaoController.listarMinhasInscricoes);
router.get('/inscricoes/vaga/:vaga_id', authMiddleware, authorize(['RH']), InscricaoController.listarPorVaga);
router.patch('/inscricoes/:id/status', authMiddleware, authorize(['RH']), InscricaoController.atualizarStatus);
router.delete('/inscricoes/:id', authMiddleware, authorize(['Candidato']), InscricaoController.cancelar);

module.exports = router;
