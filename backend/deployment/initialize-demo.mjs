import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

for (const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME']) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}
if (!process.env.DB_NAME.endsWith('_demo')) throw new Error('Use a dedicated database ending in _demo.');
const db = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  ssl: {rejectUnauthorized: true}
});
try {
  const [existing] = await db.execute('SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME]);
  if (Number(existing[0].count) !== 0) throw new Error('Database is not empty. No changes were made.');
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  for (const statement of schema.split(';').map(s => s.trim()).filter(Boolean)) await db.query(statement);
  await db.beginTransaction();
  const accounts = [];
  for (const role of ['admin','manager','user']) {
    const password = randomBytes(18).toString('base64url');
    const hash = await bcrypt.hash(password, 12);
    const email = `${role}@bookbuddy.example`;
    await db.execute('INSERT INTO users (name,email,password,role,borrowing_limit) VALUES (?,?,?,?,?)', [`Demo ${role}`, email, hash, role, 5]);
    accounts.push({role,email,password});
  }
  for (const [title,author,isbn,category] of [
    ['The Great Gatsby','F. Scott Fitzgerald','9780743273565','Fiction'],
    ['Pride and Prejudice','Jane Austen','9780141439518','Classic'],
    ['The Time Machine','H. G. Wells','9780141439976','Science Fiction']
  ]) await db.execute('INSERT INTO books (title,author,isbn,category,description,total_copies,available_copies,price) VALUES (?,?,?,?,?,?,?,?)',[title,author,isbn,category,'Synthetic portfolio demo catalog',5,5,1.5]);
  await db.commit();
  console.log('Demo database initialized with synthetic records. Store these generated passwords securely:');
  console.log(JSON.stringify(accounts,null,2));
} catch (error) {
  await db.rollback();
  throw error;
} finally { await db.end(); }
