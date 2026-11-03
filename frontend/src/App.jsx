import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CarbonProvider } from './context/CarbonContext.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Calculator from './pages/Calculator.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Goals from './pages/Goals.jsx';
import Chat from './pages/Chat.jsx';
import Achievements from './pages/Achievements.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

// Protected route checker
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('carbon_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <CarbonProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="calculator" element={<Calculator />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="goals" element={<Goals />} />
              <Route path="chat" element={<Chat />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CarbonProvider>
    </AuthProvider>
  );
}
