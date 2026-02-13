import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, Bell, Settings, BarChart3 } from 'lucide-react';
import { getUserNotifications } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadNotifications = user
    ? getUserNotifications(user.id).filter(n => !n.read).length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <BookOpen className="h-6 w-6" />
              Library System
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                {!isAdmin && !isManager && (
                  <>
                    <Link to="/search" className="text-foreground hover:text-primary transition-colors">
                      Search Books
                    </Link>
                    <Link to="/my-loans" className="text-foreground hover:text-primary transition-colors">
                      My Loans
                    </Link>
                  </>
                )}
                {isManager && (
                  <Link to="/manager" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Manager
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link to="/notifications" className="relative text-foreground hover:text-primary transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>
                <Link to="/profile" className="text-foreground hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Library Management System
        </div>
      </footer>
    </div>
  );
}
