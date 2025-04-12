import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: `pfp${Math.floor(Math.random() * 12) + 1}`
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const avatarOptions = Array.from({ length: 12 }, (_, i) => `pfp${i + 1}`);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar nombre de usuario
    if (!/^[a-zA-Z0-9_]{1,20}$/.test(formData.username)) {
      return setError('El usuario debe tener entre 3-20 caracteres (solo letras, números y _)');
    }

      // Validación adicional
    if (formData.password.length < 1) {
      return setError('La contraseña debe tener al menos 1 caracter');
    }

    try {
      const { data } = await axios.post('/api/auth/register', formData);
      login(data, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };
  const handleChange = (e) => {
    const value = e.target.name === 'email' 
      ? e.target.value.trim() || null 
      : e.target.value;
  
    setFormData({ 
      ...formData, 
      [e.target.name]: value 
    });
  };

  const avatarStyle = (selected) => ({
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    margin: '5px',
    border: selected ? '2px solid #4CAF50' : '2px solid transparent',
    transform: selected ? 'scale(1.05)' : 'none',
    transition: 'all 0.3s ease'
  });

  return (
    <div className="auth-container">
      <h2>Registro</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email (opcional):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="avatar-section">
          <label>Selecciona tu avatar:</label>
          <div className="avatar-preview" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <img
              src={`/avatars/${formData.avatar}.jpg`}
              alt="Avatar seleccionado"
              style={avatarStyle(true)}
            />
            <p className="toggle-picker">
              {showAvatarPicker ? 'Ocultar opciones' : 'Cambiar avatar'}
            </p>
          </div>

          {showAvatarPicker && (
            <div className="avatar-grid">
              {avatarOptions.map((option) => (
                <img
                  key={option}
                  src={`/avatars/${option}.jpg`}
                  alt={`Avatar ${option}`}
                  style={avatarStyle(option === formData.avatar)}
                  onClick={() => setFormData({ ...formData, avatar: option })}
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Registrarse
        </button>
      </form>

      <p className="auth-link">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
      </p>
    </div>
  );
};

export default Register;