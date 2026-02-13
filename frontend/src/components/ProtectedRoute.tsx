import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false, managerOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isManager } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
