import { User, Book, Loan, Reservation, Notification, BookPricing } from './types';

const STORAGE_KEYS = {
  USERS: 'library_users',
  BOOKS: 'library_books',
  LOANS: 'library_loans',
  RESERVATIONS: 'library_reservations',
  NOTIFICATIONS: 'library_notifications',
  CURRENT_USER: 'library_current_user',
};

// Generate random pricing for books with a seed for consistency
export function generateRandomPricing(seed?: number): BookPricing[] {
  const basePrice = seed !== undefined 
    ? ((seed % 30) / 10) + 1  // Deterministic: $1-$4 based on seed
    : Math.random() * 3 + 1;   // Random: $1-$4
  return [
    { days: 7, price: Math.round((basePrice) * 100) / 100, label: '1 Week' },
    { days: 14, price: Math.round((basePrice * 1.6) * 100) / 100, label: '2 Weeks' },
    { days: 30, price: Math.round((basePrice * 2.2) * 100) / 100, label: '1 Month' },
  ];
}

// Default pricing tiers (fallback)
export const DEFAULT_PRICING: BookPricing[] = generateRandomPricing(15);

// Generic storage helpers
function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize with sample data
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@library.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        fines: 0,
        borrowingLimit: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-1',
        email: 'user@library.com',
        password: 'user123',
        name: 'John Doe',
        role: 'user',
        fines: 0,
        borrowingLimit: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'manager-1',
        email: 'manager@library.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager',
        fines: 0,
        borrowingLimit: 5,
        createdAt: new Date().toISOString(),
      },
    ];
    saveToStorage(STORAGE_KEYS.USERS, defaultUsers);
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    const defaultBooks: Book[] = [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        totalCopies: 5,
        copiesAvailable: 5,
        category: 'Fiction',
        description: 'A novel about the American Dream',
        createdAt: new Date().toISOString(),
        pricing: [
          { days: 7, price: 1.50, label: '1 Week' },
          { days: 14, price: 2.40, label: '2 Weeks' },
          { days: 30, price: 3.30, label: '1 Month' },
        ],
      },
      {
        id: 'book-2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0061120084',
        totalCopies: 3,
        copiesAvailable: 3,
        category: 'Fiction',
        description: 'A classic of modern American literature',
        createdAt: new Date().toISOString(),
        pricing: [
          { days: 7, price: 2.00, label: '1 Week' },
          { days: 14, price: 3.20, label: '2 Weeks' },
          { days: 30, price: 4.40, label: '1 Month' },
        ],
      },
      {
        id: 'book-3',
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        totalCopies: 4,
        copiesAvailable: 0,
        category: 'Dystopian',
        description: 'A dystopian social science fiction novel',
        createdAt: new Date().toISOString(),
        pricing: [
          { days: 7, price: 2.75, label: '1 Week' },
          { days: 14, price: 4.40, label: '2 Weeks' },
          { days: 30, price: 6.05, label: '1 Month' },
        ],
      },
      {
        id: 'book-4',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0141439518',
        totalCopies: 2,
        copiesAvailable: 2,
        category: 'Romance',
        description: 'A romantic novel of manners',
        createdAt: new Date().toISOString(),
        pricing: [
          { days: 7, price: 1.25, label: '1 Week' },
          { days: 14, price: 2.00, label: '2 Weeks' },
          { days: 30, price: 2.75, label: '1 Month' },
        ],
      },
      {
        id: 'book-5',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0316769488',
        totalCopies: 3,
        copiesAvailable: 1,
        category: 'Fiction',
        description: 'A story of teenage angst and alienation',
        createdAt: new Date().toISOString(),
        pricing: [
          { days: 7, price: 3.50, label: '1 Week' },
          { days: 14, price: 5.60, label: '2 Weeks' },
          { days: 30, price: 7.70, label: '1 Month' },
        ],
      },
    ];
    saveToStorage(STORAGE_KEYS.BOOKS, defaultBooks);
  }

  if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
    saveToStorage(STORAGE_KEYS.LOANS, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
    saveToStorage(STORAGE_KEYS.RESERVATIONS, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  }
}

// User operations
export function getUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function updateUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    saveUsers(users);
    if (getCurrentUser()?.id === user.id) {
      setCurrentUser(user);
    }
  }
}

// Book operations
export function getBooks(): Book[] {
  const books = getFromStorage<Book>(STORAGE_KEYS.BOOKS, []);
  // Ensure all books have pricing (migration for old data)
  return books.map(book => ({
    ...book,
    pricing: book.pricing || DEFAULT_PRICING,
  }));
}

export function saveBooks(books: Book[]): void {
  saveToStorage(STORAGE_KEYS.BOOKS, books);
}

export function getBookById(id: string): Book | undefined {
  const book = getBooks().find(b => b.id === id);
  if (book && !book.pricing) {
    return { ...book, pricing: DEFAULT_PRICING };
  }
  return book;
}

export function updateBook(book: Book): void {
  const books = getBooks();
  const index = books.findIndex(b => b.id === book.id);
  if (index !== -1) {
    books[index] = book;
    saveBooks(books);
  }
}

// Update book and notify waiting users if copies become available
export function updateBookWithNotification(book: Book): void {
  const existingBook = getBookById(book.id);
  const wasUnavailable = existingBook && existingBook.copiesAvailable === 0;
  const isNowAvailable = book.copiesAvailable > 0;

  updateBook(book);

  // If book became available, notify users with reservations
  if (wasUnavailable && isNowAvailable) {
    const reservations = getBookReservations(book.id);
    reservations.forEach(reservation => {
      const notification: Notification = {
        id: generateId(),
        userId: reservation.userId,
        message: `"${book.title}" is now available! You can borrow it now.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);
      updateReservation({ ...reservation, status: 'Available' });
    });
  }
}

export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
}

export function deleteBook(id: string): void {
  const books = getBooks().filter(b => b.id !== id);
  saveBooks(books);
}

// Loan operations
export function getLoans(): Loan[] {
  return getFromStorage<Loan>(STORAGE_KEYS.LOANS, []);
}

export function saveLoans(loans: Loan[]): void {
  saveToStorage(STORAGE_KEYS.LOANS, loans);
}

export function addLoan(loan: Loan): void {
  const loans = getLoans();
  loans.push(loan);
  saveLoans(loans);
}

export function updateLoan(loan: Loan): void {
  const loans = getLoans();
  const index = loans.findIndex(l => l.id === loan.id);
  if (index !== -1) {
    loans[index] = loan;
    saveLoans(loans);
  }
}

export function getUserLoans(userId: string): Loan[] {
  return getLoans().filter(l => l.userId === userId);
}

export function getActiveLoans(userId: string): Loan[] {
  return getLoans().filter(l => l.userId === userId && l.status !== 'Returned');
}

// Reservation operations
export function getReservations(): Reservation[] {
  return getFromStorage<Reservation>(STORAGE_KEYS.RESERVATIONS, []);
}

export function saveReservations(reservations: Reservation[]): void {
  saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
}

export function addReservation(reservation: Reservation): void {
  const reservations = getReservations();
  reservations.push(reservation);
  saveReservations(reservations);
}

export function updateReservation(reservation: Reservation): void {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === reservation.id);
  if (index !== -1) {
    reservations[index] = reservation;
    saveReservations(reservations);
  }
}

export function getUserReservations(userId: string): Reservation[] {
  return getReservations().filter(r => r.userId === userId);
}

export function getBookReservations(bookId: string): Reservation[] {
  return getReservations().filter(r => r.bookId === bookId && r.status === 'Waiting');
}

// Notification operations
export function getNotifications(): Notification[] {
  return getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS, []);
}

export function saveNotifications(notifications: Notification[]): void {
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function addNotification(notification: Notification): void {
  const notifications = getNotifications();
  notifications.push(notification);
  saveNotifications(notifications);
}

export function getUserNotifications(userId: string): Notification[] {
  return getNotifications().filter(n => n.userId === userId);
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    saveNotifications(notifications);
  }
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const FINE_PER_DAY = 0.50;
export const LOAN_DAYS = 14; // Default, but now configurable per borrow
