
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import ProfilePage from './pages/ProfilePage';
import IDEWorkspace from './components/ide/IDEWorkspace';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a spinner
  if (!user.isLoggedIn) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/ide/:projectId" element={
              <ProtectedRoute>
                <IDEWorkspace />
              </ProtectedRoute>
            } />
            <Route path="/roadmap/:id" element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
