require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Configuración de CORS manual - Solución definitiva
const allowedOrigins = [
  'https://lorcanonline.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Manejo preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares esenciales
app.use(express.json());

// Conexión a MongoDB
mongoose.set('strictQuery', false); // Para eliminar el warning de deprecación

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 50000
    });
    console.log('✅ MongoDB conectado exitosamente');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.error('URI usada:', process.env.MONGODB_URI?.replace(/\/\/[^@]+@/, '//***:***@'));
    process.exit(1);
  }
};

connectDB();

// Rutas
app.use('/api/auth', authRoutes);

// Configuración de WebSocket
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware para log de headers (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('Headers recibidos:', req.headers);
    next();
  });
}

// WebSocket Connection
io.on('connection', (socket) => {
  console.log(`⚡ Nuevo cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

io.on('connection', (socket) => {
  socket.on('join_game', (gameId) => {
    socket.join(gameId);
    io.to(gameId).emit('player_joined', socket.id);
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Algo salió mal en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log('🔵 Orígenes permitidos:', allowedOrigins);
});

const profileRoutes = require('./routes/users');
app.use('/api/profile', profileRoutes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);