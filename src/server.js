require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const MensagemRepository = require('./repositories/mensagemRepository');
const { runMigrations } = require('./database/migrator');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// SOCKET.IO — Chat em tempo real
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Token não fornecido'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.usuarioId = decoded.id;
    socket.usuarioTipo = decoded.tipo;

    next();
  } catch (e) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {

  // Entrar na sala
  socket.on('entrar_sala', (inscricaoId) => {
    socket.join(`inscricao_${inscricaoId}`);
  });

  // Enviar mensagem
  socket.on('enviar_mensagem', async (data) => {

    const { inscricaoId, destinatarioId, conteudo } = data;

    if (!conteudo?.trim()) return;

    try {

      const msg = await MensagemRepository.salvar(
        socket.usuarioId,
        destinatarioId,
        inscricaoId,
        conteudo.trim()
      );

      io.to(`inscricao_${inscricaoId}`).emit('nova_mensagem', {
        ...msg,
        remetente_id: socket.usuarioId,
        remetente_tipo: socket.usuarioTipo
      });

      // Notificação
      const NotificacaoRepository = require('./repositories/notificacaoRepository');

      const { rows } = await db.query(`
        SELECT u.email, e.nome_fantasia, v.titulo
        FROM usuarios u
        LEFT JOIN empresas e ON e.usuario_id = u.id
        LEFT JOIN inscricoes i ON i.id = $2
        LEFT JOIN vagas v ON v.id = i.vaga_id
        WHERE u.id = $1
      `, [socket.usuarioId, inscricaoId]);

      const r = rows[0];

      const nomeRemetente =
        r?.nome_fantasia ||
        r?.email ||
        'Alguém';

      const vagaTitulo =
        r?.titulo ||
        'uma vaga';

      await NotificacaoRepository.criar(
        destinatarioId,
        `💬 Nova mensagem de ${nomeRemetente} sobre "${vagaTitulo}"`,
        `chat.html?inscricao=${inscricaoId}`
      );

    } catch (e) {
      console.error('Erro ao salvar mensagem:', e);
    }

  });

  // Mensagens diretas — Banco de Talentos
  socket.on('entrar_sala_direta', (outroUsuarioId) => {
    const roomId = [socket.usuarioId, outroUsuarioId].sort((a, b) => a - b).join('_');
    socket.join(`direto_${roomId}`);
  });

  socket.on('enviar_mensagem_direta', async ({ destinatarioId, conteudo }) => {
    if (!conteudo?.trim()) return;
    const candidatoUsuarioId = socket.usuarioTipo === 'Candidato' ? socket.usuarioId : destinatarioId;
    try {
      const MensagemDiretaRepository = require('./repositories/mensagemDiretaRepository');
      const msg = await MensagemDiretaRepository.salvar(
        socket.usuarioId,
        destinatarioId,
        candidatoUsuarioId,
        conteudo.trim()
      );
      const roomId = [socket.usuarioId, destinatarioId].sort((a, b) => a - b).join('_');
      io.to(`direto_${roomId}`).emit('nova_mensagem_direta', {
        ...msg,
        remetente_id: socket.usuarioId,
        remetente_tipo: socket.usuarioTipo
      });

      const NotificacaoRepository = require('./repositories/notificacaoRepository');
      const { rows } = await db.query(
        `SELECT COALESCE(e.nome_fantasia, u.email) AS nome
         FROM usuarios u LEFT JOIN empresas e ON e.usuario_id = u.id
         WHERE u.id = $1`,
        [socket.usuarioId]
      );
      await NotificacaoRepository.criar(
        destinatarioId,
        `💼 Nova mensagem do Banco de Talentos de ${rows[0]?.nome || 'Alguém'}`,
        'chat.html'
      );
    } catch(e) {
      console.error('Erro ao salvar mensagem direta:', e);
    }
  });

  socket.on('disconnect', () => {});

});

// Health check
app.get('/health', async (req, res) => {

  try {

    await db.query('SELECT NOW()');

    res.status(200).json({
      status: 'Online',
      database: 'Conectado'
    });

  } catch (err) {

    res.status(500).json({
      status: 'Erro',
      database: 'Falha na conexão'
    });

  }

});

// Tratamento de erros
app.use((err, req, res, next) => {

  console.error(err.stack);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    erro: "Ocorreu um problema",
    mensagem: err.message || "Tente novamente."
  });

});

const PORT = process.env.PORT || 3000;

runMigrations().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});