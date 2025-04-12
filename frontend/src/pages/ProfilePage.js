import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, 
  // useNavigate
 } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, login } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  // const navigate = useNavigate();

  // Avatar config
  const avatarOptions = Array.from({ length: 12 }, (_, i) => `pfp${i + 1}`);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/users/${username}`);
        setProfileUser(data);
        setSelectedAvatar(data.avatar);
      } catch (err) {
        setError(err.response?.status === 404 
          ? 'Este usuario no existe' 
          : 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [username, currentUser.username]);

  const handleAvatarUpdate = async () => {
    try {
      const { data } = await axios.patch(`/api/users/${currentUser.username}/avatar`, {
        avatar: selectedAvatar
      });
      
      // Actualizar contexto y perfil
      login({ ...currentUser, avatar: data.avatar }, localStorage.getItem('token'));
      setProfileUser({ ...profileUser, avatar: data.avatar });
      setShowAvatarPicker(false);
    } catch (err) {
      setError('Error actualizando avatar');
    }
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-container">
      <div className="avatar-section">
        <img
          src={`/avatars/${profileUser.avatar}.jpg`}
          alt={`Avatar de ${profileUser.username}`}
          style={avatarStyle(true)}
          onClick={() => currentUser.username === username && setShowAvatarPicker(!showAvatarPicker)}
        />
        
        {currentUser.username === username && (
          <>
            <p className="avatar-edit-hint">Haz clic en tu avatar para cambiarlo</p>
            
            {showAvatarPicker && (
              <div className="avatar-editor">
                <div className="avatar-grid">
                  {avatarOptions.map((option) => (
                    <img
                      key={option}
                      src={`/avatars/${option}.jpg`}
                      alt={`Avatar ${option}`}
                      style={avatarStyle(option === selectedAvatar)}
                      onClick={() => setSelectedAvatar(option)}
                    />
                  ))}
                </div>
                <button 
                  onClick={handleAvatarUpdate}
                  className="save-button"
                >
                  Guardar cambios
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <h2>Perfil de {profileUser.username}</h2>
      {/* Resto de información del perfil */}
    </div>
  );
};

export default ProfilePage;