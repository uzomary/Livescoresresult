//src/components/Header.tsx

import { Search, Menu, MessageSquare, Newspaper, CalendarDays, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSearch, SearchType } from "@/layouts/MainLayout";
import { SearchResults } from "./SearchResults";
import { assets } from "@/assets/images";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const {
    searchQuery,
    setSearchQuery,
    searchType = 'match',
    setSearchType = () => { }
  } = useSearch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const activeTab = location.pathname === '/' ? 'scores' : location.pathname.includes('news') ? 'news' : 'scores';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#001e28] text-white">
      {/* Top Info Bar */}
      <div className="bg-[#00141e] px-4 py-1.5 text-[10px] text-gray-400 truncate border-b border-white/5">
        Football Livescore, Latest Results, Premier League, LaLiga, Seria A
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-transparent">
            <img src='/preloader.png' alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl tracking-wide">LIVESCORESRESULT</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 w-10 h-10"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 w-10 h-10"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex w-full border-t border-white/10">
        <Link
          to="/"
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-wider transition-colors uppercase",
            activeTab === 'scores' ? "text-white bg-[#00141e]" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          SCORES
        </Link>
        <Link
          to="/news"
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-wider transition-colors uppercase",
            activeTab === 'news' ? "text-white bg-[#00141e]" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Newspaper className="w-4 h-4" />
          NEWS
        </Link>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-[#001e28] p-4 border-t border-white/10 shadow-xl" ref={searchContainerRef}>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              className="w-full bg-[#00141e] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 w-full mt-2 bg-[#001e28] border border-white/10 rounded shadow-lg max-h-60 overflow-y-auto z-50">
                <SearchResults />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
