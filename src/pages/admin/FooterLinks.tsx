import { useState, useEffect } from "react";
import { footerLinkService, FooterLink } from "@/services/footerLinkService";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const FooterLinksPage = () => {
    const [links, setLinks] = useState<FooterLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', url: '' });

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        setIsLoading(true);
        const allLinks = await footerLinkService.getAll();
        setLinks(allLinks);
        setIsLoading(false);
    };

    const handleOpenDialog = (link?: FooterLink) => {
        if (link) {
            setEditingId(link.id);
            setFormData({ title: link.title, url: link.url });
        } else {
            setEditingId(null);
            setFormData({ title: '', url: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ title: '', url: '' });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            alert("Title and URL are required.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await footerLinkService.update(editingId, formData);
            } else {
                await footerLinkService.create(formData);
            }
            await loadLinks();
            handleCloseDialog();
        } catch (error) {
            console.error("Failed to save link", error);
            alert("Failed to save link.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this link?")) {
            await footerLinkService.delete(id);
            await loadLinks();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Footer Links</h1>
                <Button className="bg-[#ff0046] hover:bg-[#d9003d]" onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Link
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#00141e]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                URL
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Created Date
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                </td>
                            </tr>
                        ) : links.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No text links found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            links.map((link) => (
                                <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{link.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                            {link.url}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(link.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenDialog(link)} className="text-indigo-600 hover:text-indigo-900 p-1">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:text-red-900 p-1">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Link' : 'Add New Link'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                            <input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff0046] disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="E.g. Partner Site"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="url" className="text-sm font-medium text-gray-700">URL</label>
                            <input
                                id="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff0046] disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-[#ff0046] hover:bg-[#d9003d]">
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FooterLinksPage;
