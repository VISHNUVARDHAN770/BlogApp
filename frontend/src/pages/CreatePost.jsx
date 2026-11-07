import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreatePost = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;
    const fetchExistingPost = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/posts/${id}`);
        const post = response.data?.post || response.data?.data || response.data;
        if (isMounted && post) {
          setFormData({
            title: post.title || '',
            content: post.content || '',
          });

          // Verify ownership if possible
          const authorId =
            (post.author && typeof post.author === 'object' ? post.author._id || post.author.id : post.author) ||
            (post.user && typeof post.user === 'object' ? post.user._id || post.user.id : post.user) ||
            post.userId;
          const currentUserId = user?._id || user?.id;

          if (user && authorId && currentUserId && String(authorId) !== String(currentUserId)) {
            toast.error('You are not authorized to edit this post');
            navigate(`/posts/${id}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch post for editing:', err);
        toast.error('Could not load existing post data');
        navigate('/');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExistingPost();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, navigate, user]);

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim()) {
      errors.content = 'Post content cannot be empty';
    } else if (formData.content.trim().length < 15) {
      errors.content = 'Post content must be at least 15 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/posts/${id}`, {
          title: formData.title.trim(),
          content: formData.content.trim(),
        });
        toast.success('Post updated successfully!');
        navigate(`/posts/${id}`);
      } else {
        const response = await api.post('/posts', {
          title: formData.title.trim(),
          content: formData.content.trim(),
        });
        toast.success('Post published successfully!');

        const createdPost = response.data?.post || response.data?.data || response.data;
        const newId = createdPost?._id || createdPost?.id;

        if (newId) {
          navigate(`/posts/${newId}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Failed to save post:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save article. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading post content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            {isEditMode ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode
              ? 'Update your post content and publish changes.'
              : 'Write and publish your article to share with the community.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-gray-700 hover:text-black px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Article Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Getting Started with Modern Fullstack Web Development"
            disabled={submitting}
            className={`w-full px-4 py-3 text-base sm:text-lg font-semibold rounded-lg border ${
              formErrors.title ? 'border-gray-500' : 'border-gray-300'
            } focus:outline-none focus:border-black transition`}
          />
          {formErrors.title && (
            <p className="mt-1.5 text-xs text-gray-700 font-medium">{formErrors.title}</p>
          )}
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Content Body
          </label>
          <textarea
            id="content"
            name="content"
            rows="14"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your article thoughts here... Markdown or plain text supported."
            disabled={submitting}
            className={`w-full px-4 py-3 text-sm sm:text-base leading-relaxed rounded-lg border ${
              formErrors.content ? 'border-gray-500' : 'border-gray-300'
            } focus:outline-none focus:border-black transition resize-y font-normal`}
          />
          <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
            <span>{formErrors.content ? <span className="text-gray-700 font-medium">{formErrors.content}</span> : 'Markdown styling and line breaks supported'}</span>
            <span>{formData.content.length} characters</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={isEditMode ? `/posts/${id}` : '/'}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-black hover:bg-gray-800 text-white font-semibold text-sm transition disabled:opacity-60 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                {isEditMode ? 'Saving Changes...' : 'Publishing...'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Publish Article'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
