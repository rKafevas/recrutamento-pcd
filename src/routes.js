const express = require('express');
const routes = express.Router();

// 1. Importação dos Middlewares
const authMiddleware = require('./middlewares/authMiddleware');
const authorize = require('./middlewares/roleMiddleware');
const validate = require('./middlewares/validateMiddleware');
const upload = require('./middlewares/uploadMiddleware');

// 2. Importação dos Validators (Joi)
const { usuarioSchema, loginSchema } = require('./validators/usuarioValidator');
const { vagaSchema } = require('./validators/vagaValidator');
const { inscricaoSchema } = require('./validators/inscricaoValidator');

// 3. Importação dos Controllers
const UsuarioController = require('./controllers/usuarioController');
const VagaController = require('./controllers/vagaController');
const InscricaoController = require('./controllers/inscricaoController');
const AuthController = require('./controllers/authController');
const CandidatoController = require('./controllers/CandidatoController');

// --- ROTA DE BOAS-VINDAS ---
routes.get('/', (req, res) => {
  return res.json({ 
    mensagem: "Bem-vindo à API do Sistema de Recrutamento PcD!",
    status: "Online" 
  });
});

// --- ROTAS PÚBLICAS ---
routes.post('/usuarios', validate(usuarioSchema), UsuarioController.registrar);
routes.post('/login', validate(loginSchema), AuthController.login);
routes.get('/vagas', VagaController.listar); 

// --- ROTAS PROTEGIDAS (Necessário Token) ---

// 1. Perfil do Candidato (Upload de Laudo)
routes.patch(
  '/perfil/laudo', 
  authMiddleware, 
  authorize(['Candidato']), 
  upload.single('laudo'), 
  CandidatoController.atualizarLaudo
);

// 2. Ações do Candidato
routes.get('/vagas/recomendadas', authMiddleware, authorize(['Candidato']), VagaController.listarRecomendadas);

routes.post(
  '/inscricoes', 
  authMiddleware, 
  authorize(['Candidato']), 
  validate(inscricaoSchema), 
  InscricaoController.inscrever
);

routes.get(
  '/inscricoes/minhas', 
  authMiddleware, 
  authorize(['Candidato']), 
  InscricaoController.listarMinhasInscricoes
);

// 3. Ações do RH
routes.post(
  '/vagas', 
  authMiddleware, 
  authorize(['RH']), 
  validate(vagaSchema), 
  VagaController.criar
);

routes.get(
  '/inscricoes/vaga/:vaga_id', 
  authMiddleware, 
  authorize(['RH']), 
  InscricaoController.listarPorVaga
);

routes.patch(
  '/inscricoes/:id/status', 
  authMiddleware, 
  authorize(['RH']), 
  InscricaoController.atualizarStatus
);

module.exports = routes;