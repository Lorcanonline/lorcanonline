// routes/users.js
router.get('/:username', async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username })
                            .select('-password'); // Excluye la contraseña
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Error del servidor' });
    }
  });