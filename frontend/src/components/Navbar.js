import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  const navStyles = {
    container: {
      padding: '1rem', 
      background: '#2c3e50', 
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    content: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    link: (color, hoverColor) => ({
      color: 'white', 
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      background: color,
      transition: 'background 0.3s',
      '&:hover': { background: hoverColor }
    }),
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      marginLeft: '10px',
      objectFit: 'cover'
    }
  };

  return (
    <nav style={navStyles.container}>
      <div style={navStyles.content}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          LorcanaOnline
        </Link>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to={`/u/${user.username}`}>
              <img
                src={`/avatars/${user.avatar}.jpg`} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/avatars/default-avatar.jpg';
                }}
                alt="Avatar"
                style={navStyles.avatar}
              />
            </Link>
            <button 
              onClick={logout}
              style={navStyles.link('#e74c3c', '#c0392b')}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={navStyles.link('#3498db', '#2980b9')}>
              Iniciar sesión
            </Link>
            <Link to="/register" style={navStyles.link('#2ecc71', '#27ae60')}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;