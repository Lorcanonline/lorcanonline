import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  useEffect(() => {
    const socket = io('https://tu-backend-en-render.onrender.com');
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });
  }, []);

  return <h1>Lorcana Web App</h1>;
}
export default App;
