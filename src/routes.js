const express = require('express');
const routes = express.Router();

routes.get('/', (req, res) => {
  return res.json({
    mensagem: "Bem-vindo à API do Sistema de Recrutamento PcD!",
    status: "Online"
  });
});

routes.use(require('./routes/auth'));
routes.use(require('./routes/vagas'));
routes.use(require('./routes/candidatos'));
routes.use(require('./routes/inscricoes'));
routes.use(require('./routes/mensagens'));
routes.use(require('./routes/notificacoes'));
routes.use(require('./routes/relatorios'));

module.exports = routes;