import { api } from './api.js';
import 'dotenv/config';

let tokenEmCache = null;

// Um login de admin por execução; o token fica em cache para as demais chamadas
export async function comTokenDeAdmin() {
  if (!tokenEmCache) {
    tokenEmCache = await getToken(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
  }

  return `Bearer ${tokenEmCache}`;
}

export async function getToken(email, senha) {
  const loginResposta = await api()
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email, senha });

  return loginResposta.body.token;
}
