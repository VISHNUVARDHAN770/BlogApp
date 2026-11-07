const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve comments (optionally filtered by post_id)
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: post_id
 *         schema:
 *           type: string
 *         description: ID of the post to get comments for
 *     responses:
 *       200:
 *         description: Array of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
router.get('/', async (req, res) => {
  try {
    const postId = req.query.post_id || req.query.postId;
    const filter = {};

    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(200).json({
          success: true,
          data: [],
          comments: []
        });
      }
      filter.post = postId;
    }

    const comments = await Comment.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: comments,
      comments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a single comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = await Comment.findById(id).populate('author', 'username');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
      comment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment on a post
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
 *               post_id:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  authMiddleware,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 1000 })
      .withMessage('Content cannot exceed 1000 characters'),
    body(['post_id', 'postId'])
      .custom((value, { req }) => {
        if (!req.body.post_id && !req.body.postId) {
          throw new Error('post_id is required');
        }
        return true;
      })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const postId = req.body.post_id || req.body.postId;
      const { content } = req.body;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const comment = new Comment({
        post: post._id,
        content,
        author: req.user.id
      });

      await comment.save();
      await comment.populate('author', 'username');

      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment,
        comment
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden - not comment owner
 *       404:
 *         description: Comment not found
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
    if (authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this comment'
      });
    }

    if (req.body.content !== undefined) {
      comment.content = req.body.content;
    }

    await comment.save();
    await comment.populate('author', 'username');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
      comment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - not comment owner
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
    if (authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;
