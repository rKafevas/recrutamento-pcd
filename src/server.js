require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./database');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const rateLimit = require('express-rate-limit');
const MensagemRepository = require('./repositories/mensagemRepository');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors({ origin: 'https://project-2o4gv.vercel.app' }));
app.use(express.json());
app.set('trust proxy', 1);

// Rate limiting — máximo 10 tentativas de login por IP a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/login', loginLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);

// SOCKET.IO — Chat em tempo real
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token não fornecido'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.usuarioId = decoded.id;
    socket.usuarioTipo = decoded.tipo;
    next();
  } catch(e) { next(new Error('Token inválido')); }
});

io.on('connection', (socket) => {
  // Entra na sala da inscrição
  socket.on('entrar_sala', (inscricaoId) => {
    socket.join(`inscricao_${inscricaoId}`);
  });

  // Recebe e salva mensagem
  socket.on('enviar_mensagem', async (data) => {
    const { inscricaoId, destinatarioId, conteudo } = data;
    if (!conteudo?.trim()) return;
    try {
      const msg = await MensagemRepository.salvar(socket.usuarioId, destinatarioId, inscricaoId, conteudo.trim());
      io.to(`inscricao_${inscricaoId}`).emit('nova_mensagem', {
        ...msg, remetente_id: socket.usuarioId, remetente_tipo: socket.usuarioTipo
      });

      // Notifica o destinatário
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
      const nomeRemetente = r?.nome_fantasia || r?.email || 'Alguém';
      const vagaTitulo = r?.titulo || 'uma vaga';
      await NotificacaoRepository.criar(
        destinatarioId,
        `💬 Nova mensagem de ${nomeRemetente} sobre "${vagaTitulo}"`,
        `chat.html?inscricao=${inscricaoId}`
      );
    } catch(e) { console.error('Erro ao salvar mensagem:', e); }
  });

  socket.on('disconnect', () => {});
});

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.status(200).json({ status: 'Online', database: 'Conectado' });
  } catch(err) {
    res.status(500).json({ status: 'Erro', database: 'Falha na conexão' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ erro: "Ocorreu um problema", mensagem: err.message || "Tente novamente." });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
