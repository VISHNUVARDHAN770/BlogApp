const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogdb_test';

let userToken = '';
let postId = '';
let createdCommentId = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});

  // Register user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'commenter',
      email: 'commenter@example.com',
      password: 'password123'
    });
  userToken = userRes.body.token || (userRes.body.data && userRes.body.data.token);

  // Create post
  const postRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Post For Comment Testing',
      content: 'This post is used to test comments.'
    });
  const post = postRes.body.post || (postRes.body.data && (postRes.body.data.post || postRes.body.data));
  postId = post._id || post.id;
}, 30000);

afterAll(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
}, 30000);

describe('Comments API Endpoints', () => {
  it('GET /api/comments?post_id=xxx → 200', async () => {
    const res = await request(app).get(`/api/comments?post_id=${postId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const comments = res.body.comments || (res.body.data && (res.body.data.comments || res.body.data));
    expect(Array.isArray(comments)).toBe(true);
  });

  it('POST /api/comments → 201 (with token)', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        post_id: postId,
        content: 'This is a test comment.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    const comment = res.body.comment || (res.body.data && (res.body.data.comment || res.body.data));
    expect(comment).toBeDefined();
    expect(comment.content).toBe('This is a test comment.');
    createdCommentId = comment._id || comment.id;
    expect(createdCommentId).toBeDefined();
  });

  it('POST /api/comments → 401 (no token)', async () => {
    const res = await request(app)
      .post('/api/comments')
      .send({
        post_id: postId,
        content: 'Unauthorized comment attempt'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/comments/:id → 200', async () => {
    const res = await request(app).get(`/api/comments/${createdCommentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const comment = res.body.comment || (res.body.data && (res.body.data.comment || res.body.data));
    expect(comment).toBeDefined();
    expect((comment._id || comment.id).toString()).toBe(createdCommentId.toString());
  });

  it('GET /api/comments/:id → 404', async () => {
    const res = await request(app).get('/api/comments/507f1f77bcf86cd799439011');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/comments/:id → 200 (owner)', async () => {
    const res = await request(app)
      .put(`/api/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'This is an updated comment.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const comment = res.body.comment || (res.body.data && (res.body.data.comment || res.body.data));
    expect(comment.content).toBe('This is an updated comment.');
  });

  it('DELETE /api/comments/:id → 200 (owner)', async () => {
    const res = await request(app)
      .delete(`/api/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
