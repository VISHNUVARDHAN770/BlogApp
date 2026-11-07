const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogdb_test';

let ownerToken = '';
let otherToken = '';
let createdPostId = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});

  // Register owner user
  const ownerRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'postowner',
      email: 'postowner@example.com',
      password: 'password123'
    });
  ownerToken = ownerRes.body.token || (ownerRes.body.data && ownerRes.body.data.token);

  // Register another user (for not-owner tests)
  const otherRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'otheruser',
      email: 'otheruser@example.com',
      password: 'password123'
    });
  otherToken = otherRes.body.token || (otherRes.body.data && otherRes.body.data.token);
}, 30000);

afterAll(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
}, 30000);

describe('Posts API Endpoints', () => {
  it('GET /api/posts → 200, returns array', async () => {
    const res = await request(app).get('/api/posts');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const posts = res.body.posts || (res.body.data && res.body.data.posts);
    expect(Array.isArray(posts)).toBe(true);
  });

  it('POST /api/posts → 201 (with token)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Initial Test Post Title',
        content: 'This is the initial test post content.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    const post = res.body.post || (res.body.data && (res.body.data.post || res.body.data));
    expect(post).toBeDefined();
    createdPostId = post._id || post.id;
    expect(createdPostId).toBeDefined();
  });

  it('POST /api/posts → 401 (no token)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({
        title: 'Unauthorized Post',
        content: 'Should not be allowed without token'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/posts → 422 (missing title)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        content: 'Post with content but no title'
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/posts/:id → 200 (valid id)', async () => {
    const res = await request(app).get(`/api/posts/${createdPostId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const post = res.body.post || (res.body.data && (res.body.data.post || res.body.data));
    expect(post).toBeDefined();
    expect((post._id || post.id).toString()).toBe(createdPostId.toString());
  });

  it('GET /api/posts/:id → 404 (invalid id)', async () => {
    const res = await request(app).get('/api/posts/507f1f77bcf86cd799439011');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/posts/:id → 403 (not owner)', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        title: 'Attempted Update by Non-owner'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/posts/:id → 200 (owner)', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Updated Post Title by Owner',
        content: 'Updated content by owner'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const post = res.body.post || (res.body.data && (res.body.data.post || res.body.data));
    expect(post.title).toBe('Updated Post Title by Owner');
  });

  it('DELETE /api/posts/:id → 403 (not owner)', async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/posts/:id → 200 (owner)', async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
