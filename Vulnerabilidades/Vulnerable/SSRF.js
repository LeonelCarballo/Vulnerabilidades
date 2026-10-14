const express = require('express');
const app = express();
const PORT = 5000;

// 1. Endpoint PRIVADO (Simula datos sensibles a los que solo la red interna debería acceder)
app.get('/secreto', (req, res) => {
  res.send(' [DATOS CONFIDENCIALES] Clave secreta del servidor: ADMIN_SECRET_12345');
});

// 2. Menú principal
app.get('/', (req, res) => {
  res.send(`
    <h2>SSRF Vulnerable Demo</h2>
    <p>Selecciona una opción para probar:</p>
    <ul>
        <li><a href="/fetch?url=https://httpbin.org/get">1. Petición Legítima (Servidor externo)</a></li>
        <li><a href="/fetch?url=http://127.0.0.1:5000/secreto">2. Ataque SSRF (Robar datos del endpoint /secreto)</a></li>
    </ul>
  `);
});

// 3. Endpoint VULNERABLE
app.get('/fetch', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Falta el parámetro ?url=" });
  }

  try {
    const resp = await fetch(url);
    const body = await resp.text();

    return res.json({
      status_code: resp.status,
      body: body
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor vulnerable corriendo en http://127.0.0.1:${PORT}`);
});