import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  return (
    <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>Lorcana</h1>
        </Link>
        
        {isAuthenticated ? (
          <div>
            <span style={{ marginRight: '1rem' }}>Hola, {user.username}</span>
            <button onClick={onLogout}>Cerrar sesión</button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ color: 'white', marginRight: '1rem' }}>
              Iniciar sesión
            </Link>
            <Link to="/register" style={{ color: 'white' }}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;