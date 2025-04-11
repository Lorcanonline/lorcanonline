import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsAuthenticated, setUser }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(`pfp${Math.floor(Math.random() * 12) + 1}`);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const navigate = useNavigate();

  // Generar las 12 opciones de avatar
  const avatarOptions = Array.from({ length: 12 }, (_, i) => `pfp${i + 1}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/auth/register`, {
        username,
        email,
        password,
        avatar: avatar
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('avatar', data.avatar);
      setUser({
        username: data.username,
        avatar: data.avatar
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  // Estilos para los avatares
  const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    margin: '5px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const selectedAvatarStyle = {
    ...avatarStyle,
    border: '2px solid #4CAF50',
    transform: 'scale(1.05)'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nombre de usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        {/* Selector de Avatar */}
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <label>Avatar:</label>
          <div 
            style={{ cursor: 'pointer', display: 'inline-block', margin: '10px 0' }}
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          >
            <img 
              src={`/avatars/${avatar}.jpg`} 
              alt="Avatar seleccionado"
              style={avatarStyle}
            />
            <p style={{ fontSize: '0.8rem', margin: '5px 0' }}>
              {showAvatarPicker ? 'Ocultar opciones' : 'Cambiar avatar'}
            </p>
          </div>
          
          {showAvatarPicker && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginTop: '10px'
            }}>
              {avatarOptions.map((option) => (
                <img
                  key={option}
                  src={`/avatars/${option}.jpg`}
                  alt={`Avatar ${option}`}
                  style={option === avatar ? selectedAvatarStyle : avatarStyle}
                  onClick={() => {
                    setAvatar(option);
                    setShowAvatarPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Registrarse
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        ¿Ya tienes cuenta? <a href="/login" style={{ color: '#4CAF50' }}>Inicia sesión aquí</a>
      </p>
    </div>
  );
};

export default Register;