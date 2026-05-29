const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { vagaSchema } = require('../validators/vagaValidator');
const VagaController = require('../controllers/vagaController');

router.get('/vagas/minhas', authMiddleware, authorize(['RH']), VagaController.listarMinhas);
router.get('/vagas/recomendadas', authMiddleware, authorize(['Candidato']), VagaController.listarRecomendadas);
router.get('/vagas/filtro', VagaController.listarComFiltro);
router.get('/vagas', VagaController.listar);
router.get('/vagas/:id/compatibilidade', authMiddleware, authorize(['RH']), VagaController.compatibilidade);
router.get('/vagas/:id', VagaController.buscarPorId);
router.post('/vagas', authMiddleware, authorize(['RH']), validate(vagaSchema), VagaController.criar);
router.patch('/vagas/:id', authMiddleware, authorize(['RH']), VagaController.editar);
router.patch('/vagas/:id/encerrar', authMiddleware, authorize(['RH']), VagaController.encerrar);

module.exports = router;
