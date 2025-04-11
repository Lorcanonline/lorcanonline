const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ahora puedes usar router.get, router.post, etc.
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;