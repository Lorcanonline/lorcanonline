require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Configuración mejorada de CORS
const corsOptions = {
  origin: [
    'https://lorcanonline.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares (actualizados)
app.use(cors(corsOptions));  // Usa la configuración personalizada
app.options('*', cors());    // Manejo explícito de preflight requests
app.use(express.json());

// Configuración de WebSocket (actualizada)
const io = socketio(server, {
  cors: {
    origin: corsOptions.origin,  // Usa las mismas opciones de CORS
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Conexión a MongoDB (sin cambios)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de MongoDB:', err));

// Rutas (sin cambios)
app.use('/api/auth', authRoutes);

// Middleware para log de headers (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('Headers recibidos:', req.headers);
    next();
  });
}

// WebSocket (sin cambios)
io.on('connection', (socket) => {
  console.log(`⚡ Nuevo cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Manejo de errores global (sin cambios)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🔵 CORS configurado para: ${corsOptions.origin.join(', ')}`);
});