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
const MensagemRepository = require('./repositories/mensagemRepository');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);

// SOCKET.IO — Chat em tempo real
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token não fornecido'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inclui_secret_key');
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
        ...msg,
        remetente_id: socket.usuarioId,
        remetente_tipo: socket.usuarioTipo
      });
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
