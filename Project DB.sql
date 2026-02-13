CREATE DATABASE book_buddy;
USE book_buddy;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','manager','user') DEFAULT 'user',
  borrowing_limit INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150),
  isbn VARCHAR(50),
  category VARCHAR(100),
  description TEXT,
  total_copies INT DEFAULT 0,
  available_copies INT DEFAULT 0,
  price DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  borrowed_date DATE,
  due_date DATE,
  returned_date DATE,
  status ENUM('borrowed','returned','reserved') DEFAULT 'borrowed',
  paid_amount DECIMAL(6,2) DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password, role)
VALUES
('Admin', 'admin@library.com', 'admin123', 'admin'),
('Manager', 'manager@library.com', 'manager123', 'manager'),
('John Doe', 'user@library.com', 'user123', 'user');

INSERT INTO books
(title, author, isbn, category, description, total_copies, available_copies, price)
VALUES
('The Great Gatsby','F. Scott Fitzgerald','9780743273565','Fiction',
 'A novel about the American Dream',5,5,1.50),

('To Kill a Mockingbird','Harper Lee','9780061120084','Fiction',
 'A classic of modern American literature',3,2,2.00),

('1984','George Orwell','9780451524935','Dystopian',
 'A dystopian social science fiction novel',4,0,2.75),

('Pride and Prejudice','Jane Austen','9780141439518','Romance',
 'A romantic novel of manners',2,1,1.25);

INSERT INTO books
(title, author, isbn, category, description, total_copies, available_copies, price)
VALUES
(
  'The Catcher in the Rye',
  'J.D. Salinger',
  '9780316769488',
  'Classic',
  'A novel about teenage alienation and loss of innocence',
  3,
  3,
  1.75
);

UPDATE books
SET title = 'The Great Gatsby'
WHERE id = 1;
select * from books;

