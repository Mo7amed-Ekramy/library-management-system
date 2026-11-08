import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { AuthService } from '../services/authService.js';

process.env.JWT_SECRET = 'isolated-test-key-not-used-in-deployments';
const originalGetConnection = pool.getConnection;
const auth = new AuthService();
let account;
pool.getConnection = async () => ({
  execute: async (sql, params) => {
    if (sql.includes('INSERT INTO users')) {
      account = {id: 1, email: params[0], password: params[1], name: params[2], role: params[3], borrowing_limit: params[4], created_at: new Date()};
      return [{insertId: 1}];
    }
    if (sql.includes('SELECT id FROM users')) return [[]];
    return [[account]];
  },
  release() {}
});
after(async () => { pool.getConnection = originalGetConnection; await pool.end(); });

test('registration stores a bcrypt hash and correct credentials can log in', async () => {
  await auth.register('demo@example.test', 'test-password-123', 'Demo');
  assert.notEqual(account.password, 'test-password-123');
  assert.ok(await bcrypt.compare('test-password-123', account.password));
  const result = await auth.login('demo@example.test', 'test-password-123');
  assert.ok(result.token);
  assert.equal(result.user.email, 'demo@example.test');
  assert.equal(result.user.password, undefined);
});
test('wrong passwords and legacy plaintext records are rejected', async () => {
  await assert.rejects(auth.login('demo@example.test', 'wrong-password'), /Invalid email or password/);
  account.password = 'test-password-123';
  await assert.rejects(auth.login('demo@example.test', 'test-password-123'), /Invalid email or password/);
});
