require('dotenv').config();
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

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      process.env.CORS_ORIGIN,
      'https://project-2o4gv.vercel.app',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  optionsSuccessStatus: 200,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
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

// Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// FRONTEND
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas API
app.use(routes);

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

// Migration: amplia colunas de URL de VARCHAR(255) para TEXT
async function runMigrations() {
  try {
    await db.query(`
      DO $$
      BEGIN
        IF (SELECT data_type FROM information_schema.columns
            WHERE table_name = 'candidatos' AND column_name = 'laudo_medico_url') = 'character varying' THEN
          ALTER TABLE candidatos
            ALTER COLUMN laudo_medico_url TYPE TEXT,
            ALTER COLUMN curriculo_url    TYPE TEXT,
            ALTER COLUMN foto_url         TYPE TEXT;
        END IF;
      END $$;
    `);
  } catch (e) {
    console.error('Erro na migration de colunas URL:', e.message);
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS mensagens_diretas (
        id SERIAL PRIMARY KEY,
        remetente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        destinatario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        candidato_usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (e) {
    console.error('Erro na migration de mensagens_diretas:', e.message);
  }
}

runMigrations().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});