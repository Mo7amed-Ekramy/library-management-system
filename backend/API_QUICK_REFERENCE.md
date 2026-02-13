# 📡 API Endpoints Quick Reference

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "user": { User },
  "token": "JWT_TOKEN"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "user": { User },
  "token": "JWT_TOKEN"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ User }
```

---

## 📚 Book Endpoints

### List All Books
```http
GET /api/books
Authorization: Bearer JWT_TOKEN

Optional query: ?search=title

Response: 200 OK
[ Book, Book, ... ]
```

### Get Single Book
```http
GET /api/books/1
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ Book }
```

### Create Book (Admin Only)
```http
POST /api/books
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-1234567890",
  "totalCopies": 5,
  "category": "Fiction",
  "description": "Book description",
  "pricing": [
    { "days": 7, "price": 2.5, "label": "1 Week" },
    { "days": 14, "price": 4.0, "label": "2 Weeks" },
    { "days": 30, "price": 5.5, "label": "1 Month" }
  ]
}

Response: 201 Created
{ Book }
```

### Update Book (Admin Only)
```http
PUT /api/books/1
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{ /* partial or full book object */ }

Response: 200 OK
{ Book }
```

### Delete Book (Admin Only)
```http
DELETE /api/books/1
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ "success": true }
```

---

## 🏦 Loan Endpoints

### Borrow Book
```http
POST /api/loans/borrow
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "bookId": 1,
  "periodDays": 7,
  "cost": 2.5
}

Response: 201 Created
{
  "success": true,
  "loanId": 5
}

Errors:
- "You have unpaid fines"
- "You have overdue books"
- "You have reached your borrowing limit"
- "No copies available"
- "You already have this book borrowed"
```

### Return Book
```http
POST /api/loans/return
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "loanId": 5
}

Response: 200 OK
{
  "success": true,
  "fine": 0  /* or amount if overdue */
}
```

### Get My Loans
```http
GET /api/loans/my
Authorization: Bearer JWT_TOKEN

Response: 200 OK
[ Loan, Loan, ... ]
```

### Get All Loans (Manager/Admin Only)
```http
GET /api/loans
Authorization: Bearer JWT_TOKEN

Optional query: ?status=Borrowed&userId=1

Response: 200 OK
[ Loan, Loan, ... ]
```

---

## 👤 User Endpoints

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ User }
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}

Response: 200 OK
{ User }
```

### Pay Fine
```http
POST /api/users/pay-fine
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "amount": 5.0
}

Response: 200 OK
{ User }
```

### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer JWT_TOKEN

Optional query: ?role=user&search=john

Response: 200 OK
[ User, User, ... ]
```

### Update User Role (Admin Only)
```http
PUT /api/users/1/role
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "role": "manager"  /* or "admin" or "user" */
}

Response: 200 OK
{ User }
```

### Clear User Fines (Admin Only)
```http
POST /api/users/1/clear-fine
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ User }
```

---

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer JWT_TOKEN

Response: 200 OK
[ Notification, Notification, ... ]
```

### Mark Notification as Read
```http
PUT /api/notifications/1/read
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ Notification }
```

### Mark All Notifications as Read
```http
POST /api/notifications/mark-all-read
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{ "success": true }
```

---

## 📊 Data Models

### User
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

### Book
```json
{
  "id": "1",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "totalCopies": 5,
  "copiesAvailable": 3,
  "category": "Fiction",
  "description": "Classic American novel",
  "pricing": [
    { "days": 7, "price": 2.5, "label": "1 Week" },
    { "days": 14, "price": 4.0, "label": "2 Weeks" },
    { "days": 30, "price": 5.5, "label": "1 Month" }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Loan
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

### Notification
```json
{
  "id": "1",
  "userId": "1",
  "message": "You have borrowed 'The Great Gatsby' for 7 days...",
  "type": "success",
  "read": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔗 HTTP Status Codes

| Code | Meaning | Common Reasons |
|------|---------|----------------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing fields, validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database/server error |

---

## 🔑 Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login or register response.
Token expires in 7 days.

---

## ❌ Error Response Format

```json
{
  "error": "Error description explaining what went wrong"
}
```

Example:
```json
{
  "error": "You have unpaid fines. Please pay your fines first."
}
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Get Books (replace TOKEN with actual token)
```bash
curl http://localhost:5000/api/books \
  -H "Authorization: Bearer TOKEN"
```

### Borrow Book
```bash
curl -X POST http://localhost:5000/api/loans/borrow \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId":1,"periodDays":7,"cost":2.5}'
```

---

## 📋 Common Workflows

### User Registration & Borrow Book
1. `POST /api/auth/register` → Get token
2. `GET /api/books` → Browse books
3. `POST /api/loans/borrow` → Borrow a book
4. `GET /api/loans/my` → Check my loans
5. `POST /api/loans/return` → Return book

### Admin Management
1. `POST /api/auth/login` (as admin) → Get token
2. `GET /api/users` → List all users
3. `PUT /api/users/:id/role` → Change role
4. `POST /api/books` → Add new book
5. `GET /api/loans` → View all loans

### Fine Payment
1. `GET /api/users/profile` → Check fines
2. `POST /api/users/pay-fine` → Pay fines
3. `POST /api/loans/borrow` → Can now borrow

---

**All endpoints are ready to use! Start with QUICK_START.md for setup. 🚀**
