const { URL } = require('url');
const dns = require('dns').promises;
const ipaddr = require('ipaddr.js');

const DOMINIOS_PERMITIDOS = ['api.ejemplo.com', 'cdn.ejemplo.com'];

async function esUrlSegura(urlStr) {
  let url;
  try { url = new URL(urlStr); } catch { return false; }

  if (url.protocol !== 'https:') return false;                 // solo HTTPS
  if (!DOMINIOS_PERMITIDOS.includes(url.hostname)) return false; // lista blanca

  // Resolver DNS y bloquear IPs internas/privadas
  const { address } = await dns.lookup(url.hostname);
  const rango = ipaddr.parse(address).range();
  return rango === 'unicast'; // rechaza private, loopback, linkLocal, etc.
}

app.get('/api/preview', async (req, res) => {
  if (!(await esUrlSegura(req.query.url))) {
    return res.status(400).json({ error: 'URL no permitida' });
  }
  const respuesta = await fetch(req.query.url, { redirect: 'error' }); // sin redirecciones
  res.send(await respuesta.text());
});


