import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { leaguePriorityService, LeaguePriority } from "@/services/leaguePriorityService";
import { Trash2, Save, GripVertical, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const LeaguePriorityPage = () => {
    const [priorities, setPriorities] = useState<LeaguePriority[]>([]);
    const [availableLeagues, setAvailableLeagues] = useState<{ name: string, country: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Drag and drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [prioritiesData, leaguesData] = await Promise.all([
            leaguePriorityService.getList(),
            leaguePriorityService.getAvailableLeagues()
        ]);

        // Sort priorities by priority value
        setPriorities(prioritiesData.sort((a, b) => a.priority - b.priority));
        setAvailableLeagues(leaguesData);
        setIsLoading(false);
    };

    // Filter available leagues based on search and exclusion of already pinned leagues
    const filteredAvailableLeagues = availableLeagues
        .filter(l =>
            !priorities.some(p => p.league_name === l.name) &&
            (l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.country.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 50); // Limit to 50 results for performance

    const handleAddLeague = async (leagueName: string) => {
        setIsLoading(true);
        // Add to the end of the list with next priority
        const nextPriority = priorities.length > 0
            ? Math.max(...priorities.map(p => p.priority)) + 1
            : 1;

        const result = await leaguePriorityService.upsert(leagueName, nextPriority);

        if (result) {
            toast({
                title: "Added",
                description: `${leagueName} added to priority list`,
            });
            // Update local state instead of full reload for smoother UX
            setPriorities(prev => [...prev, result].sort((a, b) => a.priority - b.priority));
        } else {
            toast({
                title: "Error",
                description: "Failed to add league",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleRemoveLeague = async (id: string, name: string) => {
        if (!confirm(`Remove ${name} from priority list?`)) return;

        setIsLoading(true);
        const success = await leaguePriorityService.delete(id);

        if (success) {
            toast({
                title: "Removed",
                description: "League removed from priority list",
            });
            setPriorities(prev => prev.filter(p => p.id !== id));
        } else {
            toast({
                title: "Error",
                description: "Failed to remove league",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleSort = () => {
        // Duplicate items
        let _priorities = [...priorities];

        // Remove and save the dragged item content
        if (dragItem.current === null || dragOverItem.current === null) return;

        const draggedItemContent = _priorities[dragItem.current];

        // Remove the item
        _priorities.splice(dragItem.current, 1);

        // Switch the position
        _priorities.splice(dragOverItem.current, 0, draggedItemContent);

        // Reset the position ref
        dragItem.current = null;
        dragOverItem.current = null;

        // Update the actual order
        setPriorities(_priorities);
    };

    const handleSaveOrder = async () => {
        setIsSaving(true);

        // Create update payload with new priority indices (1-indexed)
        const updates = priorities.map((item, index) => ({
            id: item.id,
            priority: index + 1
        }));

        const success = await leaguePriorityService.updateAll(updates);

        if (success) {
            toast({
                title: "Saved",
                description: "New order saved successfully",
            });
            // Update local state to reflect new priority numbers
            setPriorities(prev => prev.map((item, index) => ({
                ...item,
                priority: index + 1
            })));
        } else {
            toast({
                title: "Error",
                description: "Failed to save order",
                variant: "destructive",
            });
        }
        setIsSaving(false);
    };

    return (
        <div className="h-[calc(100vh-2rem)] p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">League Priorities</h1>
                    <p className="text-muted-foreground">
                        Drag and drop leagues to reorder their appearance.
                    </p>
                </div>
                <Button onClick={handleSaveOrder} disabled={isSaving || isLoading}>
                    {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Order</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Available Leagues Column */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                        <CardTitle>Available Leagues</CardTitle>
                        <CardDescription>Search explicitly for leagues to add.</CardDescription>
                        <div className="relative pt-2">
                            <Search className="absolute left-2 top-4.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leagues..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-[calc(100vh-16rem)] px-4">
                            <div className="space-y-2 py-2">
                                {searchQuery.length < 2 && availableLeagues.length > 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-8">
                                        Type at least 2 characters to search...
                                    </p>
                                ) : filteredAvailableLeagues.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-8">
                                        No leagues found matching "{searchQuery}"
                                    </p>
                                ) : (
                                    filteredAvailableLeagues.map((league) => (
                                        <div
                                            key={`${league.name}-${league.country}`}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-medium truncate">{league.name}</span>
                                                <span className="text-xs text-muted-foreground">{league.country}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleAddLeague(league.name)}
                                                disabled={isLoading}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Priority List Column */}
                <Card className="flex flex-col h-full border-2 border-primary/20 bg-muted/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex justify-between items-center">
                            <span>Priority Queue</span>
                            <Badge variant="secondary">{priorities.length} Leagues</Badge>
                        </CardTitle>
                        <CardDescription>Top is highest priority. Drag to reorder.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-[calc(100vh-16rem)] px-4">
                            <div className="space-y-2 py-2">
                                {priorities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground border-2 border-dashed rounded-lg m-4">
                                        <GripVertical className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No pinned leagues yet.</p>
                                        <p className="text-xs">Add leagues from the left panel.</p>
                                    </div>
                                ) : (
                                    priorities.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center justify-between p-3 rounded-lg border bg-background shadow-sm hover:shadow-md transition-all cursor-move relative"
                                            draggable
                                            onDragStart={() => (dragItem.current = index)}
                                            onDragEnter={() => (dragOverItem.current = index)}
                                            onDragEnd={handleSort}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium truncate">{item.league_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveLeague(item.id, item.league_name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
