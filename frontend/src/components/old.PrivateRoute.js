import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PrivateRoute({ children }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}