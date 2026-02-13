# Frontend-Backend Integration Guide

## Overview
The backend is now ready to replace the localStorage-based frontend. This guide shows how to integrate the two.

## Step 1: Update Frontend API Configuration

Create a new file: `frontend/src/lib/api.ts`

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getCurrentUser: () => fetchAPI('/auth/me'),
};

// Books APIs
export const booksAPI = {
  getAll: (search?: string) =>
    fetchAPI(`/books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  
  getById: (id: string) => fetchAPI(`/books/${id}`),
  
  create: (data: any) =>
    fetchAPI('/books', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    fetchAPI(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchAPI(`/books/${id}`, { method: 'DELETE' }),
};

// Loans APIs
export const loansAPI = {
  borrow: (bookId: string, periodDays: number, cost: number) =>
    fetchAPI('/loans/borrow', {
      method: 'POST',
      body: JSON.stringify({ bookId, periodDays, cost }),
    }),
  
  return: (loanId: string) =>
    fetchAPI('/loans/return', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    }),
  
  getMyLoans: () => fetchAPI('/loans/my'),
  
  getAllLoans: (status?: string, userId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    return fetchAPI(`/loans?${params.toString()}`);
  },
};

// Users APIs
export const usersAPI = {
  getProfile: () => fetchAPI('/users/profile'),
  
  updateProfile: (data: { name: string; email: string }) =>
    fetchAPI('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  payFine: (amount: number) =>
    fetchAPI('/users/pay-fine', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  
  getAllUsers: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    return fetchAPI(`/users?${params.toString()}`);
  },
  
  updateUserRole: (userId: string, role: string) =>
    fetchAPI(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  clearUserFines: (userId: string) =>
    fetchAPI(`/users/${userId}/clear-fine`, { method: 'POST' }),
};

// Notifications APIs
export const notificationsAPI = {
  getAll: () => fetchAPI('/notifications'),
  
  markAsRead: (id: string) =>
    fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  
  markAllAsRead: () =>
    fetchAPI('/notifications/mark-all-read', { method: 'POST' }),
};
```

## Step 2: Update useAuth Hook

Replace `frontend/src/hooks/useAuth.ts` with backend API calls:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';
import { authAPI, setAuthToken, clearAuthToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setUser(user);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await authAPI.login(email, password);
      setAuthToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const result = await authAPI.register(email, password, name);
      setAuthToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
      clearAuthToken();
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isAuthenticated: !!user,
  };
}
```

## Step 3: Update useLibrary Hook

Replace relevant functions in `frontend/src/hooks/useLibrary.ts` to use the API:

```typescript
import { useCallback } from 'react';
import { Book, Loan } from '@/lib/types';
import { booksAPI, loansAPI, usersAPI } from '@/lib/api';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useLibrary() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const searchBooks = useCallback(async (query: string): Promise<Book[]> => {
    try {
      return await booksAPI.getAll(query);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    }
  }, [toast]);

  const borrowBook = useCallback(
    async (bookId: string, periodDays: number, cost: number) => {
      try {
        await loansAPI.borrow(bookId, periodDays, cost);
        refreshUser();
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [refreshUser]
  );

  const returnBook = useCallback(async (loanId: string) => {
    try {
      const result = await loansAPI.return(loanId);
      refreshUser();
      return { success: true, fine: result.fine };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [refreshUser]);

  const payFine = useCallback(async () => {
    try {
      if (!user) return { success: false };
      await usersAPI.payFine(user.fines);
      refreshUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, refreshUser]);

  return {
    searchBooks,
    borrowBook,
    returnBook,
    payFine,
    // ... other methods
  };
}
```

## Step 4: Environment Configuration

Add to `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Step 5: Start Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Testing Integration

1. **Register** → Should create user in database
2. **Login** → Should return JWT token
3. **Borrow book** → Should create loan in database
4. **View loans** → Should fetch from database
5. **Return book** → Should update database
6. **Check fines** → Should calculate overdue charges

## API Response Format Verification

The backend returns data in exactly the format the frontend expects:

### User Object
```json
{
  "id": "1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "fines": 0,
  "borrowingLimit": 5,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Book Object
```json
{
  "id": "1",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "totalCopies": 5,
  "copiesAvailable": 3,
  "category": "Fiction",
  "description": "...",
  "pricing": [
    { "days": 7, "price": 2.5, "label": "1 Week" },
    { "days": 14, "price": 4.0, "label": "2 Weeks" },
    { "days": 30, "price": 5.5, "label": "1 Month" }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Loan Object
```json
{
  "id": "1",
  "userId": "1",
  "bookId": "1",
  "borrowDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-01-22T10:30:00.000Z",
  "returnDate": null,
  "status": "Borrowed",
  "borrowingPeriodDays": 7,
  "borrowingCost": 2.5
}
```

## Error Handling

The backend returns errors in this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Frontend should handle all API calls with try-catch:
```typescript
try {
  const data = await apiCall();
} catch (error: any) {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
}
```

## Troubleshooting

**CORS Error**: Check `FRONTEND_URL` in backend `.env`
**Token Error**: Ensure token is being passed in Authorization header
**Database Error**: Check backend `.env` database credentials
**404 on API**: Verify backend is running on port 5000

---

**Integration is ready! The backend is fully compatible with the frontend. 🚀**
