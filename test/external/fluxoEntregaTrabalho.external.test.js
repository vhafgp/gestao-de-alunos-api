import { expect } from 'chai';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin, getToken } from '../helpers/auth.js';
import alunos from '../fixtures/alunos.json' with { type: 'json' };

describe('Entrega de trabalho pelo aluno', () => {
  // Pré-requisitos: API no ar na BASE_URL e o admin do .env cadastrado; aluno, disciplina e matrícula nascem aqui
  it('Validar que um aluno recém-cadastrado e matriculado consegue registrar a entrega de um trabalho', async () => {
    // Arrange: o admin cadastra o aluno e a disciplina e matricula um no outro
    const timestamp = Date.now();
    const [primeiroAluno] = alunos;
    const dadosDoAluno = {
      ...primeiroAluno,
      email: `entrega.${timestamp}@example.com`,
      matricula: `${timestamp}`,
    };

    const cadastroAlunoResposta = await api()
      .post('/api/admin/alunos')
      .set('Content-Type', 'application/json')
      .set('Authorization', await comTokenDeAdmin())
      .send(dadosDoAluno);

    const alunoId = cadastroAlunoResposta.body.id;

    const cadastroDisciplinaResposta = await api()
      .post('/api/admin/disciplinas')
      .set('Content-Type', 'application/json')
      .set('Authorization', await comTokenDeAdmin())
      .send({
        nome: 'Automação de Testes de API',
        codigo: `API${timestamp}`,
        cargaHoraria: 40,
      });

    const disciplinaId = cadastroDisciplinaResposta.body.id;

    await api()
      .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
      .set('Content-Type', 'application/json')
      .set('Authorization', await comTokenDeAdmin())
      .send({ alunoId });

    const tokenDoAluno = await getToken(dadosDoAluno.email, dadosDoAluno.senha);

    // Act: o próprio aluno registra a entrega do trabalho
    const entregaResposta = await api()
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${tokenDoAluno}`)
      .send({
        disciplinaId,
        titulo: 'Suíte de testes com Mocha, SuperTest e Chai',
      });

    // Assert: a entrega foi registrada para esse aluno, nessa disciplina
    expect(entregaResposta.status).to.equal(201);
    expect(entregaResposta.body.alunoId).to.equal(alunoId);
    expect(entregaResposta.body.disciplinaId).to.equal(disciplinaId);
    expect(entregaResposta.body.status).to.equal('entregue');
  });
});
