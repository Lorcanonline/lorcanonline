const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;