const helmet = require('helmet');
const escapeHtml = require('escape-html');

// 1. Política de Seguridad de Contenido (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],        // bloquea scripts inline y de terceros
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"]
  }
}));

// 2. Escapar la salida
app.get('/buscar', (req, res) => {
  const q = escapeHtml(req.query.q || '');
  res.send(`<h1>Resultados para: ${q}</h1>`);
});

// 3. Cookies de sesión protegidas
app.use(session({
  cookie: { httpOnly: true, secure: true, sameSite: 'strict' }
}));


