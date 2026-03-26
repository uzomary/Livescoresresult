import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the window to the top
    window.scrollTo(0, 0);

    // Also look for any elements with overflow-y-auto that might be the main content container
    // In our case, it's the div with ref={mainContentRef} in MainLayout.
    // Since we don't have easy access to that ref here without context,
    // we can target common scroll containers or use document.documentElement
    
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(container => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
