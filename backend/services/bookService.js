import { pool } from '../config/database.js';

export class BookService {
  async getAllBooks(search = '') {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT b.*, 
        (SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id) as loan_count
        FROM books b
      `;
      const params = [];

      if (search) {
        query += ` WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY b.created_at DESC';

      const [books] = await connection.execute(query, params);
      return books.map(this._formatBook);
    } finally {
      connection.release();
    }
  }

  async getBookById(bookId) {
    const connection = await pool.getConnection();
    try {
      const [books] = await connection.execute(
        'SELECT * FROM books WHERE id = ?',
        [bookId]
      );

      if (books.length === 0) {
        throw new Error('Book not found');
      }

      return this._formatBook(books[0]);
    } finally {
      connection.release();
    }
  }

  async createBook(data) {
    const connection = await pool.getConnection();
    try {
      const {
        title, author, isbn, totalCopies, copiesAvailable, category, description, price
      } = data;

      const finalAvailable = copiesAvailable !== undefined ? copiesAvailable : totalCopies;

      const [result] = await connection.execute(
        `INSERT INTO books 
         (title, author, isbn, total_copies, available_copies, category, description, price, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [title, author, isbn, totalCopies, finalAvailable, category, description, price]
      );

      return this.getBookById(result.insertId);
    } finally {
      connection.release();
    }
  }

  async updateBook(bookId, data) {
    const connection = await pool.getConnection();
    try {
      const { title, author, isbn, totalCopies, copiesAvailable, category, description, price } = data;

      await connection.execute(
        `UPDATE books 
         SET title = ?, author = ?, isbn = ?, total_copies = ?, available_copies = ?, category = ?, description = ?, price = ?
         WHERE id = ?`,
        [title, author, isbn, totalCopies, copiesAvailable, category, description, price, bookId]
      );

      return this.getBookById(bookId);
    } finally {
      connection.release();
    }
  }

  async deleteBook(bookId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM books WHERE id = ?', [bookId]);
      return { success: true };
    } finally {
      connection.release();
    }
  }

  async updateAvailableCopies(bookId, change) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE books SET available_copies = available_copies + ? WHERE id = ?',
        [change, bookId]
      );
    } finally {
      connection.release();
    }
  }

  _formatBook(book) {
    let pricing = [];
    try {
      if (book.pricing) {
        pricing = JSON.parse(book.pricing);
      }
    } catch (e) {
      pricing = [];
    }

    // Default pricing if none exists (for DB compatibility)
    if (!pricing || pricing.length === 0) {
      const basePrice = parseFloat(book.price || 0);
      pricing = [
        { days: 7, label: '1 Week', price: basePrice },
        { days: 14, label: '2 Weeks', price: basePrice * 2 },
        { days: 30, label: '1 Month', price: basePrice * 4 }
      ];
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.total_copies,
      copiesAvailable: book.available_copies,
      category: book.category,
      description: book.description,
      pricing: pricing,
      createdAt: book.created_at.toISOString(),
      loanCount: book.loan_count || 0
    };
  }
}
