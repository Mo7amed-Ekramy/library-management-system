export interface User {
  id: string | number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'manager';
  fines: number;
  borrowingLimit: number;
  createdAt: string;
}

export interface BookPricing {
  days: number;
  price: number;
  label: string;
}

export interface Book {
  id: string | number;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  copiesAvailable: number;
  category: string;
  description: string;
  createdAt: string;
  // Pricing for different borrowing periods
  pricing: BookPricing[];
  loanCount?: number;
}

export interface Loan {
  id: string | number;
  userId: string | number;
  bookId: string | number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue' | 'Reserved';
  // New fields for pricing
  borrowingPeriodDays: number;
  borrowingCost: number;
}

export interface Reservation {
  id: string | number;
  userId: string | number;
  bookId: string | number;
  reservationDate: string;
  status: 'Waiting' | 'Available' | 'Fulfilled' | 'Cancelled';
}

export interface Notification {
  id: string | number;
  userId: string | number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

