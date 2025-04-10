import React from 'react';

const Home = ({ user }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenido, {user.username}</h2>
      <p>Esta es la página principal. Aquí irá el menú del juego.</p>
    </div>
  );
};

export default Home;