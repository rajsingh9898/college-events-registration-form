import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page with Enter Button */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? <Navigate to="/dashboard" /> : <Landing />
            } 
          />
          {/* Auth Page (Login/Register) */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated() ? <Navigate to="/dashboard" /> : <Auth />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={<AdminDashboard />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;