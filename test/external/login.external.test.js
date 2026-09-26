import { expect } from 'chai';
import { api } from '../helpers/api.js';
import 'dotenv/config';

describe('POST /api/auth/login', () => {
  // Pré-requisitos: API no ar na BASE_URL e o admin do .env cadastrado (o seed já cria)
  it('Validar que o administrador recebe um token ao informar e-mail e senha corretos', async () => {
    const resposta = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: process.env.ADMIN_EMAIL,
        senha: process.env.ADMIN_SENHA,
      });

    expect(resposta.status).to.equal(200);
    expect(resposta.body.token).to.not.be.empty;
    expect(resposta.body.usuario.role).to.equal('admin');
  });

  it('Validar que o login é recusado com 401 quando a senha está errada', async () => {
    const resposta = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: process.env.ADMIN_EMAIL,
        senha: 'senha-errada',
      });

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });
});
