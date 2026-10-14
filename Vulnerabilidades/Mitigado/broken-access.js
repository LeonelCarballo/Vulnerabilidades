const express = require('express');
const app = express();

const pedidos = [
  { id: 1, userId: 1, producto: 'Laptop (de Ana)' },
  { id: 2, userId: 2, producto: 'Celular (de Luis)' },
  { id: 3, userId: 2, producto: 'Audifonos (de Luis)' },
];

const usuarios = {
  1: { id: 1, nombre: 'Ana', rol: 'user' },
  2: { id: 2, nombre: 'Luis', rol: 'user' },
  99: { id: 99, nombre: 'Admin', rol: 'admin' },
};

function autenticado(req, res, next) {
  const user = usuarios[req.header('x-user-id')];
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  req.user = user;
  next();
}

const soloAdmin = (req, res, next) =>
  req.user.rol === 'admin'
    ? next()
    : res.status(403).json({ error: 'Acceso denegado' });

// MITIGADO: valida que el pedido pertenezca al usuario (o que sea admin)
app.get('/api/pedidos/:id', autenticado, (req, res) => {
  const pedido = pedidos.find(p => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });

  if (pedido.userId !== req.user.id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  res.json(pedido);
});

// MITIGADO: solo admin puede borrar usuarios
app.delete('/api/usuarios/:id', autenticado, soloAdmin, (req, res) => {
  res.json({ mensaje: 'Usuario ' + req.params.id + ' borrado por ' + req.user.nombre });
});

// ---------- Página del formulario ----------
const html = `
<h2>Broken Access Control - MITIGADO</h2>

<p>
  Pedido 1 = de Ana | Pedido 2 y 3 = de Luis<br>
  Usuarios: 1 = Ana, 2 = Luis, 99 = Admin
</p>

<p>
  Iniciar sesión como:
  <select id="usuario">
    <option value="1">Ana (user)</option>
    <option value="2">Luis (user)</option>
    <option value="99">Admin</option>
  </select>
</p>

<h3>Ver pedido</h3>
<input id="pedidoId" type="number" placeholder="ID del pedido" value="2">
<button onclick="verPedido()">Ver pedido</button>

<h3>Borrar usuario</h3>
<input id="usuarioId" type="number" placeholder="ID del usuario" value="2">
<button onclick="borrarUsuario()">Borrar usuario</button>

<h3>Respuesta del servidor:</h3>
<pre id="resultado"></pre>

<script>
async function llamar(url, metodo) {
  const user = document.getElementById('usuario').value;
  const r = await fetch(url, { method: metodo, headers: { 'x-user-id': user } });
  const data = await r.json();
  document.getElementById('resultado').textContent =
    'Estado HTTP: ' + r.status + '\\n' + JSON.stringify(data, null, 2);
}
function verPedido() {
  llamar('/api/pedidos/' + document.getElementById('pedidoId').value, 'GET');
}
function borrarUsuario() {
  llamar('/api/usuarios/' + document.getElementById('usuarioId').value, 'DELETE');
}
</script>
`;

app.get('/', (req, res) => res.send(html));

app.listen(3000, () => console.log('Mitigado en http://localhost:3000'));