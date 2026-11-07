import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New comment state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Fetch post details
  const fetchPost = useCallback(async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      const postData = response.data?.post || response.data?.data || response.data;
      setPost(postData);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      const msg = err.response?.data?.message || err.message || 'Article could not be loaded.';
      setError(msg);
      toast.error(msg);
    }
  }, [id]);

  // Fetch comments for post
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const response = await api.get(`/comments?post_id=${id}`);
      let commentList = [];
      if (Array.isArray(response.data)) {
        commentList = response.data;
      } else if (response.data?.comments && Array.isArray(response.data.comments)) {
        commentList = response.data.comments;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        commentList = response.data.data;
      }
      setComments(commentList);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      // Non-fatal, keep comments empty
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchPost, fetchComments]);

  // Check if current user is the author
  const postAuthorId =
    (post?.author && typeof post.author === 'object' ? post.author._id || post.author.id : post?.author) ||
    (post?.user && typeof post.user === 'object' ? post.user._id || post.user.id : post?.user) ||
    post?.userId;

  const currentUserId = user?._id || user?.id;
  const isAuthor =
    Boolean(user) &&
    ((currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId)) ||
      (user?.username && post?.author?.username && user.username === post.author.username));

  // Author name
  const authorName =
    post?.author?.username ||
    post?.author_name ||
    post?.authorName ||
    post?.user?.username ||
    (typeof post?.author === 'string' && post.author.length < 24 ? post.author : 'Anonymous');

  // Date formatting
  const formattedDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : post?.date
    ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) {
      return;
    }
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  // Submit comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Comment text cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post('/comments', {
        post_id: id,
        postId: id,
        content: newComment.trim(),
      });
      toast.success('Comment added!');
      setNewComment('');
      // Refresh comments
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading article details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-full mx-auto flex items-center justify-center text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-black">Post Not Found</h2>
        <p className="text-gray-600 text-sm">{error || 'The requested article does not exist or has been removed.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all articles
        </Link>
      </div>

      {/* Main Post Article */}
      <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* Post Meta */}
        <header className="space-y-4 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase">
                {authorName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-black text-sm">{authorName}</p>
                <time className="text-xs text-gray-500" dateTime={post.createdAt || ''}>
                  {formattedDate}
                </time>
              </div>
            </div>

            {/* Author Controls */}
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${id}`}
                  className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Post
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Post
                </button>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
            {post.title}
          </h1>
        </header>

        {/* Post Content */}
        <div className="max-w-none text-gray-800 leading-relaxed text-base sm:text-lg whitespace-pre-wrap font-normal">
          {post.content}
        </div>
      </article>

      {/* Comments Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span>Comments</span>
            <span className="text-xs font-semibold bg-gray-100 text-black px-2.5 py-0.5 rounded-full border border-gray-200">
              {comments.length}
            </span>
          </h2>
        </div>

        {/* Add Comment Form or Login Notice */}
        {user ? (
          <form onSubmit={handleAddComment} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
            <label htmlFor="newComment" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Leave a Comment
            </label>
            <textarea
              id="newComment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              placeholder="What are your thoughts on this article?"
              disabled={submittingComment}
              className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-black resize-none transition"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-600">
            Please{' '}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>{' '}
            or{' '}
            <Link to="/register" className="font-semibold text-black hover:underline">
              Create an account
            </Link>{' '}
            to join the conversation and leave a comment.
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center bg-white border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 text-sm">No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id || comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetail;
