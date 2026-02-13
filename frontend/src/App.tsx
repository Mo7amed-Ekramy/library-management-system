import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import MyLoans from "./pages/MyLoans";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageLoans from "./pages/admin/ManageLoans";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isManager, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine the default redirect for authenticated users
  const getDefaultRoute = () => {
    if (isManager) return "/manager";
    return "/";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />} />

      {/* Protected routes */}
      <Route path="/" element={
        isManager ? <Navigate to="/manager" replace /> : <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/my-loans" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Manager routes */}
      <Route path="/manager" element={<ProtectedRoute managerOnly><ManagerDashboard /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/books" element={<ProtectedRoute adminOnly><ManageBooks /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<ProtectedRoute adminOnly><ManageLoans /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
