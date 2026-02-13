import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/lib/types';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const { searchBooks, borrowBook, reserveBook, canUserBorrow } = useLibrary();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      const results = await searchBooks(query);
      setBooks(results);
    };
    fetchBooks();
  }, [query, searchBooks]);

  const eligibility = user ? canUserBorrow(String(user.id)) : { canBorrow: false };

  const handleBorrow = async (bookId: string | number, periodDays: number, cost: number) => {
    if (!user) return;

    const result = await borrowBook(String(user.id), String(bookId), periodDays, cost);
    if (result.success) {
      toast({
        title: 'Book borrowed!',
        description: 'The book has been added to your loans.',
      });
      const results = await searchBooks(query);
      setBooks(results);
      refreshUser();
    } else {
      toast({
        title: 'Cannot borrow',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReserve = async (bookId: string | number) => {
    if (!user) return;

    const result = await reserveBook(String(user.id), String(bookId));
    if (result.success) {
      toast({
        title: 'Book reserved!',
        description: 'You will be notified when it becomes available.',
      });
      refreshUser(); // Refresh to update reservations count
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Books</h1>
          <p className="text-muted-foreground mt-2">Find books by title, author, or ISBN</p>
        </div>

        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {!eligibility.canBorrow && eligibility.reason && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {eligibility.reason}
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {query ? 'No books found matching your search.' : 'No books in the library.'}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
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
    </Layout>
  );
}
