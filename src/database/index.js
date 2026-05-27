const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Garante que o Render consiga se conectar ao Neon com segurança
  }
});

pool.on('connect', () => {
  console.log('Base de Dados conectada com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};