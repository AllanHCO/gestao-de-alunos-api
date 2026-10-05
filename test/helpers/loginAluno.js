import request from 'supertest';
import app from '../../src/app.js';

async function loginAluno(email, senha) {
  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha });

  return resposta.body.token;
}

export default loginAluno;
