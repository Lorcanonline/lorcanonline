import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const { data } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        // ✅ Validar estructura crítica
        if (!data?._id) {
          throw new Error('Falta _id en respuesta');
        }
  
        setUser(data);
      } catch (error) {
        console.error('Error al cargar usuario:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };
  
    loadUser();
  }, []);

  // Función de login
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({
      ...userData,
      avatar: userData.avatar || 'default-avatar' // Aseguramos avatar
    });
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};