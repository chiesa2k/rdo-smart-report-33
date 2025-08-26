import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can render a loading spinner here while the session is being checked
    return <div>Loading...</div>;
  }

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role,
    // redirect to a "not authorized" page or the home page.
    // For simplicity, we'll redirect to the home page.
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role (if any), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
