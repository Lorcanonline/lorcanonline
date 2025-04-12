require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Movido arriba

const app = express();
const server = http.createServer(app);

// Configuración centralizada
const config = {
  allowedOrigins: [
    'https://lorcanonline.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  mongoOptions: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 50000
  }
};

// Middlewares esenciales
app.use(express.json());
app.use(handleCors(config.allowedOrigins));

// Conexión a MongoDB
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, config.mongoOptions);
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error MongoDB:', err.message);
    console.error('URI usada:', process.env.MONGODB_URI?.replace(/\/\/[^@]+@/, '//***:***@'));
    process.exit(1);
  }
};

// Routes (Mejor orden)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', userRoutes); // Si es necesario

// WebSocket
configureWebSocket(server, config.allowedOrigins);

// Manejo de errores global
app.use(globalErrorHandler);

// Health Check
app.get('/api/health', (req, res) => res.json({ 
  status: 'OK',
  timestamp: new Date().toISOString()
}));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
    console.log('🔵 Orígenes permitidos:', config.allowedOrigins);
  });
});

// Funciones auxiliares (Modularizar)
function handleCors(allowedOrigins) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  };
}

function configureWebSocket(server, allowedOrigins) {
  const io = socketio(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Cliente conectado: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });

    socket.on('join_game', (gameId) => {
      socket.join(gameId);
      io.to(gameId).emit('player_joined', socket.id);
    });
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}