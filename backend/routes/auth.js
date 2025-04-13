const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      return res.status(401).json({ message: 'Usuario no existe' });
    }

    req.user = {
      _id: user._id.toString(),
      username: user.username
    };

    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    res.status(401).json({ message: 'Token inválido' });
  }
};

const authController = {
  async register(req, res) {
    try {
      const { username, password, avatar } = req.body;
      const email = req.body.email?.trim() || null;

      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Se requieren nombre de usuario y contraseña',
          errorType: 'validation'
        });
      }

      if (email && !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
          message: 'Formato de email inválido',
          errorType: 'validation'
        });
      }

      const [existingUser, emailUser] = await Promise.all([
        User.findOne({ username }),
        email ? User.findOne({ email }) : null
      ]);

      if (existingUser) {
        return res.status(400).json({
          message: 'Nombre de usuario ya registrado',
          errorType: 'validation'
        });
      }

      if (emailUser) {
        return res.status(400).json({
          message: 'Email ya registrado',
          errorType: 'validation'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email: email || undefined,
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
        return res.status(400).json({
          message: 'Se requieren nombre de usuario y contraseña',
          errorType: 'validation'
        });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          message: 'Credenciales inválidas',
          errorType: 'auth'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: 'Credenciales inválidas',
          errorType: 'auth'
        });
      }

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
      const user = await User.findById(req.user._id)
        .select('-password -__v -decks');
        
      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
          errorType: 'validation'
        });
      }
      
      res.json(user);
    } catch (error) {
      handleAuthError(error, res);
    }
  }
};

const generateToken = (user) => jwt.sign(
  { 
    id: user._id.toString(), // Conversión crítica a string
    username: user.username 
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const handleAuthError = (error, res) => {
  console.error('Auth Error:', error);
  const statusCode = error.message.includes('Credenciales') ? 401 : 500;
  res.status(statusCode).json({
    message: error.message || 'Error interno del servidor',
    errorType: 'server'
  });
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getProfile); // Middleware aplicado

module.exports = router;