import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GirlProfile from './pages/GirlProfile';
import GirlActivity from './pages/GirlActivity';

function getStoredToken() {
  return localStorage.getItem('token');
}

function ProtectedRoute({ children }) {
  const token = getStoredToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/girl/:id"
        element={
          <ProtectedRoute>
            <GirlProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/girl/:id/activity/:category"
        element={
          <ProtectedRoute>
            <GirlActivity />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
