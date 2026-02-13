import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, FileText, Clock, TrendingUp, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { User, Book, Loan, Reservation } from '@/lib/types';
import { authApi } from '@/services/authApi';
import { bookApi } from '@/services/bookApi';
import { loansApi } from '@/services/loansApi';
import { useToast } from '@/hooks/use-toast';

export default function ManagerDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]); // Placeholder for now if no API
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, usersData, loansData] = await Promise.all([
          bookApi.getAllBooks(),
          authApi.getAllUsers(),
          loansApi.getAllLoans()
        ]);

        setBooks(booksData);
        setUsers(usersData.filter(u => u.role === 'user'));
        setLoans(loansData);
        // setReservations(reservationsData); // TODO: Add reservation API
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Statistics
  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.copiesAvailable, 0);
  const activeLoans = loans.filter(l => l.status === 'Borrowed' || l.status === 'Overdue');
  const overdueLoans = loans.filter(l => l.status === 'Overdue');
  const totalUsers = users.length;
  const pendingReservations = reservations.filter(r => r.status === 'Waiting').length;
  const totalFines = users.reduce((sum, u) => sum + u.fines, 0);
  const totalRevenue = loans.reduce((sum, l) => sum + l.borrowingCost, 0);

  // Category breakdown
  const categoryStats = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent loans (last 10)
  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 10);

  // Most borrowed books
  const bookBorrowCounts = loans.reduce((acc, loan) => {
    acc[loan.bookId] = (acc[loan.bookId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularBooks = Object.entries(bookBorrowCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([bookId, count]) => ({
      book: books.find(b => b.id === parseInt(bookId) || b.id === bookId), // Handle potential string/number mismatch
      count,
    }));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Reports</h1>
          <p className="text-muted-foreground">Library statistics and reports overview</p>
        </div>

        {/* Key Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                {availableCopies} of {totalCopies} copies available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-muted-foreground">
                {overdueLoans.length} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {pendingReservations} pending reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ${totalFines.toFixed(2)} in outstanding fines
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Books by Category
              </CardTitle>
              <CardDescription>Distribution of books across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-primary rounded" style={{ width: `${(count / totalBooks) * 100}px` }} />
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Books */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Most Popular Books
              </CardTitle>
              <CardDescription>Top 5 most borrowed books</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularBooks.length > 0 ? (
                  popularBooks.map(({ book, count }, index) => (
                    <div key={book?.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm">{book?.title || 'Unknown'}</span>
                      </div>
                      <Badge>{count} loans</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No loan data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Loans Alert */}
        {overdueLoans.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Overdue Loans ({overdueLoans.length})
              </CardTitle>
              <CardDescription>Books that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.slice(0, 5).map(loan => {
                    const book = books.find(b => b.id === loan.bookId || b.id === parseInt(String(loan.bookId)));
                    const user = users.find(u => u.id === loan.userId || u.id === parseInt(String(loan.userId)));
                    const daysOverdue = Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{book?.title || 'Unknown'}</TableCell>
                        <TableCell>{user?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{daysOverdue} days</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Loan Activity
            </CardTitle>
            <CardDescription>Latest borrowing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.length > 0 ? (
                  recentLoans.map(loan => {
                    const book = books.find(b => b.id === loan.bookId || b.id === parseInt(String(loan.bookId)));
                    const user = users.find(u => u.id === loan.userId || u.id === parseInt(String(loan.userId)));
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{book?.title || 'Unknown'}</TableCell>
                        <TableCell>{user?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(loan.borrowDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            loan.status === 'Returned' ? 'secondary' :
                              loan.status === 'Overdue' ? 'destructive' : 'default'
                          }>
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${loan.borrowingCost.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No loan activity yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Overview
            </CardTitle>
            <CardDescription>Registered library members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Active Loans</TableHead>
                  <TableHead>Outstanding Fines</TableHead>
                  <TableHead>Member Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const userActiveLoans = loans.filter(l => l.userId === user.id && l.status !== 'Returned').length;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{userActiveLoans}</TableCell>
                      <TableCell>
                        {user.fines > 0 ? (
                          <Badge variant="destructive">${user.fines.toFixed(2)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
