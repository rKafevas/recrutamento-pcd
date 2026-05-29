const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const NotificacaoController = require('../controllers/notificacaoController');

router.get('/notificacoes', authMiddleware, NotificacaoController.listar);
router.patch('/notificacoes/lidas', authMiddleware, NotificacaoController.marcarLidas);

module.exports = router;
