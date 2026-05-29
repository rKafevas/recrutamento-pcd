const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

const ts = Date.now().toString();
const EMAIL_CAND = `cand_${ts}@example.com`;
const EMAIL_RH   = `rh_${ts}@example.com`;
const SENHA = 'Senha123';
const CNPJ  = `${ts.slice(-8,  -6)}.${ts.slice(-6, -3)}.${ts.slice(-3)}/0001-00`;

let tokenCandidato, tokenRH, vagaId;

beforeAll(async () => {
  await request(app).post('/usuarios').send({
    email: EMAIL_CAND,
    senha: SENHA,
    nome_completo: 'Candidato Teste',
    tipo_deficiencia: 'Auditiva'
  });
  const loginCand = await request(app).post('/login').send({ email: EMAIL_CAND, senha: SENHA });
  tokenCandidato = loginCand.body.token;

  await request(app).post('/usuarios/rh').send({
    email: EMAIL_RH,
    senha: SENHA,
    nome_completo: 'Gestor RH',
    nome_fantasia: 'Empresa Teste',
    cnpj: CNPJ
  });
  const loginRH = await request(app).post('/login').send({ email: EMAIL_RH, senha: SENHA });
  tokenRH = loginRH.body.token;

  const resVaga = await request(app)
    .post('/vagas')
    .set('Authorization', `Bearer ${tokenRH}`)
    .send({
      titulo: 'Vaga Teste Integracao',
      descricao: 'Descrição da vaga para teste',
      tipo_deficiencia_foco: 'Auditiva',
      localizacao: 'Remoto',
      salario: '3000'
    });
  vagaId = resVaga.body.id;
});

afterAll(async () => {
  await db.query(`DELETE FROM mensagens WHERE inscricao_id IN (
    SELECT i.id FROM inscricoes i
    JOIN candidatos c ON i.candidato_id = c.id
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE u.email = $1
  )`, [EMAIL_CAND]);
  await db.query(`DELETE FROM inscricoes WHERE candidato_id IN (
    SELECT c.id FROM candidatos c
    JOIN usuarios u ON c.usuario_id = u.id WHERE u.email = $1
  )`, [EMAIL_CAND]);
  await db.query('DELETE FROM vagas WHERE titulo = $1', ['Vaga Teste Integracao']);
  await db.query('DELETE FROM candidatos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = $1)', [EMAIL_CAND]);
  await db.query('DELETE FROM empresas WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = $1)', [EMAIL_RH]);
  await db.query('DELETE FROM usuarios WHERE email IN ($1, $2)', [EMAIL_CAND, EMAIL_RH]);
});

describe('Inscrição em vaga', () => {
  test('POST /inscricoes — candidato se inscreve com sucesso', async () => {
    const res = await request(app)
      .post('/inscricoes')
      .set('Authorization', `Bearer ${tokenCandidato}`)
      .send({ vaga_id: vagaId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('Pendente');
  });

  test('POST /inscricoes — inscrição duplicada retorna erro', async () => {
    const res = await request(app)
      .post('/inscricoes')
      .set('Authorization', `Bearer ${tokenCandidato}`)
      .send({ vaga_id: vagaId });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('GET /inscricoes/minhas — candidato lista inscrições', async () => {
    const res = await request(app)
      .get('/inscricoes/minhas')
      .set('Authorization', `Bearer ${tokenCandidato}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /inscricoes/minhas — sem token retorna 401', async () => {
    const res = await request(app).get('/inscricoes/minhas');
    expect(res.status).toBe(401);
  });
});
