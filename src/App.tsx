import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import KanbanBoard from './components/KanbanBoard';
import Projects from './components/Projects';   
import CustomProject from './components/CustomProject'; 

const NavBar: React.FC = () => {
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from localStorage on logout
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          Kanban App
        </Link>
        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              <Link to="/" className="text-white">
                Home
              </Link>
              <Link to="/projects" className="text-white">
                Projects
              </Link>
              <button className="text-white" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-white">
                Register
              </Link>
              <Link to="/login" className="text-white">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<CustomProject />} /> {/* Dynamic route */}
        <Route path="/" element={<KanbanBoard />} />
      </Routes>
    </Router>
  );
};

export default App;
