const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory stores
const users = {}; // key: id -> user object { id, email, cpf, nome, enderecos: [ { id,..., default } ] }

// Simple helper: find user by id or email
function findUserById(id) { return users[id] || null; }
function findUserByEmail(email) { return Object.values(users).find(u => u.email === email) || null; }

// Create a demo user for testing
const demoUserId = nanoid();
users[demoUserId] = {
  id: demoUserId,
  email: 'cliente@demo.com',
  cpf: '00000000000',
  nome: 'Cliente Demo',
  enderecos: []
};

app.get('/users/:id/enderecos', (req, res) => {
  const u = findUserById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(u.enderecos || []);
});

app.post('/users/:id/enderecos', async (req, res) => {
  const u = findUserById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });

  const body = req.body || {};
  const required = ['cep','logradouro','numero','bairro','cidade','uf','nomeRecebedor'];
  for (const f of required) if (!body[f]) return res.status(400).json({ error: `Campo ${f} obrigatório` });

  // Validate cep via viacep
  try {
    const cepClean = String(body.cep).replace(/[^0-9]/g,'');
    const r = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
    const data = await r.json();
    if (data.erro) return res.status(400).json({ error: 'CEP inválido' });
    // Optionally merge addresses from viacep
    body.logradouro = body.logradouro || data.logradouro;
    body.bairro = body.bairro || data.bairro;
    body.cidade = body.cidade || data.localidade;
    body.uf = body.uf || data.uf;
  } catch (e) {
    return res.status(500).json({ error: 'Erro validando CEP' });
  }

  const novo = { id: nanoid(), ...body, enderecoPadrao: false };
  u.enderecos.push(novo);

  // if first address, set enderecoPadrao
  if (u.enderecos.length === 1) u.enderecos[0].enderecoPadrao = true;

  res.status(201).json(novo);
});

app.post('/users/:id/enderecos/:enderecoId/default', (req, res) => {
  const u = findUserById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });
  const e = (u.enderecos||[]).find(x => x.id === req.params.enderecoId);
  if (!e) return res.status(404).json({ error: 'Endereço não encontrado' });
  for (const addr of u.enderecos) addr.enderecoPadrao = false;
  e.enderecoPadrao = true;
  res.json({ ok: true });
});

// Simple registration endpoint used by other team member; basic checks
app.post('/register', (req, res) => {
  const b = req.body || {};
  if (!b.email || !b.cpf || !b.nome) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (findUserByEmail(b.email)) return res.status(400).json({ error: 'Email já existe' });
  if (Object.values(users).some(u => u.cpf === b.cpf)) return res.status(400).json({ error: 'CPF já existe' });
  const id = nanoid();
  users[id] = { id, email: b.email, cpf: b.cpf, nome: b.nome, enderecos: [ b.enderecoFaturamento || {} ] };
  return res.status(201).json({ id });
});

app.get('/demo-user-id', (req, res) => { res.json({ id: demoUserId }); });

app.listen(8080, () => console.log('Mock backend listening on :8080'));
