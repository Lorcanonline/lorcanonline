const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

const authController = {
  async register(req, res) {
    try {
      const { username, password, avatar } = req.body;
      const email = req.body.email?.trim() || null;

      // Validación básica
      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Se requieren nombre de usuario y contraseña',
          errorType: 'validation'
        });
      }

      // Validar formato de email si se proporciona
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
          message: 'Formato de email inválido',
          errorType: 'validation'
        });
      }

      // Verificar existencia de usuario
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

      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email: email || undefined, // Forzar null en MongoDB
        password: hashedPassword,
        avatar: avatar || `pfp${Math.floor(Math.random() * 12) + 1}`
      });

      // Generar token
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
      // ✅ Usar req.user._id EXPLÍCITAMENTE
      const user = await User.findById(req.user._id) // ¡No usar req.user.id!
        .select('-password -__v -decks');
        
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error en getProfile:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  },
};

// Utilidades
const generateToken = (user) => jwt.sign(
  { id: user._id, username: user.username },
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

// Middleware authenticate
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    
    // ✅ Forzar la existencia de _id
    if (!user?._id) {
      throw new Error('Usuario no tiene _id');
    }
    
    req.user = {
      _id: user._id.toString(), // Convertir a string
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('Error en middleware:', error.message);
    res.status(500).json({ message: 'Error interno' });
  }
};
// Rutas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;