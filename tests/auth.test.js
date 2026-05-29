const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

const EMAIL = `auth_${Date.now()}@example.com`;
const SENHA = 'Senha123';

afterAll(async () => {
  await db.query('DELETE FROM candidatos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = $1)', [EMAIL]);
  await db.query('DELETE FROM usuarios WHERE email = $1', [EMAIL]);
});

describe('Autenticação', () => {
  test('POST /usuarios — registra candidato com sucesso', async () => {
    const res = await request(app).post('/usuarios').send({
      email: EMAIL,
      senha: SENHA,
      nome_completo: 'Teste Auth',
      tipo_deficiencia: 'Física'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensagem');
  });

  test('POST /login — login com credenciais corretas retorna token', async () => {
    const res = await request(app).post('/login').send({ email: EMAIL, senha: SENHA });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('tipo');
  });

  test('POST /login — senha errada retorna 401', async () => {
    const res = await request(app).post('/login').send({ email: EMAIL, senha: 'senhaErrada' });
    expect(res.status).toBe(401);
  });

  test('POST /login — e-mail inexistente retorna 401', async () => {
    const res = await request(app).post('/login').send({ email: 'naoexiste@example.com', senha: SENHA });
    expect(res.status).toBe(401);
  });
});
