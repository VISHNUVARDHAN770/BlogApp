import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CommentCard = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment?.content || '');
  const [editedContent, setEditedContent] = useState(comment?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!comment) return null;

  const commentId = comment._id || comment.id;

  // Author details
  const authorName =
    comment.author?.username ||
    comment.author_name ||
    comment.authorName ||
    comment.user?.username ||
    comment.username ||
    (typeof comment.author === 'string' && comment.author.length < 24 ? comment.author : 'Anonymous');

  // Check author ownership
  const commentAuthorId =
    (comment.author && typeof comment.author === 'object' ? comment.author._id || comment.author.id : comment.author) ||
    (comment.user && typeof comment.user === 'object' ? comment.user._id || comment.user.id : comment.user) ||
    comment.userId;

  const currentUserId = user?._id || user?.id;
  const isAuthor =
    Boolean(user) &&
    ((currentUserId && commentAuthorId && String(currentUserId) === String(commentAuthorId)) ||
      (user?.username && comment.author?.username && user.username === comment.author.username) ||
      (user?.username && comment.username && user.username === comment.username));

  // Date formatting
  const formattedDate = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : comment.date
    ? new Date(comment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  const handleStartEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editedContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put(`/comments/${commentId}`, {
        content: editedContent.trim(),
      });
      const updatedText = res.data?.comment?.content || res.data?.content || editedContent.trim();
      setContent(updatedText);
      setIsEditing(false);
      toast.success('Comment updated successfully');
    } catch (err) {
      console.error('Failed to update comment:', err);
      toast.error(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      if (onDelete) {
        onDelete(commentId);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-gray-300 transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
            {authorName.charAt(0)}
          </div>
          <span className="font-semibold text-sm text-black">{authorName}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>

        {/* Action buttons */}
        {isAuthor && !isEditing && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleStartEdit}
              className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
              title="Edit comment"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
              title="Delete comment"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content or inline edit form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows="3"
            className="w-full text-sm border border-gray-300 rounded-md p-2.5 focus:outline-none focus:border-black resize-none"
            placeholder="Edit your comment..."
            required
            disabled={isSaving}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-black hover:bg-gray-800 disabled:opacity-50 rounded-md transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      )}
    </div>
  );
};

export default CommentCard;
