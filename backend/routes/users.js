const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    .collation({ locale: 'en', strength: 2 });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE user con verificación de contraseña
router.delete('/:username/delete', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .collation({ locale: 'en', strength: 2 });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Se requiere la contraseña' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: 'Cuenta eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({ message: 'Error eliminando cuenta' });
  }
});

// Actualizar avatar
router.patch('/:username/avatar', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { avatar: req.body.avatar },
      { 
        new: true,
        collation: { locale: 'en', strength: 2 }  
      }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando avatar' });
  }
});

router.put('/:username/update', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    .collation({ locale: 'en', strength: 2 }); 

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

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