const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogdb_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  await User.deleteMany({});
}, 30000);

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
}, 30000);

describe('Auth API Endpoints', () => {
  const testUser = {
    username: 'testauthuser',
    email: 'testauth@example.com',
    password: 'password123'
  };

  let authToken = '';

  describe('POST /api/auth/register', () => {
    it('POST /api/auth/register → success (201)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      const token = res.body.token || (res.body.data && res.body.data.token);
      expect(token).toBeDefined();
      const user = res.body.user || (res.body.data && res.body.data.user);
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.password).toBeUndefined();
    });

    it('POST /api/auth/register → duplicate email (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: testUser.email,
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email already exists/i);
    });

    it('POST /api/auth/register → missing fields (422)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'missingpassword@example.com'
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('POST /api/auth/login → success (200, has token)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const token = res.body.token || (res.body.data && res.body.data.token);
      expect(token).toBeDefined();
      authToken = token;
    });

    it('POST /api/auth/login → wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login → user not found (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistentuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('GET /api/auth/me → success with token (200)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const user = res.body.user || (res.body.data && (res.body.data.user || res.body.data));
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('GET /api/auth/me → no token (401)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
