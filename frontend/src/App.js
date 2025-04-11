import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';

import './App.css';

// Configura Axios globalmente
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://lorcanonline.onrender.com';
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me', { // Crea este endpoint en tu backend
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(({ data }) => setUser(data))
      .catch(console.error);
    }
  }, []);
  
  // Función para manejar logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };
  // console.log('API URL:', process.env.REACT_APP_API_URL);

  return (
    <Router>
      <div className="App">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Home user={user} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? 
                <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
          path="/profile/:username"
          element={
          <ProfilePage />
          } />


        </Routes>
      </div>
    </Router>
  );
}

export default App;