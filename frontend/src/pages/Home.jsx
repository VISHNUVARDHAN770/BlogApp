import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/posts', {
        params: { page, limit: 9 },
      });

      let postData = [];
      let pages = 1;

      if (Array.isArray(response.data)) {
        postData = response.data;
        pages = 1;
      } else if (response.data?.posts && Array.isArray(response.data.posts)) {
        postData = response.data.posts;
        pages = response.data.totalPages || response.data.pages || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        postData = response.data.data;
        pages = response.data.totalPages || response.data.pagination?.totalPages || 1;
      } else if (response.data?.docs && Array.isArray(response.data.docs)) {
        postData = response.data.docs;
        pages = response.data.totalPages || 1;
      }

      setPosts(postData);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      console.error('Error fetching posts:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load posts. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [fetchPosts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      toast.success('Post deleted successfully');
      if (posts.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="bg-black text-white rounded-2xl p-8 sm:p-12 shadow-md">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 text-gray-300 text-xs font-semibold rounded-full tracking-wider mb-4 border border-white/20">
            Blog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Insights, Stories & Ideas
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
            Explore thoughts from developers, tech enthusiasts, and creators around the globe. Share your own perspective today.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                to="/create"
                className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-gray-100 transition shadow-sm"
              >
                Write an Article
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-gray-100 transition shadow-sm"
              >
                Join the Community
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <span>Latest Articles</span>
            {posts.length > 0 && !loading && (
              <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            )}
          </h2>

          {user && (
            <Link
              to="/create"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-black hover:underline"
            >
              + Create Post
            </Link>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Fetching articles...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 bg-gray-50 border border-gray-300 rounded-xl text-center space-y-3 max-w-lg mx-auto">
            <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center mx-auto">
              <span className="text-black font-bold text-lg">!</span>
            </div>
            <h3 className="text-black font-bold text-lg">Unable to load posts</h3>
            <p className="text-gray-600 text-sm">{error}</p>
            <button
              onClick={() => fetchPosts(currentPage)}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="py-16 px-4 bg-white border border-dashed border-gray-300 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black">No posts yet</h3>
            <p className="text-gray-500 text-sm">
              Be the first to share an interesting idea or story with everyone!
            </p>
            {user ? (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition"
              >
                Create Your First Post
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition"
              >
                Sign in to create a post
              </Link>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>

            {/* Pagination */}
            {(totalPages > 1 || currentPage > 1) && (
              <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <span className="text-sm font-medium text-gray-600">
                  Page <span className="font-bold text-black">{currentPage}</span> of{' '}
                  <span className="font-bold text-black">{totalPages}</span>
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition flex items-center gap-1"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
