import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Render a loading spinner or a blank page while the session is being checked
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div>Loading...</div>
        </div>
    );
  }

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role,
    // redirect to a "not authorized" page or the home page.
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role (if any), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
