const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const MensagemController = require('../controllers/mensagemController');
const MensagemDiretaController = require('../controllers/mensagemDiretaController');

router.get('/mensagens/conversas', authMiddleware, MensagemController.listarConversas);
router.get('/mensagens/inscricao/:inscricao_id/dados', authMiddleware, MensagemController.buscarDadosInscricao);
router.get('/mensagens/:inscricao_id', authMiddleware, MensagemController.listarPorInscricao);

router.get('/mensagens-diretas/conversas', authMiddleware, MensagemDiretaController.listarConversas);
router.get('/mensagens-diretas/:outro_usuario_id', authMiddleware, MensagemDiretaController.listarPorConversa);

module.exports = router;
