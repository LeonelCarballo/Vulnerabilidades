const express = require('express');

const SEGURO = (process.env.MODO || '').trim() === 'seguro'; //
const app = express();
app.use(express.urlencoded({ extended: false }));

const comentarios = []; 

//seguro
const escapar = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');


const mostrar = (t) => (SEGURO ? escapar(t) : t);

app.use((req, res, next) => {
  if (SEGURO) res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
  next();
});

app.get('/', (req, res) => {
  const lista = comentarios.map((c) => `<li>${mostrar(c)}</li>`).join(''); // XSS ALMACENADO
  res.send(`
    <h1>Modo: ${SEGURO ? 'SEGURO ' : 'VULNERABLE '}</h1>

    <h2>Buscador</h2>
    <form method="GET" action="/buscar">
      <input name="q" placeholder="buscar...">
      <button>Buscar</button>
    </form>

    <h2>Comentarios</h2>
    <form method="POST" action="/comentar">
      <input name="texto" placeholder="escribe un comentario">
      <button>Enviar</button>
    </form>
    <ul>${lista}</ul>`);
});

app.get('/buscar', (req, res) => {
  const q = String(req.query.q || '');
  res.send(`<h2>Resultados para: ${mostrar(q)}</h2><a href="/">Volver</a>`); // XSS REFLEJADO
});

app.post('/comentar', (req, res) => {
  comentarios.push(String(req.body.texto || '').slice(0, 500));
  res.redirect('/');
});

app.listen(3000, () =>
  console.log(`Abre http://localhost:3000  (modo ${SEGURO ? 'SEGURO' : 'VULNERABLE'})`)
);
