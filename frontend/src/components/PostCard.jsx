import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();

  if (!post) return null;

  const postId = post._id || post.id;

  const authorName =
    post.author?.username ||
    post.author_name ||
    post.authorName ||
    post.user?.username ||
    (typeof post.author === 'string' && post.author.length < 24 ? post.author : 'Anonymous');

  const postAuthorId =
    (post.author && typeof post.author === 'object' ? post.author._id || post.author.id : post.author) ||
    (post.user && typeof post.user === 'object' ? post.user._id || post.user.id : post.user) ||
    post.userId;

  const currentUserId = user?._id || user?.id;
  const isAuthor =
    Boolean(user) &&
    ((currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId)) ||
      (user?.username && post.author?.username && user.username === post.author.username));

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : post.date
    ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  const contentPreview =
    post.content && post.content.length > 150
      ? `${post.content.substring(0, 150)}...`
      : post.content || '';

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (onDelete) {
        onDelete(postId);
      }
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 hover:border-black shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-6">
        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {authorName.charAt(0)}
            </div>
            <span className="font-medium text-gray-700">{authorName}</span>
          </div>
          <time dateTime={post.createdAt || ''}>{formattedDate}</time>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-black group-hover:text-gray-700 transition-colors line-clamp-2 mb-2">
          <Link to={`/posts/${postId}`} className="hover:underline focus:outline-none">
            {post.title}
          </Link>
        </h2>

        {/* Snippet */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {contentPreview}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/posts/${postId}`}
          className="text-xs font-semibold text-black hover:text-gray-600 transition flex items-center gap-1"
        >
          Read full post
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link
              to={`/edit/${postId}`}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition flex items-center gap-1"
              title="Edit post"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition flex items-center gap-1"
              title="Delete post"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
