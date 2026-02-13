import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';
import { authApi } from '@/services/authApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, DollarSign, Shield, User as UserIcon, BarChart3, Loader2 } from 'lucide-react';

export default function ManageUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getAllUsers();
      if (response && Array.isArray(response)) {
        setUsers(response);
      } else if (response && response.error) {
        toast({ title: 'Error', description: response.error, variant: 'destructive' });
      } else {
        // If response is not array, it might be wrapped? Based on code, getAllUsers calls apiFetch which returns json.
        // userController returns array.
        setUsers(response as User[]);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearFine = async (userId: string | number) => {
    try {
      const result = await authApi.clearUserFines(userId.toString());
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Fine cleared for user.' });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear fine', variant: 'destructive' });
    }
  };

  const handleRoleChange = async (userId: string | number, newRole: 'user' | 'admin' | 'manager') => {

    try {
      const result = await authApi.updateUserRole(userId.toString(), newRole);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({
          title: 'Success',
          description: `User role changed to ${newRole}.`
        });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'manager':
        return <BarChart3 className="h-4 w-4 text-chart-2" />;
      default:
        return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-2">View and manage library members</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Active Loans</TableHead>
                    <TableHead className="text-center">Fines</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const isCurrentUser = currentUser && (currentUser.id.toString() === user.id.toString());

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              {user.name}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role) as any}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">

                            {(user as any).activeLoans || 0} / {user.borrowingLimit}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.fines > 0 ? (
                              <span className="text-destructive font-medium">
                                ${user.fines.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">$0.00</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user.fines > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleClearFine(user.id)}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Clear Fine
                                </Button>
                              )}
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'admin' | 'manager')}
                                disabled={isCurrentUser}
                              >
                                <SelectTrigger className="w-[130px]" disabled={isCurrentUser}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="h-4 w-4" />
                                      User
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="manager">
                                    <div className="flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Manager
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
