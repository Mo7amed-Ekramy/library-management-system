import { useState } from 'react';
import { Book, BookPricing } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, DollarSign } from 'lucide-react';
import { PaymentDialog } from './PaymentDialog';

interface BorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  onBorrow: (periodDays: number, cost: number) => void;
  borrowDisabled?: boolean;
  disabledReason?: string;
}

export function BorrowDialog({
  open,
  onOpenChange,
  book,
  onBorrow,
  borrowDisabled,
  disabledReason,
}: BorrowDialogProps) {
  const [selectedPricing, setSelectedPricing] = useState<BookPricing | null>(
    book.pricing?.[0] || null
  );
  const [showPayment, setShowPayment] = useState(false);

  const handleProceedToPayment = () => {
    if (!selectedPricing) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (!selectedPricing) return;
    onBorrow(selectedPricing.days, selectedPricing.price);
    setShowPayment(false);
    onOpenChange(false);
    setSelectedPricing(book.pricing?.[0] || null);
  };

  const dueDate = selectedPricing
    ? new Date(Date.now() + selectedPricing.days * 24 * 60 * 60 * 1000)
    : null;

  return (
    <>
      <Dialog open={open && !showPayment} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Borrow Book
            </DialogTitle>
            <DialogDescription>
              Select a borrowing period for "{book.title}"
            </DialogDescription>
          </DialogHeader>

          {borrowDisabled && disabledReason && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
              {disabledReason}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base">Borrowing Period</Label>
              <RadioGroup
                value={selectedPricing?.days.toString()}
                onValueChange={(value) => {
                  const pricing = book.pricing?.find(p => p.days.toString() === value);
                  setSelectedPricing(pricing || null);
                }}
                className="mt-3 space-y-3"
              >
                {book.pricing?.map((pricing) => (
                  <div key={pricing.days} className="flex items-center">
                    <RadioGroupItem
                      value={pricing.days.toString()}
                      id={`period-${pricing.days}`}
                      disabled={borrowDisabled}
                    />
                    <Label
                      htmlFor={`period-${pricing.days}`}
                      className="flex-1 ml-3 cursor-pointer"
                    >
                      <Card className={`transition-colors ${
                        selectedPricing?.days === pricing.days ? 'border-primary bg-primary/5' : ''
                      }`}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{pricing.label}</span>
                            <span className="text-sm text-muted-foreground">
                              ({pricing.days} days)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-bold">
                            <DollarSign className="h-4 w-4" />
                            {pricing.price.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {selectedPricing && dueDate && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{dueDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-primary">${selectedPricing.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={!selectedPricing || borrowDisabled}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedPricing && (
        <PaymentDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          amount={selectedPricing.price}
          description={`Borrowing "${book.title}" for ${selectedPricing.label}`}
          onSuccess={handlePaymentSuccess}
          type="borrow"
        />
      )}
    </>
  );
}
