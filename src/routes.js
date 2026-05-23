const express = require('express');
const routes = express.Router();

// 1. Importação dos Middlewares
const authMiddleware = require('./middlewares/authMiddleware');
const authorize = require('./middlewares/roleMiddleware');
const validate = require('./middlewares/validateMiddleware');
const upload = require('./middlewares/uploadMiddleware');

// 2. Importação dos Validators (Joi)
const { usuarioSchema, loginSchema, rhSchema } = require('./validators/usuarioValidator');
const { vagaSchema } = require('./validators/vagaValidator');
const { inscricaoSchema } = require('./validators/inscricaoValidator');

// 3. Importação dos Controllers
const UsuarioController = require('./controllers/usuarioController');
const VagaController = require('./controllers/vagaController');
const InscricaoController = require('./controllers/inscricaoController');
const AuthController = require('./controllers/authController');
const CandidatoController = require('./controllers/CandidatoController');
const RelatorioController = require('./controllers/relatorioController');
const MensagemController = require('./controllers/mensagemController');
routes.get('/', (req, res) => {
  return res.json({ 
    mensagem: "Bem-vindo à API do Sistema de Recrutamento PcD!",
    status: "Online" 
  });
});

// --- ROTAS PÚBLICAS ---
routes.post('/usuarios', validate(usuarioSchema), UsuarioController.registrar);
routes.post('/usuarios/rh', validate(rhSchema), UsuarioController.registrarRH);
routes.post('/login', validate(loginSchema), AuthController.login);
routes.delete('/minha-conta', authMiddleware, authorize(['Candidato']), UsuarioController.deletarConta); 
routes.get('/vagas/minhas', authMiddleware, authorize(['RH']), VagaController.listarMinhas);
routes.get('/vagas/filtro', VagaController.listarComFiltro);
routes.get('/relatorio/cotas', authMiddleware, authorize(['RH']), RelatorioController.relatorioCotas);

// --- ROTAS PROTEGIDAS (Necessário Token) ---

// 1. Perfil do Candidato (Upload de Laudo)
routes.patch(
  '/perfil/laudo', 
  authMiddleware, 
  authorize(['Candidato']), 
  upload.single('laudo'), 
  CandidatoController.atualizarLaudo
);

routes.patch(
  '/perfil/curriculo',
  authMiddleware,
  authorize(['Candidato']),
  upload.single('curriculo'),
  CandidatoController.atualizarCurriculo
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

routes.patch(
  '/vagas/:id',
  authMiddleware,
  authorize(['RH']),
  VagaController.editar
);

routes.patch(
  '/vagas/:id/encerrar',
  authMiddleware,
  authorize(['RH']),
  VagaController.encerrar
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

routes.get('/mensagens/conversas', authMiddleware, MensagemController.listarConversas);
routes.get('/mensagens/inscricao/:inscricao_id/dados', authMiddleware, MensagemController.buscarDadosInscricao);
routes.get('/mensagens/:inscricao_id', authMiddleware, MensagemController.listarPorInscricao);

module.exports = routes;