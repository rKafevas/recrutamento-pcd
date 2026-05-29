const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { usuarioSchema, loginSchema, rhSchema } = require('../validators/usuarioValidator');
const UsuarioController = require('../controllers/usuarioController');
const AuthController = require('../controllers/authController');

router.post('/usuarios', validate(usuarioSchema), UsuarioController.registrar);
router.post('/usuarios/rh', validate(rhSchema), UsuarioController.registrarRH);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/recuperar-senha', AuthController.solicitarRecuperacao);
router.post('/recuperar-senha/verificar', AuthController.verificarCodigoRecuperacao);
router.post('/recuperar-senha/redefinir', AuthController.redefinirSenha);
router.post('/confirmar-email', AuthController.confirmarEmail);
router.delete('/minha-conta', authMiddleware, authorize(['Candidato']), UsuarioController.deletarConta);

module.exports = router;
