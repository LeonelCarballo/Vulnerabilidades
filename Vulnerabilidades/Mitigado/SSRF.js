const express = require('express');
const dns = require('dns').promises;
const { URL } = require('url');
const ipaddr = require('ipaddr.js');

const app = express();
const PORT = 5000;

async function isSafeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);

    // 1. Solo permite esquemas HTTP y HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname;
    if (!hostname) return false;

    // 2. Resuelve el nombre de dominio a una dirección IP
    const { address } = await dns.lookup(hostname);

    // 3. Verifica si la IP es privada, de loopback (127.x.x.x) o reservada
    const addr = ipaddr.parse(address);
    const range = addr.range(); // Retorna 'unicast', 'private', 'loopback', 'linkLocal', etc.

    if (range !== 'unicast') {
      return false; // Rechaza private, loopback, linkLocal, etc.
    }

    return true;
  } catch (e) {
    // Si falla la resolución DNS o el formato es inválido, bloqueamos por seguridad
    return false;
  }
}

// Ruta principal con menú HTML
app.get('/', (req, res) => {
  res.send(`
    <h2>SSRF Secure Demo (Protegido)</h2>
    <p>Prueba los siguientes enlaces:</p>
    <ul>
        <li><a href="/fetch?url=https://httpbin.org/get" target="_blank">https://httpbin.org/get</a> (Externo, permitido)</li>
        <li><a href="/fetch?url=http://127.0.0.1:5000" target="_blank">http://127.0.0.1:5000</a> (Interno, bloqueado)</li>
        <li><a href="/fetch?url=http://169.254.169.254/latest/meta-data/" target="_blank">Metadata de Cloud</a> (Reservada, bloqueado)</li>
    </ul>
  `);
});

app.get('/fetch', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Falta el parámetro ?url=" });
  }

  // VALIDACIÓN DE SEGURIDAD
  if (!(await isSafeUrl(url))) {
    return res.status(403).json({ error: "URL no permitida - acceso a recursos internos bloqueado" });
  }

  try {
    // redirect: 'error' evita que un servidor externo redirija a 127.0.0.1
    const resp = await fetch(url, { redirect: 'error' });
    const body = await resp.text();

    return res.json({
      status_code: resp.status,
      body: body.substring(0, 1000) // Limita el tamaño de la respuesta a 1000 caracteres
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor iniciado en http://127.0.0.1:${PORT}`);
});