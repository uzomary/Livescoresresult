import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Menu, CalendarDays, Newspaper, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assets } from "@/assets/images";
import { useState, useRef } from 'react';
import { useSearch } from '@/layouts/MainLayout';
import { SearchResults } from './SearchResults';
import { ModeToggle } from './ModeToggle';

interface TopNavigationProps {
    onMenuClick?: () => void;
}

export const TopNavigation = ({ onMenuClick }: TopNavigationProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { searchQuery, setSearchQuery } = useSearch();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const activeTab = location.pathname === '/' ? 'scores' : location.pathname.includes('news') ? 'news' : 'scores';

    return (
        <div className="bg-[#001e28] text-white border-b border-white/5">
            <div className="container mx-auto px-4 h-16 lg:h-24 flex items-center justify-between">
                {/* Left Section: Logo */}
                <Link to="/" className="flex items-center gap-2 mr-8">
                    <div className="w-8 h-8 flex items-center justify-center bg-transparent">
                        <img src={assets.preloader} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-2xl tracking-wide">LiveScoresResult</span>
                </Link>

                {/* Center Section: Tabs */}
                <div className="flex h-full mr-auto">
                    <Link
                        to="/"
                        className={cn(
                            "flex items-center gap-2 px-6 h-full text-sm font-bold tracking-wider transition-colors uppercase border-b-4",
                            activeTab === 'scores' ? "text-white border-red-500 bg-[#00141e]" : "text-gray-400 border-transparent hover:text-white hover:bg-white/5"
                        )}
                    >
                        <CalendarDays className="w-4 h-4" />
                        SCORES
                    </Link>
                    <Link
                        to="/news"
                        className={cn(
                            "flex items-center gap-2 px-6 h-full text-sm font-bold tracking-wider transition-colors uppercase border-b-4",
                            activeTab === 'news' ? "text-white border-red-500 bg-[#00141e]" : "text-gray-400 border-transparent hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Newspaper className="w-4 h-4" />
                        NEWS
                    </Link>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <button
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                setTimeout(() => searchInputRef.current?.focus(), 100);
                            }}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {isSearchOpen && (
                            <div className="absolute top-12 right-0 w-80 bg-[#001e28] border border-white/10 rounded-lg shadow-xl p-3 z-50">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-[#00141e] text-white border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30 mb-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <div className="max-h-60 overflow-y-auto">
                                        <SearchResults />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <ModeToggle />

                    {/* Login */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#002d3c] hover:bg-[#003c50] text-gray-200 rounded-md transition-colors text-xs font-bold tracking-wide">
                        <User className="w-4 h-4" />
                        LOGIN
                    </button>

                    {/* Menu */}
                    <button
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};
