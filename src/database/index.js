const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Base de Dados conectada com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};