const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

const EMAIL = `perfil_${Date.now()}@example.com`;
const SENHA = 'Senha123';
let token;
let emailRH;

beforeAll(async () => {
  await request(app).post('/usuarios').send({
    email: EMAIL,
    senha: SENHA,
    nome_completo: 'Perfil Teste',
    tipo_deficiencia: 'Visual'
  });
  const login = await request(app).post('/login').send({ email: EMAIL, senha: SENHA });
  token = login.body.token;
});

afterAll(async () => {
  await db.query('DELETE FROM candidatos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = $1)', [EMAIL]);
  await db.query('DELETE FROM usuarios WHERE email = $1', [EMAIL]);
  if (emailRH) {
    await db.query('DELETE FROM empresas WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = $1)', [emailRH]);
    await db.query('DELETE FROM usuarios WHERE email = $1', [emailRH]);
  }
});

describe('Perfil do candidato', () => {
  test('GET /perfil — retorna perfil do candidato autenticado', async () => {
    const res = await request(app)
      .get('/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', EMAIL);
  });

  test('PATCH /perfil/infos — atualiza informações do perfil', async () => {
    const res = await request(app)
      .patch('/perfil/infos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Perfil Atualizado',
        sobre: 'Texto sobre o candidato',
        habilidades: 'Node.js, PostgreSQL'
      });
    expect(res.status).toBe(200);
    expect(res.body.dados.nome_completo).toBe('Perfil Atualizado');
  });

  test('GET /perfil — sem token retorna 401', async () => {
    const res = await request(app).get('/perfil');
    expect(res.status).toBe(401);
  });

  test('PATCH /perfil/infos — token de RH retorna 403', async () => {
    const ts = Date.now().toString();
    emailRH = `rh_perfil_${ts}@example.com`;
    const cnpj = `${ts.slice(-8, -6)}.${ts.slice(-6, -3)}.${ts.slice(-3)}/0001-01`;
    await request(app).post('/usuarios/rh').send({
      email: emailRH,
      senha: SENHA,
      nome_completo: 'Gestor',
      nome_fantasia: 'Empresa',
      cnpj
    });
    const loginRH = await request(app).post('/login').send({ email: emailRH, senha: SENHA });
    const tokenRH = loginRH.body.token;

    const res = await request(app)
      .patch('/perfil/infos')
      .set('Authorization', `Bearer ${tokenRH}`)
      .send({ nome_completo: 'Tentativa RH' });
    expect(res.status).toBe(403);
  });
});
