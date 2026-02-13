import { pool } from '../config/database.js';
import { LOAN_STATUS, FINE_PER_DAY } from '../config/constants.js';

export class LoanService {
  async borrowBook(userId, bookId, periodDays, cost) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check user eligibility
      const eligibility = await this._checkBorrowingEligibility(connection, userId);
      if (!eligibility.canBorrow) {
        throw new Error(eligibility.reason);
      }

      // Check book availability and details
      const [books] = await connection.execute(
        'SELECT available_copies, title FROM books WHERE id = ?',
        [bookId]
      );

      if (books.length === 0) {
        throw new Error('Book not found');
      }

      if (books[0].available_copies <= 0) {
        throw new Error('No copies available');
      }

      // Check for EXISTING reservation for THIS user
      const [myReservation] = await connection.execute(
        `SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status = 'reserved'`,
        [userId, bookId]
      );

      // Check total active reservations for this book
      const [totalReservations] = await connection.execute(
        `SELECT count(*) as count FROM loans WHERE book_id = ? AND status = 'reserved'`,
        [bookId]
      );
      const reservationCount = totalReservations[0].count;

      // Rule: If available_copies <= reservationCount, ONLY reservers can borrow.
      // If I don't have a reservation, and copies <= reservations, I can't borrow.
      if (myReservation.length === 0 && books[0].available_copies <= reservationCount) {
        throw new Error('Book is reserved for other users');
      }

      // Check if user already has this book borrowed (active loan)
      const [existingLoans] = await connection.execute(
        `SELECT id FROM loans 
         WHERE user_id = ? AND book_id = ? AND status = ?`,
        [userId, bookId, LOAN_STATUS.BORROWED]
      );

      if (existingLoans.length > 0) {
        throw new Error('You already have this book borrowed');
      }

      // Create loan (or update reservation)
      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + periodDays);

      let result;
      if (myReservation.length > 0) {
        // FULFILL RESERVATION: Update existing loan record
        // We do NOT decrease available_copies because it was logically held? 
        // Wait, 'reserved' status usually doesn't decrease available_copies until borrowed?
        // If we treat available_copies as physical count on shelf. 
        // When I reserve, copies stay same. When I borrow, copies - 1.
        // So YES, we decrease copies.
        await connection.execute(
          `UPDATE loans 
             SET status = ?, borrowed_date = ?, due_date = ?, paid_amount = ?
             WHERE id = ?`,
          [LOAN_STATUS.BORROWED, borrowDate, dueDate, cost, myReservation[0].id]
        );
        result = { insertId: myReservation[0].id };
      } else {
        // NEW LOAN
        const [res] = await connection.execute(
          `INSERT INTO loans (user_id, book_id, borrowed_date, due_date, status, paid_amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, bookId, borrowDate, dueDate, LOAN_STATUS.BORROWED, cost]
        );
        result = res;
      }

      // Update available copies
      await connection.execute(
        'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
        [bookId]
      );

      // Create notification
      // const [book] = ... already fetched title above
      const notificationMessage = `You have borrowed "${books[0].title}" for ${periodDays} days. Due date: ${dueDate.toLocaleDateString()}. Payment: $${cost.toFixed(2)}`;

      await connection.execute(
        `INSERT INTO notifications (user_id, message, is_read, created_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, notificationMessage, false]
      );

      await connection.commit();

      return { success: true, loanId: result.insertId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async returnBook(loanId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get loan details
      const [loans] = await connection.execute(
        'SELECT id, user_id, book_id, due_date, status FROM loans WHERE id = ?',
        [loanId]
      );

      if (loans.length === 0) {
        throw new Error('Loan not found');
      }

      const loan = loans[0];

      if (loan.status === LOAN_STATUS.RETURNED) {
        throw new Error('Book already returned');
      }

      // Calculate fine if overdue
      const returnDate = new Date();
      const dueDate = new Date(loan.due_date);
      let fine = 0;

      if (returnDate > dueDate) {
        const daysOverdue = Math.ceil(
          (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        fine = daysOverdue * FINE_PER_DAY;

        // Cannot update user fines as column doesn't exist.
        // We just track it for return message.
      }

      // Update loan
      await connection.execute(
        `UPDATE loans SET returned_date = NOW(), status = ? WHERE id = ?`,
        [LOAN_STATUS.RETURNED, loanId]
      );

      // Update available copies
      await connection.execute(
        'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
        [loan.book_id]
      );

      // Get book title for notification
      const [books] = await connection.execute(
        'SELECT title FROM books WHERE id = ?',
        [loan.book_id]
      );

      if (fine > 0) {
        const notificationMessage = `You returned "${books[0].title}" but it was overdue. Estimated Fine: $${fine.toFixed(2)}`;

        await connection.execute(
          `INSERT INTO notifications (user_id, message, is_read, created_at)
           VALUES (?, ?, ?, NOW())`,
          [loan.user_id, notificationMessage, false]
        );
      }

      await connection.commit();

      return { success: true, fine };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getMyLoans(userId) {
    const connection = await pool.getConnection();
    try {
      const [loans] = await connection.execute(
        `SELECT * FROM loans WHERE user_id = ? ORDER BY borrowed_date DESC`,
        [userId]
      );

      return loans.map(this._formatLoan);
    } finally {
      connection.release();
    }
  }

  async getAllLoans(filter = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT l.*, b.title as book_title, u.name as user_name, u.email as user_email 
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filter.status) {
        query += ' AND l.status = ?';
        params.push(filter.status);
      }

      if (filter.userId) {
        query += ' AND l.user_id = ?';
        params.push(filter.userId);
      }

      query += ' ORDER BY l.borrowed_date DESC';

      const [loans] = await connection.execute(query, params);
      return loans.map(this._formatLoan);
    } finally {
      connection.release();
    }
  }

  async _checkBorrowingEligibility(connection, userId) {
    // Check fines (Skipped as DB has no fines column)
    const [users] = await connection.execute(
      'SELECT id, borrowing_limit FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return { canBorrow: false, reason: 'User not found' };
    }

    // Check overdue books
    const [overdueLoans] = await connection.execute(
      `SELECT id FROM loans 
       WHERE user_id = ? AND status = ? AND due_date < NOW()`,
      [userId, LOAN_STATUS.BORROWED]
    );

    if (overdueLoans.length > 0) {
      return { canBorrow: false, reason: 'You have overdue books. Please return them first.' };
    }

    // Check borrowing limit
    const [activeLoans] = await connection.execute(
      `SELECT COUNT(*) as count FROM loans 
       WHERE user_id = ? AND status = ?`,
      [userId, LOAN_STATUS.BORROWED]
    );

    if (activeLoans[0].count >= users[0].borrowing_limit) {
      return {
        canBorrow: false,
        reason: `You have reached your borrowing limit of ${users[0].borrowing_limit} books.`
      };
    }

    return { canBorrow: true };
  }

  async reserveBook(userId, bookId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check user eligibility is usually strict, but for reservation we might be lenient?
      // Or check if they already have it reserved.
      const [existing] = await connection.execute(
        `SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN (?, ?)`,
        [userId, bookId, LOAN_STATUS.BORROWED, 'reserved'] // 'reserved' literal or constant
      );

      if (existing.length > 0) {
        throw new Error('You already have this book borrowed or reserved');
      }

      // We do NOT check available_copies because we are reserving it presumably because it's NOT available?
      // Or we reserve it to lock a copy?
      // Usage scenario: User clicks Reserve when UNAVAILABLE. 
      // User clicks Borrow when AVAILABLE.
      // So checking available_copies <= 0 is correct validation, but maybe we let them reserve anyway.

      const resDate = new Date();
      // Due date for a reservation? Maybe expiration? Let's say 3 days to pick it up?
      // Or just null if schema allows. Schema: due_date DATE.
      // We'll set a placeholder due date.
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);

      const [result] = await connection.execute(
        `INSERT INTO loans (user_id, book_id, borrowed_date, due_date, status, paid_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, bookId, resDate, dueDate, 'reserved', 0]
      );

      // Notification
      const [book] = await connection.execute('SELECT title FROM books WHERE id = ?', [bookId]);
      await connection.execute(
        `INSERT INTO notifications (user_id, message, is_read, created_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, `You have reserved "${book[0].title}".`, false]
      );

      await connection.commit();
      return { success: true, reservationId: result.insertId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  _formatLoan(loan) {
    return {
      id: loan.id,
      userId: loan.user_id,
      bookId: loan.book_id,
      bookTitle: loan.book_title,
      userName: loan.user_name,
      userEmail: loan.user_email,
      borrowDate: loan.borrowed_date.toISOString(),
      dueDate: loan.due_date.toISOString(),
      returnDate: loan.returned_date ? loan.returned_date.toISOString() : null,
      status: loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
      borrowingPeriodDays: 14,
      borrowingCost: parseFloat(loan.paid_amount || 0)
    };
  }
}
