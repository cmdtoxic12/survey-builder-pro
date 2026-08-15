import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import EditSurvey from './pages/EditSurvey';
import SurveyAnalytics from './pages/SurveyAnalytics';
import TakeSurvey from './pages/TakeSurvey';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '3rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/s/:shareId" element={<TakeSurvey />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys/create"
          element={
            <PrivateRoute>
              <CreateSurvey />
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys/:id/edit"
          element={
            <PrivateRoute>
              <EditSurvey />
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys/:id/analytics"
          element={
            <PrivateRoute>
              <SurveyAnalytics />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
