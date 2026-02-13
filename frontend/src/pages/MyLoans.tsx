import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { loansApi } from '@/services/loansApi';
import { useLibrary } from '@/hooks/useLibrary';
import { Loan, Reservation, Book } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';

export default function MyLoans() {
  const { user } = useAuth();
  const { getAllBooks } = useLibrary();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (user) {
      loansApi.getMyLoans().then((data: Loan[]) => {
        // Split loans and reservations
        const reserved = data.filter(l => l.status === 'Reserved');
        const standardLoans = data.filter(l => l.status !== 'Reserved');

        setLoans(standardLoans);

        // Map Loan -> Reservation type
        // schema: borrowDate in DB is used as reservation date
        const mappedReservations: Reservation[] = reserved.map(r => ({
          id: r.id,
          userId: r.userId,
          bookId: r.bookId,
          reservationDate: r.borrowDate,
          status: 'Waiting' // Default status for UI
        }));
        setReservations(mappedReservations);
      }).catch(console.error);

      getAllBooks().then(setAllBooks).catch(console.error);
    }
  }, [user, getAllBooks]);

  const getBookById = (id: string | number) => allBooks.find(b => String(b.id) === String(id));

  const activeLoans = loans.filter(l => l.status !== 'Returned');
  const returnedLoans = loans.filter(l => l.status === 'Returned');

  const getStatusBadge = (loan: Loan) => {
    const dueDate = new Date(loan.dueDate);
    const isOverdue = dueDate < new Date() && loan.status !== 'Returned';

    if (loan.status === 'Returned') {
      return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    return <Badge><Clock className="h-3 w-3 mr-1" />Borrowed</Badge>;
  };

  const LoanCard = ({ loan, book }: { loan: Loan; book: Book | undefined }) => {
    const dueDate = new Date(loan.dueDate);
    const isOverdue = dueDate < new Date() && loan.status !== 'Returned';

    return (
      <Card className={isOverdue ? 'border-destructive' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{book?.title || 'Unknown Book'}</CardTitle>
            {getStatusBadge(loan)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Author:</span> {book?.author}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Borrowed:</span>{' '}
              {new Date(loan.borrowDate).toLocaleDateString()}
            </p>
            <p className={`${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              <span className="font-medium text-foreground">Due:</span>{' '}
              {dueDate.toLocaleDateString()}
            </p>
            {loan.borrowingPeriodDays && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="font-medium text-foreground">Period:</span>{' '}
                {loan.borrowingPeriodDays} days
              </p>
            )}
            {loan.borrowingCost !== undefined && (
              <p className="flex items-center gap-1 text-primary">
                <DollarSign className="h-3 w-3" />
                <span className="font-medium">Paid:</span>{' '}
                ${loan.borrowingCost.toFixed(2)}
              </p>
            )}
            {loan.returnDate && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Returned:</span>{' '}
                {new Date(loan.returnDate).toLocaleDateString()}
              </p>
            )}
          </div>
          {loan.status !== 'Returned' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Please return this book to the library before the due date to avoid late fees.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ReservationCard = ({ reservation, book }: { reservation: Reservation; book: Book | undefined }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{book?.title || 'Unknown Book'}</CardTitle>
          <Badge variant={reservation.status === 'Available' ? 'default' : 'secondary'}>
            {reservation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Author:</span> {book?.author}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Reserved:</span>{' '}
            {new Date(reservation.reservationDate).toLocaleDateString()}
          </p>
        </div>
        {reservation.status === 'Available' && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              This book is now available! Visit the library to borrow it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Loans</h1>
          <p className="text-muted-foreground mt-2">View your borrowed books and reservations</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="history">History ({returnedLoans.length})</TabsTrigger>
            <TabsTrigger value="reservations">Reservations ({reservations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeLoans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You have no active loans.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} book={getBookById(loan.bookId)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {returnedLoans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No loan history.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {returnedLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} book={getBookById(loan.bookId)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            {reservations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You have no reservations.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    book={getBookById(reservation.bookId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
