import { Link as RouterLink } from "react-router-dom";
import { assets } from "@/assets/images";
import { Facebook, Instagram, Twitter, ArrowUp, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { footerLinkService, FooterLink } from "@/services/footerLinkService";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = '' }: FooterProps) => {
  const [dynamicLinks, setDynamicLinks] = useState<FooterLink[]>([]);
  const [showTextLinks, setShowTextLinks] = useState(false);

  useEffect(() => {
    footerLinkService.getAll().then(setDynamicLinks);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`bg-[#00141e] text-white pt-16 pb-8 border-t border-white/10 mt-auto ${className}`.trim()}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Major Leagues */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-[#e5e7eb]">Major Leagues</h3>
            <div className="flex flex-col space-y-2">
              <RouterLink to="/leagues/england/premier-league" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Premier League</RouterLink>
              <RouterLink to="/leagues/spain/laliga" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">LaLiga</RouterLink>
              <RouterLink to="/leagues/italy/serie-a" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Serie A</RouterLink>
              <RouterLink to="/leagues/germany/bundesliga" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Bundesliga</RouterLink>
              <RouterLink to="/leagues/france/ligue-1" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Ligue 1</RouterLink>
              <RouterLink to="/leagues/europe/champions-league" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Champions League</RouterLink>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-[#e5e7eb]">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <RouterLink to="/" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Live Scores</RouterLink>
              <RouterLink to="/results" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Results</RouterLink>
              <RouterLink to="/news" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">News</RouterLink>
              <RouterLink to="/leagues" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Tables</RouterLink>
              <RouterLink to="/fixtures" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Fixtures</RouterLink>
            </div>
          </div>

          {/* Livescoresresult */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-[#e5e7eb]">LiveScoresResult</h3>
            <div className="flex flex-col space-y-2">
              <RouterLink to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Terms of Use</RouterLink>
              <RouterLink to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Privacy Policy</RouterLink>
              <RouterLink to="/advertise" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Advertise</RouterLink>
              <RouterLink to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors underline decoration-gray-600 hover:decoration-white underline-offset-4">Contact</RouterLink>
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-[#e5e7eb]">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Text Links Holder */}
        <div className="py-2.5 px-4 mb-8 flex flex-col w-full">
          <div className="flex justify-center">
            <button
              onClick={() => setShowTextLinks(!showTextLinks)}
              className="flex items-center gap-2 group transition-colors"
            >
              <span className="font-semibold text-[#ff0046] tracking-wide text-sm">Text Links:</span>
              <span className="text-gray-300 group-hover:text-white flex items-center gap-1 text-sm font-medium">
                {showTextLinks ? 'Hide' : 'Show'}
                {showTextLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
          </div>

          {showTextLinks && (
            <div className="w-full mt-3 pt-3 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
              {dynamicLinks.length > 0 ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
                  {dynamicLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 italic">No text links have been added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center relative">
          <div className="text-center w-full">
            <p className="text-gray-400 text-sm">
              Copyright © <span className="text-white underline decoration-gray-600">Livescoresresult</span> 2026.
            </p>
            <p className="text-gray-600 text-xs mt-1">Fastest Livescore Update</p>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="md:absolute md:right-0 bg-white/10 hover:bg-white/20 text-white rounded-lg p-3 transition-colors mt-4 md:mt-0"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
