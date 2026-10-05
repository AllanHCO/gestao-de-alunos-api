import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { expect } from 'chai';
import 'dotenv/config';
import app from '../src/app.js';
import loginAdmin from './helpers/loginAdmin.js';
import loginAluno from './helpers/loginAluno.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dados = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'alunos.json'), 'utf8')
);

describe('Fluxo API - admin cadastra aluno e aluno entrega trabalho', function () {
  this.timeout(15000);

  dados.forEach((alunoBase) => {
    it(`cadastra ${alunoBase.nome}, loga como aluno e registra entrega`, async function () {
      const sufixo = Date.now() + Math.floor(Math.random() * 1000);
      const aluno = {
        nome: alunoBase.nome,
        email: alunoBase.email.replace('@', `+${sufixo}@`),
        matricula: `${alunoBase.matricula}${sufixo}`,
        senha: alunoBase.senha,
      };

      const tokenAdmin = await loginAdmin();
      expect(tokenAdmin).to.be.a('string');

      const cadastro = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(aluno);

      expect(cadastro.status).to.equal(201);
      expect(cadastro.body).to.have.property('id');
      expect(cadastro.body.email).to.equal(aluno.email);

      const alunoId = cadastro.body.id;

      const matricula = await request(app)
        .post(`/api/admin/disciplinas/${alunoBase.disciplinaId}/matriculas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ alunoId });

      expect(matricula.status).to.equal(201);

      const tokenAluno = await loginAluno(aluno.email, aluno.senha);
      expect(tokenAluno).to.be.a('string');

      const entrega = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          disciplinaId: alunoBase.disciplinaId,
          titulo: alunoBase.tituloTrabalho,
          descricao: alunoBase.descricaoTrabalho,
        });

      expect(entrega.status).to.equal(201);
      expect(entrega.body).to.have.property('id');
      expect(entrega.body.titulo).to.equal(alunoBase.tituloTrabalho);
      expect(entrega.body.alunoId).to.equal(alunoId);
      expect(entrega.body.status).to.equal('entregue');
    });
  });
});
