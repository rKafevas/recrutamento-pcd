const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const cloudinaryUpload = require('../middlewares/cloudinaryMiddleware');
const CandidatoController = require('../controllers/CandidatoController');
const RelatorioController = require('../controllers/relatorioController');

// Rota estática antes de /:id para não ser capturada pelo parâmetro
router.get('/candidatos/busca', authMiddleware, authorize(['RH']), RelatorioController.buscarCandidatos);
router.get('/candidatos/:id', authMiddleware, authorize(['RH']), CandidatoController.buscarPorId);

router.get('/perfil', authMiddleware, authorize(['Candidato']), CandidatoController.buscarPerfil);
router.patch('/perfil/infos', authMiddleware, authorize(['Candidato']), CandidatoController.atualizarInfos);
router.patch('/perfil/foto', authMiddleware, authorize(['Candidato']), upload.single('foto'), cloudinaryUpload, CandidatoController.atualizarFoto);
router.delete('/perfil/foto', authMiddleware, authorize(['Candidato']), CandidatoController.removerFoto);
router.patch('/perfil/laudo', authMiddleware, authorize(['Candidato']), upload.single('laudo'), cloudinaryUpload, CandidatoController.atualizarLaudo);
router.delete('/perfil/laudo', authMiddleware, authorize(['Candidato']), CandidatoController.removerLaudo);
router.patch('/perfil/curriculo', authMiddleware, authorize(['Candidato']), upload.single('curriculo'), cloudinaryUpload, CandidatoController.atualizarCurriculo);
router.delete('/perfil/curriculo', authMiddleware, authorize(['Candidato']), CandidatoController.removerCurriculo);

module.exports = router;
