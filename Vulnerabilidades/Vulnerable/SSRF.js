// El servidor hace una petición a cualquier URL que mande el usuario
app.get('/api/preview', async (req, res) => {
  const respuesta = await fetch(req.query.url);
  res.send(await respuesta.text());
});
// Ataque: /api/preview?url=http://169.254.169.254/latest/meta-data/
// (metadatos de la nube: credenciales IAM) o http://localhost:6379 (Redis interno)


