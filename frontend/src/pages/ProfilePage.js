import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/users/${username}`);
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar el perfil - este usuario no existe');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [username]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <h1>Perfil de {user.username}</h1>
      <img 
        src={`/avatars/${user.avatar}.jpg`}
        alt={`Avatar de ${user.username}`}
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          objectFit: 'cover',
          margin: '1rem auto'
        }}
      />
      {/* Más información del usuario si es necesario */}
    </div>
  );
};

export default ProfilePage;