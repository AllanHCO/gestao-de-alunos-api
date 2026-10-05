import request from 'supertest';
import 'dotenv/config';
import app from '../../src/app.js';

async function loginAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@escola.com';
  const senha = process.env.ADMIN_SENHA || 'admin123';

  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha });

  return resposta.body.token;
}

export default loginAdmin;
