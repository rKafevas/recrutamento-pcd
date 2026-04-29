const express = require('express');
const routes = express.Router();

// 1. Importação dos Middlewares
const authMiddleware = require('./middlewares/authMiddleware');
const authorize = require('./middlewares/roleMiddleware');
const validate = require('./middlewares/validateMiddleware'); // <--- NOVO

// 2. Importação dos Validators (Joi)
const { usuarioSchema, loginSchema } = require('./validators/usuarioValidator'); // <--- NOVO

// 3. Importação dos Controllers
const UsuarioController = require('./controllers/usuarioController');
const VagaController = require('./controllers/vagaController');
const InscricaoController = require('./controllers/inscricaoController');
const AuthController = require('./controllers/authController');

// --- ROTA DE BOAS-VINDAS ---
routes.get('/', (req, res) => {
  return res.json({ 
    mensagem: "Bem-vindo à API do Sistema de Recrutamento PcD!",
    status: "Online" 
  });
});

// --- ROTAS PÚBLICAS (Com Validação de Dados) ---
// Note que o 'validate' vem ANTES do Controller
routes.post('/usuarios', validate(usuarioSchema), UsuarioController.registrar);
routes.post('/login', validate(loginSchema), AuthController.login);

routes.get('/vagas', VagaController.listar); 

// --- ROTAS PROTEGIDAS (Necessário Token) ---

// 3. Rotas acessíveis por QUALQUER usuário logado (Candidato ou RH)
routes.get('/vagas/recomendadas', authMiddleware, VagaController.listarRecomendadas);
routes.post('/inscricoes', authMiddleware, InscricaoController.inscrever);
routes.get('/inscricoes/minhas', authMiddleware, InscricaoController.listarMinhasInscricoes);

// 4. Rotas EXCLUSIVAS para RH
routes.post(
  '/vagas', 
  authMiddleware, 
  authorize(['RH']), 
  VagaController.cadastrar
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