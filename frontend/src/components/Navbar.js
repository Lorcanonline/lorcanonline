import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  return (
    <nav style={{ 
      padding: '1rem', 
      background: '#2c3e50', 
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          LorcanaOnline
        </Link>
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ marginRight: '1rem' }}>

              <Link to={`/profile/${user.username}`} style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={`/avatars/${user.avatar}.jpg`}
                  alt={`Avatar de ${user.username}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginLeft: '10px',
                    objectFit: 'cover'
                  }}
                />
              </Link>

            </span>
            <button 
              onClick={onLogout}
              style={{ 
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#c0392b'}
              onMouseOut={(e) => e.target.style.background = '#e74c3c'}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: '#3498db',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2980b9'}
              onMouseOut={(e) => e.target.style.background = '#3498db'}
            >
              Iniciar sesión
            </Link>
            <Link 
              to="/register" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: '#2ecc71',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#27ae60'}
              onMouseOut={(e) => e.target.style.background = '#2ecc71'}
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;