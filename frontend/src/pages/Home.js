import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {user ? (
        <>
          <h2>Bienvenido, {user.username}!</h2>
          <p>Esta es la página principal. Aquí irá el menú del juego.</p>
        </>
      ) : (
        <>
          <h2>Bienvenido a Lorcana Online</h2>
          <p>Para acceder a todas las funciones, por favor 
            <Link to="/login"> inicia sesión</Link> o 
            <Link to="/register"> regístrate</Link>.
          </p>
        </>
      )}
    </div>
  );
};

export default Home;