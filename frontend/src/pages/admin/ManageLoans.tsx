import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';

import { loansApi } from '@/services/loansApi';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RotateCcw, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

// Extended Loan Interface for Admin View
interface AdminLoan extends Loan {
  bookTitle: string;
  userName: string;
  userEmail: string;
}

export default function ManageLoans() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      setIsLoading(true);
      const data = await loansApi.getAllLoans();
      if (data && Array.isArray(data)) {
        setLoans(data as AdminLoan[]);
      } else {
        setLoans([]);
        if (data?.error) toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch loans', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (loanId: string | number) => {
    try {
      const result = await loansApi.returnBook(loanId.toString());
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({
          title: 'Book returned',
          description: result.fine
            ? `A late fine of $${result.fine.toFixed(2)} has been added.`
            : 'Book returned successfully.',
        });
        fetchLoans();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to return book', variant: 'destructive' });
    }
  };

  const isOverdue = (loan: Loan) => {
    const dueDate = new Date(loan.dueDate);
    return dueDate < new Date() && loan.status !== 'Returned';
  };

  const filterLoans = (status: 'all' | 'active' | 'overdue' | 'returned') => {
    let filtered = loans;

    if (status === 'active') {
      filtered = loans.filter(l => l.status !== 'Returned');
    } else if (status === 'overdue') {
      filtered = loans.filter(l => isOverdue(l));
    } else if (status === 'returned') {
      filtered = loans.filter(l => l.status === 'Returned');
    }

    if (searchQuery) {
      filtered = filtered.filter(loan => {
        return (
          loan.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loan.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loan.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const getStatusBadge = (loan: Loan) => {
    if (loan.status === 'Returned') {
      return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>;
    }
    if (isOverdue(loan)) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    return <Badge><Clock className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const LoanTable = ({ loansToShow }: { loansToShow: AdminLoan[] }) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Borrowed</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loansToShow.map((loan) => {
              return (
                <TableRow key={loan.id} className={isOverdue(loan) ? 'bg-destructive/5' : ''}>
                  <TableCell className="font-medium">{loan.bookTitle || 'Unknown'}</TableCell>
                  <TableCell>
                    <div>
                      <p>{loan.userName || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{loan.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(loan.borrowDate).toLocaleDateString()}</TableCell>
                  <TableCell className={isOverdue(loan) ? 'text-destructive font-medium' : ''}>
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan)}</TableCell>
                  <TableCell className="text-right">
                    {loan.status !== 'Returned' && (
                      <Button size="sm" onClick={() => handleReturn(loan.id)}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {loansToShow.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const activeCount = loans.filter(l => l.status !== 'Returned').length;
  const overdueCount = loans.filter(l => isOverdue(l)).length;
  const returnedCount = loans.filter(l => l.status === 'Returned').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Loans</h1>
          <p className="text-muted-foreground mt-2">View all loans and process returns</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by book or borrower..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({loans.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="overdue" className="text-destructive">
                Overdue ({overdueCount})
              </TabsTrigger>
              <TabsTrigger value="returned">Returned ({returnedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <LoanTable loansToShow={filterLoans('all')} />
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <LoanTable loansToShow={filterLoans('active')} />
            </TabsContent>

            <TabsContent value="overdue" className="mt-6">
              <LoanTable loansToShow={filterLoans('overdue')} />
            </TabsContent>

            <TabsContent value="returned" className="mt-6">
              <LoanTable loansToShow={filterLoans('returned')} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
