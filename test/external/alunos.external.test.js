import { expect } from 'chai';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin, getToken } from '../helpers/auth.js';
import alunos from '../fixtures/alunos.json' with { type: 'json' };

// E-mail e matrícula repetidos devolvem 409 e o Mongo persiste entre rodadas: o timestamp mantém a massa única
function comSufixoUnico(aluno) {
  const timestamp = Date.now();
  const [usuario, dominio] = aluno.email.split('@');

  return {
    ...aluno,
    email: `${usuario}.${timestamp}@${dominio}`,
    matricula: `${aluno.matricula}${timestamp}`,
  };
}

describe('Cadastro e login de aluno (orientado a dados)', () => {
  // Pré-requisitos: API no ar na BASE_URL e o admin do .env cadastrado
  alunos.forEach((aluno) => {
    it(`Validar que o admin cadastra o aluno ${aluno.nome} e ele consegue logar com a senha definida no cadastro`, async () => {
      const dadosDoAluno = comSufixoUnico(aluno);

      const cadastroResposta = await api()
        .post('/api/admin/alunos')
        .set('Content-Type', 'application/json')
        .set('Authorization', await comTokenDeAdmin())
        .send(dadosDoAluno);

      expect(cadastroResposta.status).to.equal(201);
      expect(cadastroResposta.body.email).to.equal(dadosDoAluno.email);
      expect(cadastroResposta.body.role).to.equal('aluno');

      const tokenDoAluno = await getToken(dadosDoAluno.email, dadosDoAluno.senha);

      expect(tokenDoAluno).to.not.be.empty;
    });
  });
});
