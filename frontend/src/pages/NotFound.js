import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = ({ type = 'user' }) => (
  <div className="not-found-container">
    <h2>{type === 'user' ? 'Usuario no encontrado' : 'Página no existe'}</h2>
    <p>
      {type === 'user' 
        ? 'El usuario que buscas no existe o ha sido eliminado'
        : 'La página que intentas acceder no existe'}
    </p>
    <Link to="/" className="home-link">Volver al inicio</Link>
  </div>
);

export default NotFound;