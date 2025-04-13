import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar || 'default-avatar'
    });
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('/api/auth/me', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-Cache-Bust': Date.now()
          }
        });

        if (!data?._id || !data?.username) {
          throw new Error('Datos de usuario inválidos');
        }

        setUser({
          id: data._id,
          username: data.username,
          avatar: data.avatar || 'default-avatar'
        });

      } catch (error) {
        console.error('Error al cargar usuario:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user,
      loading,
      login,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};