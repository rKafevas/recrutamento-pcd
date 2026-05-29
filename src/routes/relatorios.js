const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const RelatorioController = require('../controllers/relatorioController');

router.get('/relatorio/cotas', authMiddleware, authorize(['RH']), RelatorioController.relatorioCotas);
router.get('/relatorio/cotas/pdf', authMiddleware, authorize(['RH']), RelatorioController.exportarPDF);

module.exports = router;
