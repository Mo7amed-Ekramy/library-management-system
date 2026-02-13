import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getBooks, getLoans, getUsers, getReservations } from '@/lib/storage';
import { BookOpen, Users, BookCopy, Clock, Settings, UserCog, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const books = getBooks();
  const loans = getLoans();
  const users = getUsers();
  const reservations = getReservations();

  const activeLoans = loans.filter(l => l.status !== 'Returned');
  const overdueLoans = loans.filter(l => {
    const dueDate = new Date(l.dueDate);
    return dueDate < new Date() && l.status !== 'Returned';
  });
  const waitingReservations = reservations.filter(r => r.status === 'Waiting');
  const totalFines = users.reduce((sum, u) => sum + u.fines, 0);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your library system</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.length}</div>
              <p className="text-xs text-muted-foreground">
                {books.reduce((sum, b) => sum + b.copiesAvailable, 0)} copies available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-destructive">
                {overdueLoans.length} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.role === 'admin').length} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitingReservations.length}</div>
              <p className="text-xs text-muted-foreground">waiting for books</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Fines */}
        {totalFines > 0 && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total Outstanding Fines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalFines.toFixed(2)}</div>
              <p className="text-muted-foreground mt-2">
                From {users.filter(u => u.fines > 0).length} users with unpaid fines
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manage Books
              </CardTitle>
              <CardDescription>Add, edit, or remove books from the library</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/books">
                <Button className="w-full">Manage Books</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Manage Users
              </CardTitle>
              <CardDescription>View and manage library members</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookCopy className="h-5 w-5" />
                Manage Loans
              </CardTitle>
              <CardDescription>View all loans and process returns</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/loans">
                <Button variant="outline" className="w-full">Manage Loans</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
