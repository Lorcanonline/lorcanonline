const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    const email = req.body.email || null;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ message: 'Necesitas por lo menos usuario y contraseña!' });
    }

  // Verificar si el usuario ya existe (solo por username)
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Nombre de usuario ya registrado' });
  }

  // Si se proporcionó email, verificar que no exista
  if (email) {
    const emailUser = await User.findOne({ email });
    if (emailUser) {
      return res.status(400).json({ message: 'Email ya registrado' });
   }
 }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      decks: [],
      avatar: avatar || `pfp${Math.floor(Math.random() * 12) + 1}`
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.userId, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

res.status(201).json({
  userId: newUser._id,
  username: newUser.username,
  email: newUser.email,
  avatar: newUser.avatar,
  token: token
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.userId, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


res
  // .cookie('token', token, { 
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict'
  // })
  .json({ 
    userId: user._id, 
    username: user.username,
    avatar: user.avatar,
    token // Para desarrollo
  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;