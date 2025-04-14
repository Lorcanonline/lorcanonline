import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate  } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, login, logout  } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPasswordMenu, setShowPasswordMenu] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');  

  // Avatar config
  const avatarOptions = Array.from({ length: 12 }, (_, i) => `pfp${i + 1}`);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/users/${username}`);
        setProfileUser(data);
        setSelectedAvatar(data.avatar);
        setEmail(data.email || '');
      } catch (err) {
        setError(err.response?.status === 404 
          ? 'Este usuario no existe' 
          : 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [username]);

  const isCurrentUser = currentUser && 
  currentUser.username.toLowerCase() === username.toLowerCase();

  const handleAccountDeletion = async () => {
    try {
      await axios.delete(`/api/users/${username}/delete`, {
        data: { password: deletePassword },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error al eliminar la cuenta');
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {};
      
      const trimmedEmail = email.trim();

      if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
        setUpdateError('Formato de email inválido');
        setUpdateSuccess('');
        return;
      }
      if (trimmedEmail !== (profileUser.email || '')) {
        updateData.email = trimmedEmail || null;
      }

      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      if (email !== profileUser.email) {
        updateData.email = email;
      }

      const { data } = await axios.put(
        `/api/users/${currentUser.username}/update`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      ).catch(error => {
        console.error('Error detallado:', error.response);
        throw error;
      });

      if (data.email) {
        login({ ...currentUser, email: data.email }, localStorage.getItem('token'));
      }

      setProfileUser(prev => ({ ...prev, email: data.email }));
      setUpdateSuccess('Datos actualizados correctamente');
      setUpdateError('');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setUpdateSuccess(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar los datos';
      setUpdateError(errorMessage);
      setUpdateSuccess('');
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

      <div className="profile-content">
                
        {isCurrentUser && (
          <div className="profile-settings">
            <h3>Configuración de la cuenta</h3>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={profileUser.email ? "Actualiza tu email" : "Añade un email (opcional)"}
                className="email-input"
              />
            </div>

            <button 
              onClick={() => setShowPasswordMenu(!showPasswordMenu)}
              className="toggle-password-btn"
            >
              {showPasswordMenu ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
            </button>

            {showPasswordMenu && (
              <div className="password-form">
                <div className="form-group">
                  <label>Contraseña actual:</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="•••••"
                      className="password-input"
                    />
                    <span
                  className="password-toggle-icon"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  )}
                </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nueva contraseña:</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="•••••"
                      className="password-input"
                    /><span
                    className="password-toggle-icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </span>
                  </div>
                </div>
              </div>
            )}

            {(updateError || updateSuccess) && (
              <div className={`update-message ${updateError ? 'error' : 'success'}`}>
                {updateError || updateSuccess}
              </div>
            )}

            <button
              onClick={handleUpdateProfile}
              disabled={
                (email === (profileUser?.email || '')) && 
                !newPassword
              }              className="update-profile-btn"
            >
              Confirmar cambios
            </button>
          </div>
        )}

{isCurrentUser && (
          <div className="danger-zone">
            <h3>Zona peligrosa</h3>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="delete-account-btn"
            >
              Eliminar cuenta permanentemente
            </button>

            {showDeleteModal && (
              <div className="confirmation-modal">
                <div className="modal-content">
                  <h4>¡Atención! Esta acción es irreversible</h4>
                  <p>Para confirmar, escribe tu contraseña actual:</p>
                  
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Contraseña actual"
                  />
                  
                  {deleteError && <div className="error-message">{deleteError}</div>}
                  
                  <div className="modal-actions">
                    <button 
                      onClick={handleAccountDeletion}
                      disabled={!deletePassword}
                    >
                      Confirmar eliminación
                    </button>
                    <button onClick={() => setShowDeleteModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

  );
};

export default ProfilePage;