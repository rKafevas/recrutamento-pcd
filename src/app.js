require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/login', loginLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(routes);

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    erro: "Ocorreu um problema",
    mensagem: err.message || "Tente novamente."
  });
});

module.exports = app;
