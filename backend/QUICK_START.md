# 🚀 Quick Start Guide

Get the Book Buddy backend running in 5 minutes!

## Prerequisites
- Node.js installed
- MySQL running with `book_buddy` database
- Git (optional)

## Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

## Step 2: Configure Database (2 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=book_buddy
   ```

3. Verify MySQL tables exist (see README.md for schema)

## Step 3: Start Backend (1 min)

```bash
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on http://localhost:5000
📚 API Base URL: http://localhost:5000/api
```

## Step 4: Test Backend (1 min)

Open a new terminal and test health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

## Step 5: Test Authentication

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "user": { "id": 1, "email": "test@example.com", ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🎉 You're Done!

Backend is now running and ready for frontend integration.

See:
- **README.md** - Full API documentation
- **INTEGRATION_GUIDE.md** - How to connect frontend
- **VALIDATION_CHECKLIST.md** - Compatibility check

## 🔧 Development Mode

For auto-reload on file changes:
```bash
npm run dev
```

## 📊 Useful Commands

Check if port is in use:
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

View database:
```bash
mysql -u root -p book_buddy
SHOW TABLES;
SELECT * FROM users;
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check `.env` credentials |
| Port 5000 already in use | Kill process or use different port |
| Tables don't exist | Run table creation SQL (see README.md) |
| CORS error | Check FRONTEND_URL in `.env` |

## 📝 Next Steps

1. ✅ Backend running
2. ⬜ Update frontend to use API (see INTEGRATION_GUIDE.md)
3. ⬜ Test end-to-end flow
4. ⬜ Deploy to production

---

Need more details? Check the full README.md!
