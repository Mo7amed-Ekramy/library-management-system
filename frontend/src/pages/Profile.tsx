import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { loansApi } from '@/services/loansApi';
import { authApi } from '@/services/authApi';
import { User, BookOpen, DollarSign, Calendar, Edit2 } from 'lucide-react';
import { PaymentDialog } from '@/components/PaymentDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { payFine } = useLibrary();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [activeLoansCount, setActiveLoansCount] = useState(0);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loansApi.getMyLoans().then(loans => {
        setActiveLoansCount(loans.filter((l: any) => l.status !== 'Returned').length);
      }).catch(console.error);

      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  if (!user) return null;

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
    }
    setShowPaymentDialog(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await authApi.updateProfile({ name: editName, email: editEmail });
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Profile updated successfully.' });
        refreshUser();
        setIsEditing(false);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      default: return 'Member';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-2">View and manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoansCount}</div>
              <p className="text-xs text-muted-foreground">of {user.borrowingLimit} limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Outstanding Fines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${user.fines > 0 ? 'text-destructive' : ''}`}>
                ${user.fines.toFixed(2)}
              </div>
              {user.fines > 0 && (
                <Button size="sm" className="mt-2" onClick={handlePayFine}>
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={user.fines}
        description="Pay outstanding library fines"
        onSuccess={handlePaymentSuccess}
        type="fine"
      />
    </Layout>
  );
}
