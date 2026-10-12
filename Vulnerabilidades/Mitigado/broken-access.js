app.get('/api/pedidos/:id', autenticado, async (req, res) => {
  const pedido = await db.pedidos.findById(req.params.id);

  if (!pedido) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  // Verificar que el recurso pertenezca al usuario (o que sea admin)
  if (pedido.userId !== req.user.id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  res.json(pedido);
});


