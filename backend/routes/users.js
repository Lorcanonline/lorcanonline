const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

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

// Actualizar avatar
router.patch('/:username/avatar', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { avatar: req.body.avatar },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando avatar' });
  }
});

router.put('/:username/update', authMiddleware, async (req, res) => {
  try {
    console.log('Iniciando actualización para:', req.params.username);
    console.log('Datos recibidos:', req.body);
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', user._id);
    console.log('Usuario autenticado:', req.user.id);
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const updates = {};
    const { currentPassword, newPassword } = req.body;
    let newEmail = req.body.email?.trim() || null;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'La contraseña actual es requerida' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }
    if (typeof req.body.email !== 'undefined') {
      if (newEmail === '') newEmail = null;
      
      if (newEmail && newEmail !== user.email) {
        if (!/\S+@\S+\.\S+/.test(newEmail)) {
          return res.status(400).json({ message: 'Formato de email inválido' });
        }
      const existingEmail = await User.findOne({ email:newEmail });
      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya está registrado' });
        }
      }
      updates.email = newEmail;
      console.log('Email actualizado a:', updates.email);
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updates,
        { new: true }
      ).select('-password -__v');

      return res.json(updatedUser);
    }

    return res.json(user);
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error actualizando el perfil' });
  }
});


module.exports = router;