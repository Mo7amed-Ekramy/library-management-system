import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, AlertCircle, DollarSign, Search } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { useToast } from '@/hooks/use-toast';
import { PaymentDialog } from '@/components/PaymentDialog';
import { Book, Loan, Reservation } from '@/lib/types';
import { loansApi } from '@/services/loansApi';
import ManagerDashboard from './manager/ManagerDashboard';


export default function Dashboard() {
  const { user, refreshUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { payFine, borrowBook, reserveBook, canUserBorrow, getAllBooks } = useLibrary();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Redirect admin to admin dashboard by default
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      if (user) {
        const books = await getAllBooks();
        setAllBooks(books);

        const myLoans = await loansApi.getMyLoans();
        setActiveLoans(myLoans.filter((l: Loan) => l.status === 'Borrowed'));
        setReservations(myLoans.filter((l: Loan) => l.status === 'Reserved'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, getAllBooks]);

  if (!user) return null;
  if (isAdmin) return null;

  const getBookById = (id: string | number) => allBooks.find(b => String(b.id) === String(id));

  /* Logic for Alerts & Recommendations */
  const now = new Date();

  const overdueLoans = activeLoans.filter(loan => {
    const dueDate = new Date(loan.dueDate);
    return dueDate < now;
  });

  const dueSoonLoans = activeLoans.filter(loan => {
    const dueDate = new Date(loan.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Due within 3 days but not yet overdue
    return diffDays <= 3 && diffDays >= 0;
  });

  // Simple recommendation: Available books not currently borrowed

  // Best Sellers: Sort by loan count (descending)
  const bestSellers = [...allBooks]
    .sort((a, b) => (b.loanCount || 0) - (a.loanCount || 0))
    .slice(0, 4);

  const eligibility = canUserBorrow(String(user.id));

  const filteredBooks = allBooks.filter(book => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query)
    );
  });

  const handlePayFine = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async () => {
    const result = await payFine(String(user.id));
    if (result.success) {
      toast({
        title: 'Fine paid',
        description: 'Your fine has been cleared successfully.',
      });
      refreshUser();
      fetchData();
    }
    setShowPaymentDialog(false);
  };

  const handleBorrow = async (bookId: string | number, periodDays: number, cost: number) => {
    const result = await borrowBook(String(user.id), String(bookId), periodDays, cost);
    if (result.success) {
      toast({
        title: 'Book borrowed!',
        description: 'The book has been added to your loans.',
      });
      refreshUser();
      fetchData();
    } else {
      toast({
        title: 'Cannot borrow',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReserve = async (bookId: string | number) => {
    const result = await reserveBook(String(user.id), String(bookId));
    if (result.success) {
      toast({
        title: 'Book reserved!',
        description: 'You will be notified when it becomes available.',
      });
      fetchData();
    } else {
      toast({
        title: 'Cannot reserve',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">Here is what is happening with your library account today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-muted-foreground">of {user.borrowingLimit} limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservations.length}</div>
              <p className="text-xs text-muted-foreground">books waiting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Library Collection</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allBooks.length}</div>
              <p className="text-xs text-muted-foreground">total books</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${user.fines > 0 ? 'text-destructive' : ''}`}>
                ${Number(user.fines).toFixed(2)}
              </div>
              {user.fines > 0 && (
                <Button size="sm" className="mt-2" onClick={handlePayFine}>
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 1. Alerts Section */}
        <div className="space-y-4">
          {overdueLoans.length > 0 && (
            <Card className="border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Action Required: Overdue Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive font-medium mb-2">
                  You have {overdueLoans.length} overdue book(s). Fines are accumulating daily.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {overdueLoans.map(loan => {
                    const book = getBookById(loan.bookId);
                    return (
                      <li key={loan.id} className="text-sm text-destructive-foreground">
                        <span className="font-semibold">{book?.title}</span> - Due: {new Date(loan.dueDate).toLocaleDateString()}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {dueSoonLoans.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-500/10">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Due Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {dueSoonLoans.map(loan => {
                    const book = getBookById(loan.bookId);
                    return (
                      <li key={loan.id} className="text-sm text-yellow-800">
                        <span className="font-semibold">{book?.title}</span> - Due: {new Date(loan.dueDate).toLocaleDateString()}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 2. Your Active Loans Section */}
        {activeLoans.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Active Loans</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {activeLoans.slice(0, 4).map(loan => {
                const book = getBookById(loan.bookId);
                if (!book) return null;
                return (
                  <Card key={loan.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-1" title={book.title}>{book.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="text-sm text-muted-foreground mb-4">
                        <p>Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                        <p className={new Date(loan.dueDate) < new Date() ? 'text-destructive font-medium' : 'text-green-600'}>
                          {new Date(loan.dueDate) < new Date() ? 'Overdue' : 'On Track'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/my-loans')}>View Details</Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. Best Sellers */}
        {bestSellers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Best Sellers</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={(periodDays, cost) => handleBorrow(book.id, periodDays, cost)}
                  onReserve={() => handleReserve(book.id)}
                  borrowDisabled={!eligibility.canBorrow}
                  disabledReason={eligibility.reason}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Full Collection Search (Existing) */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Explore Full Collection</h2>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {!eligibility.canBorrow && eligibility.reason && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
              {eligibility.reason}
            </div>
          )}

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No books found matching your search.' : 'No books in the library.'}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={(periodDays, cost) => handleBorrow(book.id, periodDays, cost)}
                  onReserve={() => handleReserve(book.id)}
                  borrowDisabled={!eligibility.canBorrow}
                  disabledReason={eligibility.reason}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={user.fines}
        description={`Pay outstanding library fines`}
        onSuccess={handlePaymentSuccess}
        type="fine"
      />
    </Layout>
  );
}
