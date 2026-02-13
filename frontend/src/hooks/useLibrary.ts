
import { useCallback } from 'react';
import { Book, Loan, Notification, Reservation } from '@/lib/types';
import { bookApi } from '@/services/bookApi';
import { loansApi } from '@/services/loansApi';
import { userApi } from '@/services/userApi';
import { notificationsApi } from '@/services/notificationsApi';

export function useLibrary() {
  const searchBooks = useCallback(async (query: string): Promise<Book[]> => {
    const books = await bookApi.getAllBooks();
    if (!query.trim()) return books;

    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book: Book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const canUserBorrow = useCallback((userId: string): { canBorrow: boolean; reason?: string } => {
    // Client-side validation is deprecated in favor of backend.
    // We could check user object if passed, but for now we let backend reject.
    return { canBorrow: true };
  }, []);

  const borrowBook = useCallback(async (
    userId: string,
    bookId: string | number,
    periodDays: number,
    cost: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await loansApi.borrowBook(String(bookId), periodDays, cost);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const reserveBook = useCallback(async (userId: string, bookId: string | number): Promise<{ success: boolean; error?: string }> => {
    try {
      await loansApi.reserveBook(String(bookId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const returnBook = useCallback(async (loanId: string | number): Promise<{ success: boolean; fine?: number; error?: string }> => {
    try {
      const result = await loansApi.returnBook(String(loanId));
      return { success: true, fine: result.fine };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const payFine = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await userApi.payFine(); // Pay all fines
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const createBook = useCallback(async (bookData: any): Promise<{ success: boolean; error?: string }> => {
    // This is admin function, should use adminBooksApi?
    // Dashboard doesn't use it.
    return { success: false, error: "Use Admin Dashboard" };
  }, []);

  const editBook = useCallback(async (book: Book): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: "Use Admin Dashboard" };
  }, []);

  const removeBook = useCallback(async (bookId: string): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: "Use Admin Dashboard" };
  }, []);

  // API wrappers for data fetching
  const getAllBooks = useCallback(async () => {
    return bookApi.getAllBooks();
  }, []);

  const getAllLoans = useCallback(async () => {
    return loansApi.getAllLoans();
  }, []); // Admin only

  const getAllReservations = useCallback(async () => {
    return []; // Not implemented in backend
  }, []);

  return {
    searchBooks,
    canUserBorrow,
    borrowBook,
    reserveBook,
    returnBook,
    payFine,
    createBook,
    editBook,
    removeBook,
    getAllBooks,
    getAllLoans,
    getAllReservations,
  };
}
