const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Controladores separados
const authController = {
  async register(req, res) {
    try {
      const { username, password, avatar, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
      }

      const [existingUser, emailUser] = await Promise.all([
        User.findOne({ username }),
        email ? User.findOne({ email }) : null
      ]);

      if (existingUser) throw new Error('Nombre de usuario ya registrado');
      if (emailUser) throw new Error('Email ya registrado');

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        avatar: avatar || `pfp${Math.floor(Math.random() * 12) + 1}`
      });

      const token = generateToken(newUser);
      
      res.status(201).json({
        userId: newUser._id,
        username: newUser.username,
        avatar: newUser.avatar,
        token
      });
      
    } catch (error) {
      handleAuthError(error, res);
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Credenciales requeridas' });
      }

      const user = await User.findOne({ username });
      if (!user) throw new Error('Credenciales inválidas');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Credenciales inválidas');

      const token = generateToken(user);
      
      res.json({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        token
      });

    } catch (error) {
      handleAuthError(error, res);
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select('-password -__v');
        
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      
      res.json(user);
    } catch (error) {
      handleAuthError(error, res);
    }
  }
};

// Middlewares y utilidades
function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function handleAuthError(error, res) {
  const statusCode = error.message.includes('Credenciales') ? 401 : 400;
  res.status(statusCode).json({ 
    message: error.message,
    errorType: error.message.includes('Credenciales') ? 'auth' : 'validation'
  });
}

// Rutas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getProfile);

module.exports = router;