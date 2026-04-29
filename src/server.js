// 1. Configurações iniciais
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database'); 
const routes = require('./routes'); 

const app = express();

// 2. Middlewares Globais
app.use(cors());
app.use(express.json());

// 3. Rota de Health Check (Verificação rápida)
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.status(200).json({ 
      status: 'Online', 
      database: 'Conectado',
      mensagem: 'Sistema de Recrutamento PcD pronto para operar!' 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'Erro', 
      database: 'Falha na conexão', 
      detalhes: err.message 
    });
  }
});

// 4. Carregamento das Rotas Principais
app.use(routes);

// 5. Middleware de Erro Global (A rede de segurança)
// Este middleware DEVE ter 4 parâmetros (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('--- LOG DE ERRO ---');
  console.error(err.stack); // Mostra o erro detalhado no seu terminal

  // Se o erro vier do Joi (validação), ele pode já ter um status 400
  // Caso contrário, assumimos 500 (Erro Interno)
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    erro: "Ocorreu um problema na operação",
    mensagem: err.message || "Tente novamente mais tarde."
  });
});

// 6. Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});