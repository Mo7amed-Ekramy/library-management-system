import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, CheckCircle, Loader2, Wallet, Smartphone, Building2 } from 'lucide-react';
import { paymentSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onSuccess: () => void;
  type: 'borrow' | 'fine';
}

type PaymentMethod = 'card' | 'paypal' | 'fawry' | 'instapay';

export function PaymentDialog({
  open,
  onOpenChange,
  amount,
  description,
  onSuccess,
  type,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate based on payment method
    if (paymentMethod === 'card') {
      const validation = paymentSchema.safeParse({ name, cardNumber, expiry, cvv });
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!email || !email.includes('@')) {
        setErrors({ email: 'Valid email is required for PayPal' });
        return;
      }
    } else if (paymentMethod === 'fawry' || paymentMethod === 'instapay') {
      if (!phone || phone.length < 10) {
        setErrors({ phone: 'Valid phone number is required' });
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setIsComplete(true);
    
    // Wait a moment to show success, then complete
    setTimeout(() => {
      onSuccess();
      setIsComplete(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setName('');
    setEmail('');
    setPhone('');
    setErrors({});
    setPaymentMethod('card');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const paymentMethods = [
    { id: 'card' as const, label: 'Card', icon: CreditCard },
    { id: 'paypal' as const, label: 'PayPal', icon: Wallet },
    { id: 'fawry' as const, label: 'Fawry', icon: Building2 },
    { id: 'instapay' as const, label: 'InstaPay', icon: Smartphone },
  ];

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Payment Successful!</h3>
            <p className="text-muted-foreground mt-2 text-center">
              {type === 'borrow' ? 'Your book has been borrowed.' : 'Your fine has been paid.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!isProcessing) {
        onOpenChange(open);
        if (!open) resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {type === 'borrow' ? 'Pay for Borrowing' : 'Pay Outstanding Fine'}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary">${amount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment Method</Label>
          <div className="grid grid-cols-4 gap-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {paymentMethod === 'card' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isProcessing}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  disabled={isProcessing}
                  className={errors.cardNumber ? 'border-destructive' : ''}
                />
                {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    disabled={isProcessing}
                    className={errors.expiry ? 'border-destructive' : ''}
                  />
                  {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    disabled={isProcessing}
                    className={errors.cvv ? 'border-destructive' : ''}
                  />
                  {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'paypal' && (
            <div className="space-y-2">
              <Label htmlFor="email">PayPal Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProcessing}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              <p className="text-xs text-muted-foreground">
                You will be redirected to PayPal to complete the payment.
              </p>
            </div>
          )}

          {paymentMethod === 'fawry' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={isProcessing}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              <p className="text-xs text-muted-foreground">
                A Fawry reference code will be sent to your phone.
              </p>
            </div>
          )}

          {paymentMethod === 'instapay' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Wallet Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={isProcessing}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              <p className="text-xs text-muted-foreground">
                A payment request will be sent to your InstaPay account.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            This is a simulated payment. No real charges will be made.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
