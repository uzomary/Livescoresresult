
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogService, BlogPost } from "@/services/blogService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { format } from "date-fns";
import MetaTags from "@/components/MetaTags";
import Markdown from "react-markdown";

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPostAndRelated = async () => {
            if (slug) {
                const foundPost = await blogService.getBySlug(slug);
                setPost(foundPost);

                // Load related posts
                const allPosts = await blogService.getPublished();
                const filtered = allPosts
                    .filter(p => p.slug !== slug)
                    .slice(0, 3);
                setRelatedPosts(filtered);

                setLoading(false);
            }
        };
        loadPostAndRelated();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-foreground">Loading article...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Article not found</h1>
                <p className="text-gray-500 dark:text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
                <Button onClick={() => navigate("/news")}>Back to News</Button>
            </div>
        );
    }

    // Sanitize and parse markdown content
    // Note: For production, use a sanitizer like dompurify with marked
    // const htmlContent = marked.parse(post.content);

    return (
        <div className="min-h-screen bg-white dark:bg-background pb-20">
            <MetaTags
                title={post.title}
                description={post.excerpt}
                image={post.image}
            />

            {/* Hero Image */}
            {post.image && (
                <div className="w-full h-[300px] md:h-[400px] relative">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
                <Button
                    variant="secondary"
                    size="sm"
                    className="mb-6 shadow-sm bg-white dark:bg-card hover:bg-gray-100 dark:hover:bg-accent text-gray-900 dark:text-foreground border-none"
                    onClick={() => navigate("/news")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to News
                </Button>

                <article className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 md:p-10 mb-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mb-6">
                        <span className="flex items-center text-[#ff0046] font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                            <Tag className="w-3 h-3 mr-1" />
                            {post.category}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {post.author}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-foreground prose-p:text-gray-600 dark:prose-p:text-muted-foreground prose-a:text-[#ff0046] prose-img:rounded-lg">
                        <Markdown>{post.content}</Markdown>
                    </div>
                </article>

                {/* Other News Section */}
                {relatedPosts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-6">Other News</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((otherPost) => (
                                <div
                                    key={otherPost.id}
                                    className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border overflow-hidden cursor-pointer group hover:shadow-md transition-all"
                                    onClick={() => {
                                        navigate(`/news/${otherPost.slug}`);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    {otherPost.image && (
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={otherPost.image}
                                                alt={otherPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="text-[10px] font-bold text-[#ff0046] uppercase mb-2">
                                            {otherPost.category}
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-foreground line-clamp-2 leading-tight group-hover:text-[#ff0046] transition-colors">
                                            {otherPost.title}
                                        </h3>
                                        <div className="mt-4 flex items-center text-xs text-gray-400 dark:text-muted-foreground font-medium">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(otherPost.createdAt), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};
