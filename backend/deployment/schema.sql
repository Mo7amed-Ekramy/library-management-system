CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(100) UNIQUE NOT NULL,
 password VARCHAR(255) NOT NULL,
 role ENUM('admin','manager','user') DEFAULT 'user',
 borrowing_limit INT DEFAULT 5,
 fines DECIMAL(10,2) NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE books (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(200) NOT NULL,
 author VARCHAR(150), isbn VARCHAR(50), category VARCHAR(100), description TEXT,
 total_copies INT DEFAULT 0, available_copies INT DEFAULT 0,
 price DECIMAL(6,2) DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE loans (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT, book_id INT,
 borrowed_date DATE, due_date DATE, returned_date DATE,
 status ENUM('borrowed','returned','reserved') DEFAULT 'borrowed',
 paid_amount DECIMAL(6,2) DEFAULT 0,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
CREATE TABLE notifications (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT, message TEXT,
 is_read BOOLEAN DEFAULT false,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
