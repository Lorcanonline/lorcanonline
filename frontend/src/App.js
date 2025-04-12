import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Configuración global de Axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://lorcanonline.onrender.com';
axios.defaults.withCredentials = true;

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Home />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Home />} 
      />
      {/* <Route 
        path="/profile/:username"
        element={<ProfilePage />} 
      /> */}
      <Route 
        path="/profile/:username" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>} 
      />

      
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;