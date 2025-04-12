import { useAuth } from '../context/AuthContext';
// import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="protected-route-message">
        <h2>Acceso restringido</h2>
        <p>Debes <a href="/login">iniciar sesión</a> o <a href="/register">registrarte</a> para ver esta página</p>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;