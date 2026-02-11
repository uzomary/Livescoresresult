
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogService, BlogPost } from "@/services/blogService";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash2, Globe, Plus, Database, Loader2 } from "lucide-react";

export const AdminDashboard = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        const allPosts = await blogService.getAll();
        setPosts(allPosts);
        setIsLoading(false);
    };

    const [isMigrating, setIsMigrating] = useState(false);

    const handleMigrate = async () => {
        const stored = localStorage.getItem('livescore_blog_posts');
        if (!stored) {
            alert("No data found in LocalStorage to migrate.");
            return;
        }

        const localPosts = JSON.parse(stored);
        if (localPosts.length === 0) {
            alert("No posts found in LocalStorage.");
            return;
        }

        if (window.confirm(`Found ${localPosts.length} posts in LocalStorage. Do you want to migrate them to Supabase? (Duplicates will be created if they already exist)`)) {
            setIsMigrating(true);
            try {
                for (const post of localPosts) {
                    await blogService.create({
                        title: post.title,
                        excerpt: post.excerpt,
                        content: post.content,
                        image: post.image,
                        category: post.category,
                        author: post.author,
                        published: post.published
                    });
                }
                alert("Migration successful!");
                // Optionally clear localStorage
                // localStorage.removeItem('livescore_blog_posts');
                await loadPosts();
            } catch (error) {
                console.error("Migration failed:", error);
                alert("Migration failed. See console for details.");
            } finally {
                setIsMigrating(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await blogService.delete(id);
            await loadPosts();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleMigrate}
                        disabled={isMigrating}
                        className="border-[#00141e] text-[#00141e] hover:bg-gray-100"
                    >
                        {isMigrating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Database className="w-4 h-4 mr-2" />
                        )}
                        Migrate from Local
                    </Button>
                    <Link to="/admin/posts/new">
                        <Button className="bg-[#ff0046] hover:bg-[#d9003d]">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#00141e]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No posts found. Create your first one!</td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {post.image && (
                                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={post.image} alt="" />
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{post.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/admin/posts/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900 p-1">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            {post.published && (
                                                <Link to={`/news/${post.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700 p-1">
                                                    <Globe className="w-4 h-4" />
                                                </Link>
                                            )}
                                            <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
