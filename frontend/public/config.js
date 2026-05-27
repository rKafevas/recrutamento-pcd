// config.js — Altere esta URL após o deploy no Render
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://inclui-plus-api.onrender.com'; // ← Substitua pela URL do Render após o deploy

window.API_URL = API_URL;
