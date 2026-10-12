// Solo verifica que el usuario esté logueado, pero NO que el recurso sea suyo
app.get('/api/pedidos/:id', autenticado, async (req, res) => {
  const pedido = await db.pedidos.findById(req.params.id);
  res.json(pedido);
});


