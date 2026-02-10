import { ReactNode, useState, createContext, useContext, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { Sidebar } from '@/components/Sidebar';
import { NewsSection } from '@/components/news/NewsSection';
import { assets } from "@/assets/images";
import { TopNavigation } from "@/components/TopNavigation";

export type SearchType = 'match' | 'player';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  clearSearch: () => void;
}

const defaultSearchContext: SearchContextType = {
  searchQuery: '',
  setSearchQuery: () => { },
  searchType: 'match',
  setSearchType: () => { },
  clearSearch: () => { }
};

export const SearchContext = createContext<SearchContextType>(defaultSearchContext);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface MainLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

const MainLayout = ({ children, showMobileNav = true }: MainLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('match');
  const [selectedLeague, setSelectedLeague] = useState<string>('premier-league');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is match details
  const isMatchDetails = location.pathname.startsWith('/match/');

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // League selection handler with navigation
  const handleLeagueSelect = useCallback((leagueId: string) => {
    setSelectedLeague(leagueId);

    // Map league IDs to navigation paths
    const leagueRoutes: Record<string, string> = {
      'world-cup': '/leagues/fifa/world-cup',
      'champions-league': '/leagues/europe/champions-league',
      'europa-league': '/leagues/europe/europa-league',
      'premier-league-england': '/leagues/england/premier-league',
      'laliga': '/leagues/spain/laliga',
      'bundesliga': '/leagues/germany/bundesliga',
      'serie-a': '/leagues/italy/serie-a',
      'ligue-1': '/leagues/france/ligue-1',
      'eredivisie': '/leagues/netherlands/eredivisie',
      'primeira-liga': '/leagues/portugal/primeira-liga',
      'scottish-premiership': '/leagues/scotland/scottish-premiership',
      'belgian-pro-league': '/leagues/belgium/belgian-pro-league',
      'austrian-bundesliga': '/leagues/austria/austrian-bundesliga',
      'fa-cup': '/leagues/england/fa-cup',
      'championship': '/leagues/england/championship',
      'segunda-division': '/leagues/spain/segunda-division',
      'serie-b': '/leagues/italy/serie-b',
      '2-bundesliga': '/leagues/germany/2-bundesliga',
      'ligue-2': '/leagues/france/ligue-2',
      'professional-football-league': '/leagues/nigeria/professional-football-league',
      'africa-cup-of-nations': '/leagues/africa/africa-cup-of-nations',
      'euro': '/leagues/europe/euro-championship',
      'conference-league': '/leagues/europe/uefa-conference-league',
      'uefa-nations-league': '/leagues/europe/uefa-nations-league',
      'copa-america': '/leagues/south-america/copa-america',
      'world-cup-women': '/leagues/fifa/womens-world-cup',
    };

    const route = leagueRoutes[leagueId];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      searchType,
      setSearchType,
      clearSearch
    }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation - Desktop (Full Width at Top) */}
        <div className="hidden lg:block">
          <TopNavigation onMenuClick={toggleMobileMenu} />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <Header onMenuClick={toggleMobileMenu} />
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1">
          {/* Sidebar (Desktop) - Below Header */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
            <Sidebar
              selectedLeague={selectedLeague}
              onLeagueSelect={handleLeagueSelect}
            />
          </div>

          {/* Mobile Sidebar Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden font-sans">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-lg text-[#001e28]">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>
                <div className="h-full overflow-y-auto pb-20">
                  <Sidebar
                    selectedLeague={selectedLeague}
                    onLeagueSelect={handleLeagueSelect}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 flex">
              {/* Content Area */}
              <div className={`flex-1 overflow-y-auto ${isMatchDetails ? 'p-0' : 'px-6 py-6'}`}>
                {children}
              </div>

              {/* News Section */}
              {!['/terms', '/privacy', '/advertise', '/contact'].includes(location.pathname) && (
                <div className="hidden xl:block">
                  <NewsSection />
                </div>
              )}
            </main>
          </div>
        </div>

        <Footer />


      </div>
    </SearchContext.Provider >
  );
};

export default MainLayout;
