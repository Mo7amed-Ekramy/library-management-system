# Book Buddy Backend API

A complete Node.js + Express backend for the Book Buddy Library Management System. This backend provides REST APIs for book management, user authentication, loan tracking, and notifications.

## 🎯 Features

- **User Authentication** - Register, Login, JWT tokens
- **Book Management** - CRUD operations with search and filtering
- **Loan System** - Borrow, return, track loans with automatic fine calculation
- **Reservation System** - Reserve books when not available
- **User Management** - Admin can manage roles and fines
- **Notifications** - Automatic notifications for loans, returns, and fines
- **Role-Based Access** - Admin, Manager, and User roles

## 📋 Prerequisites

- Node.js (v16+)
- MySQL 5.7+
- npm or yarn

## 🗄️ Database Setup

### Required Tables (Already in your MySQL database: `book_buddy`)

Ensure these tables exist in your MySQL database:

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'manager') DEFAULT 'user',
  fines DECIMAL(10, 2) DEFAULT 0,
  borrowing_limit INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  total_copies INT NOT NULL,
  available_copies INT NOT NULL,
  category VARCHAR(100),
  description TEXT,
  pricing JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  return_date DATETIME,
  status ENUM('Borrowed', 'Returned', 'Overdue') DEFAULT 'Borrowed',
  borrowing_period_days INT,
  borrowing_cost DECIMAL(10, 2),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reservations table
CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  reservation_date DATETIME NOT NULL,
  status ENUM('Waiting', 'Available', 'Fulfilled', 'Cancelled') DEFAULT 'Waiting',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
```

## ⚙️ Installation & Configuration

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env` with your MySQL credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=book_buddy
   
   JWT_SECRET=your_secret_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   
   PORT=5000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "fines": 0,
    "borrowingLimit": 5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

### Books

#### Get All Books
```http
GET /api/books
Authorization: Bearer {token}

# Optional query params
GET /api/books?search=harry
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
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
]
```

#### Get Single Book
```http
GET /api/books/:id
Authorization: Bearer {token}
```

#### Create Book (Admin only)
```http
POST /api/books
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "1984",
  "author": "George Orwell",
  "isbn": "978-0451524935",
  "totalCopies": 10,
  "category": "Fiction",
  "description": "...",
  "pricing": [
    { "days": 7, "price": 2.0, "label": "1 Week" },
    { "days": 14, "price": 3.5, "label": "2 Weeks" },
    { "days": 30, "price": 5.0, "label": "1 Month" }
  ]
}
```

#### Update Book (Admin only)
```http
PUT /api/books/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "1984 (Updated)",
  "totalCopies": 12,
  ...
}
```

#### Delete Book (Admin only)
```http
DELETE /api/books/:id
Authorization: Bearer {token}
```

---

### Loans

#### Borrow a Book
```http
POST /api/loans/borrow
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookId": 1,
  "periodDays": 7,
  "cost": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "loanId": 5
}
```

**Possible Errors:**
- `"You have unpaid fines. Please pay your fines first."`
- `"You have overdue books. Please return them first."`
- `"You have reached your borrowing limit of 5 books."`
- `"No copies available"`
- `"You already have this book borrowed"`

#### Return a Book
```http
POST /api/loans/return
Authorization: Bearer {token}
Content-Type: application/json

{
  "loanId": 5
}
```

**Response:**
```json
{
  "success": true,
  "fine": 0
}
```

#### Get My Loans
```http
GET /api/loans/my
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 5,
    "userId": 1,
    "bookId": 1,
    "borrowDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-01-22T10:30:00.000Z",
    "returnDate": null,
    "status": "Borrowed",
    "borrowingPeriodDays": 7,
    "borrowingCost": 2.5
  }
]
```

#### Get All Loans (Manager/Admin only)
```http
GET /api/loans
Authorization: Bearer {token}

# Optional filters
GET /api/loans?status=Borrowed&userId=1
```

---

### Users

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

#### Pay Fine
```http
POST /api/users/pay-fine
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5.0
}
```

#### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer {token}

# Optional filters
GET /api/users?role=user&search=john
```

#### Update User Role (Admin only)
```http
PUT /api/users/:id/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "manager"
}
```

#### Clear User Fines (Admin only)
```http
POST /api/users/:id/clear-fine
Authorization: Bearer {token}
```

---

### Notifications

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "message": "You have borrowed 'The Great Gatsby' for 7 days...",
    "type": "success",
    "read": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
POST /api/notifications/mark-all-read
Authorization: Bearer {token}
```

---

## 🔐 Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token is returned after successful login/registration. It contains:
- User ID
- Email
- Role (user/admin/manager)

**Token expiration:** 7 days (configurable in `.env`)

---

## 🔗 Frontend Integration

The frontend is located in the `../frontend/` directory and uses localStorage currently. To connect it to this backend:

1. **Update frontend API base URL** to `/api`
2. **Modify frontend hooks** to make HTTP calls instead of using localStorage
3. **Include JWT token** in all requests

The backend is fully compatible with the frontend's expected data structures.

---

## 📊 Business Logic

### Borrowing Rules
- User can borrow maximum **5 books** (per borrowing_limit)
- Cannot borrow if user has **unpaid fines**
- Cannot borrow if user has **overdue books**
- Cannot borrow same book twice (must return first)

### Fines
- **$0.50 per day** overdue (configurable in `config/constants.js`)
- Fine is automatically calculated when returning overdue book
- User cannot borrow if they have unpaid fines

### Pricing Tiers
Each book has 3 pricing options:
- 7 days (1 week)
- 14 days (2 weeks)
- 30 days (1 month)

### Notifications
Automatic notifications are created for:
- Successful book borrow
- Overdue fine charged
- Book reservation available

---

## 🧪 Testing Checklist

### 1. Authentication Flow
- [ ] Register new user → Returns token
- [ ] Login with correct credentials → Returns token
- [ ] Login with wrong password → 401 error
- [ ] Access protected route without token → 401 error
- [ ] Access protected route with expired token → 401 error

### 2. Books Management
- [ ] Get all books → Returns list
- [ ] Search books by title → Filters correctly
- [ ] Get single book → Returns book details
- [ ] Create book (admin only) → Creates successfully
- [ ] Update book (admin only) → Updates correctly
- [ ] Delete book (admin only) → Removes from DB
- [ ] Non-admin cannot create book → 403 error

### 3. Borrowing System
- [ ] Borrow available book → Success, copies decrease
- [ ] Try borrow with no copies available → Error
- [ ] Borrow same book twice → Error
- [ ] Return borrowed book → Success, copies increase
- [ ] Return overdue book → Calculates fine
- [ ] Try borrow with unpaid fine → Error
- [ ] Try borrow at limit → Error

### 4. User Management
- [ ] Get user profile → Returns own data
- [ ] Update profile → Updates correctly
- [ ] Admin can view all users → Lists all users
- [ ] Admin can change user role → Role updated
- [ ] Admin can clear fines → Fines set to 0
- [ ] User can pay partial fine → Fine reduced

### 5. Notifications
- [ ] Get notifications → Returns list
- [ ] Mark notification as read → Updates status
- [ ] Borrow book → Creates notification
- [ ] Return overdue book → Creates fine notification

### 6. Error Handling
- [ ] Missing required fields → 400 error
- [ ] Invalid data → 400 error
- [ ] Non-existent resource → 404 error
- [ ] Unauthorized access → 403 error
- [ ] Database error → 500 error with message

---

## 🐛 Common Issues

### Database Connection Failed
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database name is correct
- Check table structure matches schema

### Token Expired
- Frontend needs to refresh token
- Implement token refresh endpoint if needed
- Adjust `JWT_EXPIRES_IN` if too short

### CORS Errors
- Check `FRONTEND_URL` in `.env`
- Ensure frontend is running on correct port
- Backend CORS is configured for frontend URL

### Port Already in Use
- Change PORT in `.env` to different value
- Or kill process using port 5000

---

## 📝 Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── constants.js         # App constants (FINE_PER_DAY, roles, etc)
├── controllers/
│   ├── authController.js    # Auth endpoints
│   ├── bookController.js    # Book endpoints
│   ├── loanController.js    # Loan endpoints
│   ├── userController.js    # User endpoints
│   └── notificationController.js
├── services/
│   ├── authService.js       # Auth business logic
│   ├── bookService.js       # Book business logic
│   ├── loanService.js       # Loan business logic
│   ├── userService.js       # User business logic
│   └── notificationService.js
├── middlewares/
│   ├── auth.js              # JWT verification, role checks
│   └── errorHandler.js      # Global error handling
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── bookRoutes.js        # Book routes
│   ├── loanRoutes.js        # Loan routes
│   ├── userRoutes.js        # User routes
│   └── notificationRoutes.js
├── app.js                   # Express app setup
├── server.js                # Server entry point
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Use environment-specific database
- [ ] Enable HTTPS
- [ ] Set rate limiting
- [ ] Add request validation
- [ ] Enable logging
- [ ] Set up monitoring/alerting
- [ ] Regular database backups

---

## 📦 Dependencies

- **express** - Web framework
- **mysql2/promise** - MySQL database driver with promise support
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation and verification
- **dotenv** - Environment variables management
- **cors** - Cross-Origin Resource Sharing

---

## 📄 License

ISC

---

## 🤝 Support

For issues or questions, check:
1. Database credentials in `.env`
2. MySQL tables exist and have correct schema
3. Frontend is running on correct URL
4. Backend is running on correct PORT
5. Check error messages in server logs

---

**Backend is ready for frontend integration! 🎉**
