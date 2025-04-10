const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB (usaremos Atlas)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error(err));

// Configuración básica de Express
app.use(express.json());

// Rutas de ejemplo (las expandiremos)
app.get('/', (req, res) => {
  res.send('Backend de Lorcana funcionando!');
});

const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

// Configuración de WebSocket (lo usaremos más tarde)
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
});