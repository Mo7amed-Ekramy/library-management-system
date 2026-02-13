import { useState } from 'react';
import { Book, BookPricing } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, DollarSign } from 'lucide-react';
import { BorrowDialog } from './BorrowDialog';

interface BookCardProps {
  book: Book;
  onBorrow?: (periodDays: number, cost: number) => void;
  onReserve?: () => void;
  borrowDisabled?: boolean;
  disabledReason?: string;
  showActions?: boolean;
}

export function BookCard({ 
  book, 
  onBorrow, 
  onReserve, 
  borrowDisabled, 
  disabledReason,
  showActions = true 
}: BookCardProps) {
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const isAvailable = book.copiesAvailable > 0;

  // Get the lowest price to show on the card
  const lowestPrice = book.pricing?.reduce(
    (min, p) => (p.price < min ? p.price : min),
    book.pricing[0]?.price || 0
  );

  const handleBorrow = (periodDays: number, cost: number) => {
    onBorrow?.(periodDays, cost);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            <Badge variant={isAvailable ? 'default' : 'secondary'}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Author:</span> {book.author}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">ISBN:</span> {book.isbn}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Category:</span> {book.category}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Copies:</span> {book.copiesAvailable} / {book.totalCopies}
            </p>
            {lowestPrice !== undefined && (
              <p className="flex items-center gap-1 text-primary font-medium">
                <DollarSign className="h-4 w-4" />
                From ${lowestPrice.toFixed(2)}
              </p>
            )}
            {book.description && (
              <p className="text-muted-foreground line-clamp-2">{book.description}</p>
            )}
          </div>
        </CardContent>
        {showActions && (
          <CardFooter>
            {isAvailable ? (
              <Button 
                onClick={() => setBorrowDialogOpen(true)} 
                disabled={borrowDisabled} 
                className="w-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Borrow
              </Button>
            ) : (
              <Button onClick={onReserve} variant="secondary" className="w-full">
                Reserve
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <BorrowDialog
        open={borrowDialogOpen}
        onOpenChange={setBorrowDialogOpen}
        book={book}
        onBorrow={handleBorrow}
        borrowDisabled={borrowDisabled}
        disabledReason={disabledReason}
      />
    </>
  );
}
