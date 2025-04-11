const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email o usuario ya registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      decks: []
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

//     res.status(201)
//       .cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict'
//       })
//       .json({ userId: newUser._id, username: newUser.username });
    
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error en el servidor' });
//   }
// });

res.status(201).json({
  userId: newUser._id,
  username: newUser.username,
  email: newUser.email,
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
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

// En ambas rutas (login y register), cambia la respuesta:
res
  // .cookie('token', token, { 
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict'
  // })
  .json({ 
    userId: user._id, 
    username: user.username,
    token // Para desarrollo
  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;