import { BookService } from '../services/bookService.js';

const bookService = new BookService();

export const getAllBooks = async (req, res, next) => {
  try {
    const { search } = req.query;
    const books = await bookService.getAllBooks(search);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.status(200).json(book);
  } catch (error) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ error: 'Book not found' });
    }
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, totalCopies, copiesAvailable, category, description, pricing, price } = req.body;

    if (!title || !author || !isbn || !totalCopies) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const book = await bookService.createBook({
      title, author, isbn, totalCopies, copiesAvailable, category, description, pricing, price
    });
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    res.status(200).json(book);
  } catch (error) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ error: 'Book not found' });
    }
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
