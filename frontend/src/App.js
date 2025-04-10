import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Crea un componente Home básico (o impórtalo si lo tienes en otro archivo)
function Home() {
  return (
    <div className="App">
      <h1>Lorcana Web App</h1>
      {/* Contenido inicial aquí */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;