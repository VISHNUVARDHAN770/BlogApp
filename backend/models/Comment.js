const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [1000, 'Content cannot exceed 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Virtual 'id' field
commentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Configure toJSON with virtuals and clean up internal fields
commentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

commentSchema.set('toObject', {
  virtuals: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
