
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService, BlogPost } from '@/services/blogService';
import { Loader2, Newspaper, Calendar, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const NewsPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            const publishedPosts = await blogService.getPublished();
            setPosts(publishedPosts);
            setIsLoading(false);
        };
        loadPosts();
    }, []);

    return (
        <div className="min-h-screen pb-20">
            {/* Page Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#00141e] rounded-lg flex items-center justify-center">
                        <Newspaper className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-[#00141e]">Football News</h1>
                </div>
                <p className="text-gray-500 text-lg ml-14">
                    Latest updates, match reports, and analysis from our team.
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-[#00141e] animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading latest headlines...</p>
                </div>
            )}

            {/* News Grid */}
            {!isLoading && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/news/${post.slug}`}
                            className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all h-full"
                        >
                            {/* Image */}
                            <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Newspaper className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-[#ff0046] text-white text-xs font-bold px-2 py-1 rounded">
                                    {post.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                    <span className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        {post.author}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-[#00141e] mb-3 group-hover:text-[#ff0046] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center text-[#ff0046] font-bold text-sm mt-auto group-hover:translate-x-1 transition-transform">
                                    Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No News Yet</h3>
                    <p className="text-gray-500">Check back later for the latest updates.</p>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
