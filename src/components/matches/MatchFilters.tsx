
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Trophy, MapPin, User } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { TeamLogo } from "./TeamLogo";
import { searchEntities } from "@/lib/api-sports";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  type: 'team' | 'player' | 'coach' | 'league' | 'country';
  id: number | string;
  name: string;
  logo?: string;
  country?: string;
  team?: string;
  position?: string;
}

interface MatchFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTeamSelect?: (teamName: string) => void;
}

const filters = ["All", "Live", "Finished", "Upcoming"];

export const MatchFilters = ({ 
  activeFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange,
  onTeamSelect 
}: MatchFiltersProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const results = await searchEntities(query);
      setSearchResults(results);
    } catch (error) {
      // Search failed
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Group results by type for better display
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'team': return 'Teams';
      case 'player': return 'Players';
      case 'league': return 'Leagues';
      case 'country': return 'Countries';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team': return <Users className="h-4 w-4" />;
      case 'player': return <User className="h-4 w-4" />;
      case 'league': return <Trophy className="h-4 w-4" />;
      case 'country': return <MapPin className="h-4 w-4" />;
      default: return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const handleResultClick = (result: SearchResult) => {
    onSearchChange(result.name);
    setShowDropdown(false);
    // You can add more specific actions based on the result type
    // For example, navigate to team/player/league page
    if (onTeamSelect) {
      onTeamSelect(result.name);
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="bg-secondary p-1 rounded-lg flex gap-1">
        {filters.map(filter => (
          <Button 
            key={filter} 
            variant={activeFilter === filter ? "default" : "ghost"}
            onClick={() => onFilterChange(filter)}
            className="px-4 py-1.5 h-auto transition-colors duration-200"
          >
            {filter}
          </Button>
        ))}
      </div>
      
      <div className="relative w-full sm:w-80" ref={dropdownRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          ref={inputRef}
          placeholder="Search teams, players, leagues..." 
          className="pl-10"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
        />
        
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type}>
                    <div className="sticky top-0 z-10 px-3 py-2 text-xs font-semibold text-muted-foreground bg-secondary/80 backdrop-blur-sm flex items-center gap-2 border-b">
                      {getTypeIcon(type)}
                      <span>{getTypeLabel(type)}</span>
                    </div>
                    {items.map((item) => (
                      <button
                        key={`${type}-${item.id}`}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
                        onClick={() => handleResultClick(item)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {item.logo ? (
                            <img 
                              src={item.logo} 
                              alt={item.name} 
                              className="h-6 w-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+'
                              }}
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              {getTypeIcon(type) || <User className="h-3.5 w-3.5" />}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{item.name}</div>
                          {(item.team || item.country) && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.team || item.country}
                              {item.position ? ` • ${item.position}` : ''}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No results found for "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
