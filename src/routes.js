const express = require('express');
const routes = express.Router();

// 1. Importação dos Middlewares
const authMiddleware = require('./middlewares/authMiddleware');
const authorize = require('./middlewares/roleMiddleware');
const validate = require('./middlewares/validateMiddleware');
const upload = require('./middlewares/uploadMiddleware');
const cloudinaryUpload = require('./middlewares/cloudinaryMiddleware');

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
const NotificacaoController = require('./controllers/notificacaoController');
const MensagemDiretaController = require('./controllers/mensagemDiretaController');
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
routes.post('/recuperar-senha', AuthController.solicitarRecuperacao);
routes.post('/recuperar-senha/verificar', AuthController.verificarCodigoRecuperacao);
routes.post('/recuperar-senha/redefinir', AuthController.redefinirSenha);
routes.post('/confirmar-email', AuthController.confirmarEmail);
routes.delete('/minha-conta', authMiddleware, authorize(['Candidato']), UsuarioController.deletarConta); 
routes.get('/vagas/minhas', authMiddleware, authorize(['RH']), VagaController.listarMinhas);
routes.get('/vagas/filtro', VagaController.listarComFiltro);
routes.get('/vagas', VagaController.listar);
routes.get('/vagas/:id', VagaController.buscarPorId);
routes.get('/relatorio/cotas', authMiddleware, authorize(['RH']), RelatorioController.relatorioCotas);
routes.get('/relatorio/cotas/pdf', authMiddleware, authorize(['RH']), RelatorioController.exportarPDF);
routes.get('/candidatos/busca', authMiddleware, authorize(['RH']), RelatorioController.buscarCandidatos);

// --- ROTAS PROTEGIDAS (Necessário Token) ---

// 1. Perfil do Candidato (Upload de Laudo)
routes.get('/perfil', authMiddleware, authorize(['Candidato']), CandidatoController.buscarPerfil);
routes.patch('/perfil/infos', authMiddleware, authorize(['Candidato']), CandidatoController.atualizarInfos);
routes.delete('/perfil/curriculo', authMiddleware, authorize(['Candidato']), CandidatoController.removerCurriculo);

routes.patch('/perfil/foto', authMiddleware, authorize(['Candidato']), upload.single('foto'), cloudinaryUpload, CandidatoController.atualizarFoto);
routes.delete('/perfil/foto', authMiddleware, authorize(['Candidato']), CandidatoController.removerFoto);

routes.patch(
  '/perfil/laudo',
  authMiddleware,
  authorize(['Candidato']),
  upload.single('laudo'),
  cloudinaryUpload,
  CandidatoController.atualizarLaudo
);

routes.delete('/perfil/laudo', authMiddleware, authorize(['Candidato']), CandidatoController.removerLaudo);

routes.patch(
  '/perfil/curriculo',
  authMiddleware,
  authorize(['Candidato']),
  upload.single('curriculo'),
  cloudinaryUpload,
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

routes.get('/candidatos/:id', authMiddleware, authorize(['RH']), CandidatoController.buscarPorId);

routes.get('/notificacoes', authMiddleware, NotificacaoController.listar);
routes.patch('/notificacoes/lidas', authMiddleware, NotificacaoController.marcarLidas);

routes.get('/mensagens-diretas/conversas', authMiddleware, MensagemDiretaController.listarConversas);
routes.get('/mensagens-diretas/:outro_usuario_id', authMiddleware, MensagemDiretaController.listarPorConversa);

module.exports = routes;