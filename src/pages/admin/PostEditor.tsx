
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blogService, BlogPost } from "@/services/blogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const PostEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        category: "General",
        published: false,
        author: "Admin"
    });

    useEffect(() => {
        const loadPost = async () => {
            if (isEditing && id) {
                const post = await blogService.getById(id);
                if (post) {
                    setFormData(post);
                } else {
                    navigate("/admin");
                }
                setIsLoading(false);
            }
        };
        loadPost();
    }, [id, isEditing, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, published: checked }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url, error } = await blogService.uploadImage(file);
            if (url) {
                setFormData(prev => ({ ...prev, image: url }));
            } else {
                alert(`Upload failed: ${error || 'Please check your Supabase Storage configuration.'}`);
            }
        } catch (error) {
            console.error("Image upload failed", error);
            alert("An error occurred during image upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isEditing && id) {
                await blogService.update(id, formData);
            } else {
                await blogService.create(formData as BlogPost);
            }
            navigate("/admin");
        } catch (error) {
            console.error("Failed to save post", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate("/admin")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? "Edit Post" : "New Post"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Post title"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Featured Image</Label>
                        <div className="flex gap-2">
                            <Input
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1"
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="whitespace-nowrap"
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    Upload
                                </Button>
                            </div>
                        </div>
                        {formData.image && (
                            <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 border group">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="News, Match Report, etc."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            placeholder="Short summary for the card view..."
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content">Content (Markdown supported)</Label>
                        <Textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your post content here..."
                            className="min-h-[300px] font-mono"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <Switch
                            id="published"
                            checked={formData.published}
                            onCheckedChange={handleSwitchChange}
                        />
                        <Label htmlFor="published" className="cursor-pointer">
                            {formData.published ? "Published (Visible to public)" : "Draft (Hidden)"}
                        </Label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#ff0046] hover:bg-[#d9003d]" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Post
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
